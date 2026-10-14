# leonel-os — Leonel Rosado's portfolio (v2)

An interactive portfolio that boots like an operating system and lets you explore my profile from a terminal: `ls`, `cd`, `cat`, `open`… or just click.

## Commands

```bash
npm install
npm run dev      # Vite dev server
npm test         # Vitest (src/**/*.test.js)
npm run build    # production build to dist/
npm run preview  # serve the production build
```

Copy `.env.example` to `.env` and set `VITE_WEB3FORMS_KEY` so `send-message` can deliver mail. Set the same variable in Vercel → Project → Environment Variables.

## Try it

`help`, `about`, `projects`, `experience`, `skills`, `contact`, `cv`, `send-message`, `lang es`, `theme dracula`, `neofetch`, `reboot`… and a few hidden ones.

## Deploy (Vercel)

This is its own Vercel project, separate from the v1 portfolio at leonelrosado.dev.

1. Vercel → **Add New → Project** → import `LeonelRosado2407/portfolio-terminal`.
2. Name the project `leonel-os`. `vercel.json` already sets the Vite build, so the remaining settings can stay at their defaults.
3. **Environment Variables:** add `VITE_WEB3FORMS_KEY` for Production and Preview (the v1 Web3Forms key works too).
4. Deploy, then go to **Settings → Domains** and add `os.leonelrosado.dev`. The `leonelrosado.dev` DNS already points subdomains at Vercel, like `dulce.` and `nexus.`.
5. Turn on **Analytics** in the project (the app already calls `inject()`).

If the domain ever changes, update the `canonical`, `og:url`, `og:image` and `twitter:image` URLs in `index.html`, plus `public/robots.txt` and `public/sitemap.xml`. `public/og.jpg` is a 1200×630 screenshot of the terminal.
