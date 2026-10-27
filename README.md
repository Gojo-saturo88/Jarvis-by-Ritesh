# JARVIS 3.0 Upgrade Pack

This is an **upgrade overlay**, not a complete copy of the original repository. It contains:
- `jarvis-live.css`: purple liquid-glass responsive visual layer with an animated orb.
- `api/chat.js`: server-side OpenRouter chat endpoint (API key stays on the server).
- `patch_index.py`: adds the stylesheet link to your existing `index.html` and creates a backup.

## Apply the UI upgrade
1. Extract this ZIP into your existing JARVIS project folder.
2. Keep your current `index.html`; run:
   `python patch_index.py index.html`
3. Confirm the new file is at the project root as `jarvis-live.css`.
4. Deploy to Vercel and check the preview before production.

## OpenRouter setup
1. Revoke the API key that was shared in chat; create a fresh key.
2. In Vercel → Project → Settings → Environment Variables, add `OPENROUTER_API_KEY` with the new key for Production (and Preview if needed).
3. Add optional `CHAT_MODEL` (default `openai/gpt-4o-mini`) and `SITE_MODEL` (default `openai/gpt-4o`) only if those models are available on your OpenRouter account.
4. The included `api/chat.js` replaces the old Anthropic route. **Your current frontend must call `/api/chat` using the `{messages, tier}` request shape** for this endpoint to power chat. The existing frontend may still call Puter.js; this ZIP does not automatically rewrite the full chat logic, voice features, PDF features, or streaming behavior.
5. If you have `ACCESS_CODE` configured, keep it as-is; the route checks the `x-access-code` request header.

## Important notes
- No API key is included in this ZIP.
- This endpoint currently returns a complete response, not token-by-token streaming.
- Keep a copy of your original project before replacing any files.
- Check `api/chat.js` model IDs against your OpenRouter account; provider model availability and pricing can change.
