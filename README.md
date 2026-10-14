# Jarvis web app

Files: index.html (the app), api/chat.js (server that calls the AI), manifest + sw.js (make it installable), vercel.json.

## Deploy on Vercel (free plan works)
1. Get an API key at console.anthropic.com (needs a few dollars of credit; this is separate from claude.ai).
2. Make a free account at vercel.com.
3. Upload this folder: either push it to a GitHub repo and import it in Vercel, or run `npx vercel` inside the folder.
4. In Vercel > Project > Settings > Environment Variables, add:
   - ANTHROPIC_API_KEY = your key (required)
   - ACCESS_CODE = a password only you and friends know (strongly recommended, otherwise anyone with the link spends your credit)
   - Optional: CHAT_MODEL, SITE_MODEL to change models
5. Redeploy, open your Vercel link, then Add to Home Screen (Share menu on iPhone, ⋮ menu on Android).

## Notes
- Website builds can take 30-60 seconds. Vercel Hobby stops functions at 60 seconds.
- Chat history is saved in each person's browser only.
- Set a spending limit in the Anthropic console.
