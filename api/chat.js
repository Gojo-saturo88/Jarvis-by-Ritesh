const hits = new Map();

function limited(ip) {
  const now = Date.now();
  const w = (hits.get(ip) || []).filter(t => now - t < 600000);
  w.push(now);
  hits.set(ip, w);
  return w.length > 30;
}

module.exports = async (req, res) => {
  if (req.method !== "POST")
    return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key)
    return res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY." });

  const need = process.env.ACCESS_CODE;
  if (need && req.headers["x-access-code"] !== need)
    return res.status(401).json({ error: "Wrong or missing access code." });

  const ip = (req.headers["x-forwarded-for"] || "x").split(",")[0].trim();
  if (limited(ip))
    return res.status(429).json({ error: "Too many requests. Wait a few minutes." });

  const { messages, tier } = req.body || {};
  const ok = Array.isArray(messages) &&
    messages.length > 0 &&
    messages.length <= 60 &&
    messages.every(m =>
      m &&
      (m.role === "user" || m.role === "assistant") &&
      typeof m.content === "string" &&
      m.content.length < 60000
    );

  if (!ok)
    return res.status(400).json({ error: "Bad request." });

  const site = tier === "complex";
  const model = site
    ? (process.env.SITE_MODEL || "claude-sonnet-5-5")
    : (process.env.CHAT_MODEL || "claude-haiku-5-5");

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        max_tokens: site ? 4500 : 2500,
        messages
      })
    });

    const d = await r.json();

    if (!r.ok) {
      console.error("Anthropic error", r.status, JSON.stringify(d));
      return res.status(r.status === 429 ? 429 : 502).json({
        error: r.status === 429
          ? "The AI is busy. Try again soon."
          : "The AI service returned an error."
      });
    }

    const text = (d.content || [])
      .filter(b => b.type === "text")
      .map(b => b.text)
      .join("");

    res.status(200).json({
      text,
      truncated: d.stop_reason === "max_tokens"
    });
  } catch (e) {
    console.error(e);
    res.status(502).json({ error: "Could not reach the AI service." });
  }
};
