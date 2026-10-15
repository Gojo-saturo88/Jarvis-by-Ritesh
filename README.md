# Jarvis web app

No server and no API key needed. The AI runs through Puter.js, where each person who uses the app signs in with their own free Puter account and covers their own AI usage.

Files: index.html (the app), manifest.webmanifest + sw.js + icons (make it installable).

## Put it online (free, any one of these)
- Netlify Drop: go to app.netlify.com/drop and drag this folder onto the page.
- GitHub Pages: upload the files to a GitHub repo and turn on Pages.
- Vercel: run `npx vercel` in this folder.

Then open your link and Add to Home Screen (Share menu on iPhone, the ⋮ menu on Android in Chrome).

## Notes
- The first time someone sends a message, a Puter sign-in window opens. Allow pop-ups.
- Usage limits depend on each person's Puter account. See puter.com for current terms.
- Chat history is saved in each person's browser only.
- It must be served over https (all three options above do this); opening the file directly will not install as an app.
