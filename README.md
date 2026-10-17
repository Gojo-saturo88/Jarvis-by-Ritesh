# JARVIS AI by Ritesh

A futuristic, mobile-friendly AI assistant in a single `index.html`. The AI runs through Puter.js: no server and no API key. Each user signs in with their own Puter account.

## Features
- Holographic HUD look: spinning reactor core, scan lines, cyan glow. Animations stop when the phone asks for reduced motion.
- Modes: General, Maths, Code, Writing, Study, Translate, Creative, Website builder.
- Chat: typing indicator, timestamps, Copy / Listen / Regenerate on every answer, Stop button, saved history (last 20 chats), photo questions, live web search for current-events questions, custom name and instructions (gear button).
- Voice: microphone input (where the browser supports it), spoken replies, auto-speak option, Stop voice button, clear mic-permission messages.
- Student tools (Tools sidebar): notes with Summarize and Quiz me, task list.
- Privacy: Delete chat history, Clear this chat, Delete all my data (each asks for confirmation).
- Offline banner and clear error messages. Failed requests never show as successful answers.

## Files
index.html (the whole app), sw.js, manifest.webmanifest, icon-192.png, icon-512.png, icon.svg.
The old `api/` folder and `vercel.json` are not used any more and can be deleted.

## Run / deploy
Serve the folder over https (Vercel, Netlify or GitHub Pages) and open it. For a quick local test: `python3 -m http.server` in this folder, then open http://localhost:8000.
Add to Home Screen to install it like an app.

## Data and privacy
- Saved only in your browser (localStorage): chats, notes, tasks, theme, custom instructions, voice setting.
- Messages go to Puter and the AI provider to get an answer. Web-search questions use a search tool. Photos you attach are sent the same way.
- Voice input uses the browser's speech service, which may process audio online.
- No passwords, tokens or API keys are stored in the app.

## Known limitations
- Needs internet and a free Puter account for AI replies. Usage limits depend on the Puter account.
- Voice input and spoken replies depend on the browser and the voices installed on the phone.
- Attached photos are not kept in saved history.
- Chat history is per browser and per device.
