// JARVIS AI serverless chat endpoint — Groq primary, Gemini fallback.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

function send(res, status, body) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(body);
}

function normalizeMessages(messages) {
  const allowed = new Set(["system", "user", "assistant"]);
  return messages.map((m) => {
    if (!m || !allowed.has(m.role)) throw new Error("Invalid message role.");
    if (typeof m.content === "string") {
      return { role: m.role, content: m.content.slice(0, 20000) };
    }
    if (Array.isArray(m.content)) {
      const content = m.content.slice(0, 8).map((part) => {
        if (part?.type === "text") return { type: "text", text: String(part.text || "").slice(0, 12000) };
        if (part?.type === "image_url" && /^data:image\/(png|jpeg|jpg|webp);base64,/.test(part.image_url?.url || "")) {
          return { type: "image_url", image_url: { url: part.image_url.url } };
        }
        throw new Error("Unsupported message content.");
      });
      return { role: m.role, content };
    }
    throw new Error("Invalid message content.");
  });
}

async function groqReply(messages, tier, hasImage) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY is not configured.");
  const model = hasImage
    ? (process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct")
    : (tier === "complex"
      ? (process.env.GROQ_COMPLEX_MODEL || "openai/gpt-oss-120b")
      : (process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-20b"));

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, temperature: 0.7, max_completion_tokens: 3072 }),
    signal: AbortSignal.timeout(45000)
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Groq returned ${response.status}`);
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim()) throw new Error("Groq returned an empty answer.");
  return text.trim();
}

async function geminiReply(messages) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is not configured.");
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
  const systemText = messages.filter(m => m.role === "system").map(m => typeof m.content === "string" ? m.content : "").join("\n\n");
  const raw = messages.filter(m => m.role !== "system");
  const contents = [];
  // Gemini expects user/model turns to alternate. Merge adjacent same-role turns.
  for (const m of raw) {
    const role = m.role === "assistant" ? "model" : "user";
    const parts = typeof m.content === "string"
      ? [{ text: m.content }]
      : m.content.map(p => p.type === "text"
          ? { text: p.text }
          : { inline_data: { mime_type: p.image_url.url.match(/^data:(image\/[^;]+);base64,/)?.[1] || "image/jpeg", data: p.image_url.url.split(",")[1] } });
    if (contents.length && contents[contents.length - 1].role === role) contents[contents.length - 1].parts.push(...parts);
    else contents.push({ role, parts });
  }
  // Gemini requires the first content turn to be user.
  while (contents.length && contents[0].role !== "user") contents.shift();
  if (!contents.length) throw new Error("No user message supplied.");
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(systemText ? { systemInstruction: { parts: [{ text: systemText }] } } : {}),
        contents,
        generationConfig: { temperature: 0.7, maxOutputTokens: 3072 }
      }),
      signal: AbortSignal.timeout(45000)
    }
  );
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error?.message || `Gemini returned ${response.status}`);
  const text = (data?.candidates?.[0]?.content?.parts || []).map(p => p.text || "").join("").trim();
  if (!text) throw new Error("Gemini returned an empty answer.");
  return text;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return send(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = req.body || {};
    if (!Array.isArray(body.messages) || body.messages.length < 1 || body.messages.length > 40) {
      return send(res, 400, { error: "Please send between 1 and 40 messages." });
    }
    const messages = normalizeMessages(body.messages);
    const tier = body.tier === "complex" ? "complex" : "chat";
    const hasImage = messages.some(m => Array.isArray(m.content) && m.content.some(p => p.type === "image_url"));

    try {
      const text = await groqReply(messages, tier, hasImage);
      return send(res, 200, { text, reply: text, provider: "groq", fallback: false, searched: false });
    } catch (groqError) {
      console.error("Groq failed; trying Gemini fallback:", groqError.message);
      try {
        const text = await geminiReply(messages);
        return send(res, 200, { text, reply: text, provider: "gemini", fallback: true, searched: false });
      } catch (geminiError) {
        console.error("Gemini fallback failed:", geminiError.message);
        return send(res, 502, {
          error: "Dono AI providers abhi reply nahi de pa rahe. Thodi der baad try karo.",
          details: process.env.NODE_ENV === "development" ? { groq: groqError.message, gemini: geminiError.message } : undefined
        });
      }
    }
  } catch (error) {
    console.error("JARVIS request validation failed:", error.message);
    return send(res, 400, { error: error.message || "Invalid request." });
  }
};
