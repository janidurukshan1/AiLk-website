# AiLK — Demo Search Website

This repository contains a small demo search site (AiLK) built with plain HTML, CSS and JavaScript.
Features: Google-style homepage + results, voice search (Web Speech API), Google autocomplete suggestions, tabs (All / Images / News / Videos), dark/light mode, and a "Share on WhatsApp" button.

## Files
- `index.html` — homepage + results
- `assets/style.css` — styling (responsive + dark mode)
- `assets/app.js` — main JS (suggestions, voice, tabs, share)

## Run locally
1. Clone or download the repo.
2. Serve with a static server for best results:
   - `npx http-server` (or)
   - `python -m http.server 8000`
3. Open `http://localhost:8080` (or the port shown).

> Note: Google suggestions endpoint may be blocked by CORS in some environments. If suggestions fail, they will silently fall back to none. For production, proxy suggestions from your backend.

## Publish on GitHub Pages
1. Create a new repo on GitHub (e.g. `ailk-demo`).
2. Push these files to `main`.
3. In repo Settings → Pages → Deploy from `main` branch → select root (`/`).
4. After a minute GitHub Pages will publish your site at `https://<your-username>.github.io/<repo>`.

## Share on WhatsApp
Click the **Share on WhatsApp** button in the top right — it opens WhatsApp Web / Mobile with a prefilled message containing the page URL.

## License
Demo project — adapt and use freely.
