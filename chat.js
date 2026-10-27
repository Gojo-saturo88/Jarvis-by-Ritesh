const hits = new Map();

function limited(ip) {
  const now = Date.now();
  const windowHits = (hits.get(ip) || []).filter(t => now - t < 600000);
  windowHits.push(now);
  hits.set(ip, windowHits);
  return windowHits.length > 30;
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    return res.status(500).json({
      error: "Server is missing OPENROUTER_API_KEY. Add it in Vercel Project Settings > Environment Variables."
    });
  }

  const requiredCode = process.env.ACCESS_CODE;
  if (requiredCode && req.headers["x-access-code"] !== requiredCode) {
    return res.status(401).json({ error: "Wrong or missing access code." });
  }

  const ip = (req.headers["x-forwarded-for"] || "unknown").split(",")[0].trim();
  if (limited(ip)) return res.status(429).json({ error: "Too many requests. Wait a few minutes." });

  const { messages, tier } = req.body || {};
  const valid = Array.isArray(messages) && messages.length > 0 && messages.length <= 40 &&
    messages.every(m => m &&
      ["user", "assistant", "system"].includes(m.role) &&
      typeof m.content === "string" && m.content.length < 12000);

  if (!valid) return res.status(400).json({ error: "Bad request." });

  const model = tier === "complex"
    ? (process.env.SITE_MODEL || "openai/gpt-4o")
    : (process.env.CHAT_MODEL || "openai/gpt-4o-mini");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://jarvisbyritesh88.vercel.app",
        "X-OpenRouter-Title": "JARVIS by Ritesh"
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: tier === "complex" ? 2500 : 900,
        stream: false
      })
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("OpenRouter error", response.status, data?.error?.message || "unknown");
      return res.status(response.status === 429 ? 429 : 502).json({
        error: response.status === 429
          ? "AI limit reached. Please try again later."
          : "OpenRouter returned an error. Check model access and API key settings."
      });
    }

    const answer = data.choices?.[0]?.message?.content;
    if (typeof answer !== "string") {
      return res.status(502).json({ error: "The AI returned an empty response." });
    }

    return res.status(200).json({
      text: answer,
      truncated: data.choices?.[0]?.finish_reason === "length",
      usage: data.usage || null
    });
  } catch (error) {
    console.error("OpenRouter request failed", error?.message || error);
    return res.status(502).json({ error: "Could not reach OpenRouter." });
  }
};
