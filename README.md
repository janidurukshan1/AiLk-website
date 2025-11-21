# AiLK — Search + AI Mode (Demo)

## Quick start (local)
- Frontend: open `index.html` in a static host (or use `npx http-server .`)
- Server (AI MODE): go to `server/`
  - create `.env` with `OPENAI_API_KEY=sk-...`
  - run `npm install`
  - run `node index.js`
- When server runs on `http://localhost:3000`, the frontend will call `/api/chat` (same origin when hosted together; if separate, configure fetch URL).
