# Fandom Five

A six-team sports hub — BYU football and basketball, the Philadelphia Eagles,
the Utah Jazz, the LA Dodgers and the Utah Mammoth — with live scores, news,
player profiles, mascot analysts, and a BYU football hub with a season
simulator.

The whole app is one component in [`fandom-five.tsx`](./fandom-five.tsx). The
files around it exist only to make that component deployable as a website.

## Running it on your phone

The app is a normal static site plus one serverless function, so any host that
does both will work. These steps use Vercel.

### 1. Get an Anthropic API key

The live features — scores, news, player profiles, the mascot chats — call the
Anthropic API. Create a key at <https://console.anthropic.com>. Keep it
somewhere safe; you'll paste it into Vercel in step 3, and it should never go
in this repo.

### 2. Deploy

```sh
npm install -g vercel
vercel            # first run: link the project, accept the detected settings
```

Vercel detects Vite and finds `api/anthropic.js` automatically. No config file
needed.

### 3. Add the key

```sh
vercel env add ANTHROPIC_API_KEY
```

Paste the key when prompted, and pick all three environments. Then redeploy so
it takes effect:

```sh
vercel --prod
```

### 4. Open it on your phone

Visit the URL Vercel printed. To get an app icon and a full-screen, no-browser-
chrome experience:

- **iPhone** — open in Safari, tap Share, then **Add to Home Screen**
- **Android** — open in Chrome, tap ⋮, then **Add to Home screen**

## Local development

```sh
npm install
npm run dev      # http://localhost:5173
```

The UI works, but **the live features won't** — `npm run dev` serves the
frontend only, so there's no `/api/anthropic` to answer. Every panel handles
that state and shows its "couldn't load" message.

To run the API function too:

```sh
vercel dev       # serves the site and /api/anthropic together
```

Or develop the UI against an already-deployed backend:

```sh
API_ORIGIN=https://your-deployment.vercel.app npm run dev
```

## How the pieces fit

| Path | What it does |
| --- | --- |
| `fandom-five.tsx` | The entire app — every component, all team data, embedded logos |
| `src/main.jsx` | Mounts the app and installs two shims (below) |
| `src/index.css` | Tailwind entry point plus iOS safe-area padding |
| `api/anthropic.js` | Serverless proxy that adds the API key server-side |
| `Team Logos/` | Source art. Not loaded at runtime — logos are embedded as data URIs |
| `archive/` | A frozen July 2026 branch, kept for reference. Not built |

### The two shims

`fandom-five.tsx` was written to run inside a host that provides an async
`window.storage` and lets it call the Anthropic API directly. Neither is true
in a browser, so `src/main.jsx` fills both gaps:

- **Storage** — `window.storage` is backed by `localStorage`, wrapped in
  try/catch so private browsing degrades to defaults instead of throwing.
- **API routing** — `window.__API_URL__` points the app at `/api/anthropic`.

Both are conditional, and the app resolves the API URL per call rather than at
import time, so `fandom-five.tsx` still runs unmodified in its original host.

### Why the API key needs a server

Putting an Anthropic key in frontend code would ship it to every visitor.
`api/anthropic.js` keeps it server-side, and to avoid being an open relay it
only accepts the one model this app uses and caps the request size.

## Notes

- The production bundle is ~700 KB (~350 KB gzipped), mostly the embedded
  logos. Fine over a normal connection; the tradeoff buys zero image requests
  and no broken-logo states.
- Schedules for the Mammoth, Eagles and Jazz are hardcoded 2026-27 dates and
  will go stale. Scores and news are live.
