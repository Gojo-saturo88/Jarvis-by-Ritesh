JARVIS-by-Ritesh — deployment patch bundle

Included files:
- api/chat.js: Groq primary + Gemini fallback endpoint; returns the `text` field used by the existing app.js.
- glassmorphism.css: glassmorphism theme override.
- service-worker.js: v8 cache update to reduce stale CSS/JS issues.

IMPORTANT: This is a PATCH bundle, not a standalone full website. Keep your existing index.html, app.js, extras.css, extras.js, manifest.json, assets, and other project files.

Apply these changes to the EXISTING project folder:
1. Replace api/chat.js with this bundle's api/chat.js.
2. Copy glassmorphism.css into the project root.
3. In index.html, add this line AFTER the existing style.css and extras.css links:
   <link rel="stylesheet" href="glassmorphism.css">
4. Replace service-worker.js with this bundle's service-worker.js.
5. Deploy the ENTIRE project folder to Vercel (not just this ZIP's extracted folder).

Vercel Environment Variables required:
- GROQ_API_KEY
- GEMINI_API_KEY
Optional:
- GROQ_CHAT_MODEL (default: openai/gpt-oss-20b)
- GROQ_COMPLEX_MODEL (default: openai/gpt-oss-120b)
- GROQ_VISION_MODEL (default: meta-llama/llama-4-scout-17b-16e-instruct)
- GEMINI_MODEL (default: gemini-2.5-flash)

Security:
- Never place API keys in app.js, index.html, or any public file.
- If a key was previously pasted into a chat or committed publicly, rotate it in the provider dashboard.
- This endpoint does not implement live web search; it reports searched:false until a search provider is integrated.
