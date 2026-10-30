# JARVIS by Ritesh — v2

Complete starter project for a responsive neon cyan/purple glassmorphism AI workspace.

## Deploy
1. Put `index.html`, `style.css`, `app.js`, `package.json`, and `vercel.json` in the repository root. Keep `api/chat.js` inside the `api` folder.
2. In Vercel → Project → Settings → Environment Variables, add:
   - `GROQ_API_KEY` = your Groq API key
   - `GEMINI_API_KEY` = your Google AI Studio Gemini API key
   - `GROQ_CHAT_MODEL` = `openai/gpt-oss-20b` (optional)
   - `GROQ_COMPLEX_MODEL` = `openai/gpt-oss-120b` (optional)
   - `GEMINI_MODEL` = `gemini-2.5-flash` (optional)
3. Redeploy the project after saving environment variables.

## Included
- Groq primary AI chat and Gemini fallback
- Optional Gemini Google Search grounding mode
- Responsive glassmorphism dashboard and chat UI
- Browser speech recognition voice input (browser support and microphone permission required)
- YouTube search shortcut
- Print-to-PDF conversation export

## Important limits
- Live search requires a compatible Gemini model/account and available quota. If Gemini search fails, the API can fall back to Groq, but that answer is not live-searched.
- The YouTube feature opens search results; it does not auto-play videos.
- A normal website cannot freely open arbitrary apps or place phone calls. These need device APIs, permissions, and often a native app.
- Never commit API keys. Store them only in Vercel environment variables.
