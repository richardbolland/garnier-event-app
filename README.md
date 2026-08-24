# Garnier Soft Life Match-Up

A swipe-to-match touchscreen kiosk built for a Garnier event: visitors
swipe through mood-based questions for 20 seconds, and the app recommends
a Garnier Sorbet Cream based on their answers.

Built with Vite + React + TypeScript + Tailwind CSS, ships as an installable
offline-first PWA, and is deployed via GitHub Pages.

## Quick start (local development)

```bash
npm install
cp .env.example .env   # optional — see Google Sheet setup below
npm run dev
```

Open the printed local URL. Resize your browser to portrait / narrow
widths (or use your browser's device toolbar in phone/tablet portrait
mode) to preview the kiosk layout — see "Vertical / responsive layout"
below.

## Project structure

```
src/
  components/
    SoftLifeApp.tsx    # main screen state machine (menu / playing / results)
    SwipeCard.tsx       # draggable question card
    BrandLogo.tsx        # renders the logo asset, falls back gracefully if missing
  data/
    products.ts          # the 5 product recommendations + image paths
    defaultQuestions.ts   # bundled offline fallback question deck
  lib/
    questionSource.ts     # Google Sheet fetch -> cache -> bundled-default logic
    csv.ts                 # tiny CSV parser (no external dependency)
  types.ts

public/
  assets/
    logo/       # brand logo files (placeholder until real ones are dropped in)
    products/    # product photography (placeholder until real ones are dropped in)
    icons/        # PWA install icons

docs/
  GOOGLE_SHEET_SETUP.md    # full walkthrough for wiring up the copywriter's Sheet
  questions-template.csv    # starter template matching the expected columns

.github/workflows/deploy.yml   # auto-deploys to GitHub Pages on push to main
```

## Editing questions (Google Sheet)

Questions are meant to be edited by your copywriter in a Google Sheet, not
in code. Follow **[docs/GOOGLE_SHEET_SETUP.md](./docs/GOOGLE_SHEET_SETUP.md)**
to set that up — it covers the exact column format, publishing the sheet,
and how the offline fallback behaves.

Short version of the fallback chain, so this never breaks on-site:

1. **Live fetch** from the published Sheet CSV, if configured — refreshes
   the local cache on every successful load.
2. **Last cached copy** (stored on-device) — used automatically the moment
   there's no internet.
3. **Bundled defaults** shipped in the code — used only if the app has
   never once successfully fetched from the Sheet.

Question order is fully reshuffled (Fisher–Yates) at the start of every
play, so no two rounds feel identical.

## Branding & product assets

The app currently ships with clearly-labeled **placeholder** assets so the
full flow can be reviewed end-to-end before real files exist:

- **Logo:** [`public/assets/logo/README.md`](./public/assets/logo/README.md)
- **Product photography:** [`public/assets/products/README.md`](./public/assets/products/README.md)

Drop your files in using the exact filenames documented there and nothing
else needs to change — the app already points at those paths.

## Vertical / responsive layout

The layout is built portrait-first (the expected orientation for the event
display) and scales fluidly using `dvh`/relative units and Tailwind's
responsive breakpoints, so it also holds up reasonably in landscape or on
a desktop browser for testing. If the kiosk hardware turns out to need
specific pixel dimensions locked down (e.g. a fixed 1080×1920 monitor),
let your dev know the exact resolution and the container sizing in
`src/components/SoftLifeApp.tsx` can be tightened to match exactly.

## Offline support (PWA)

This is configured as a full offline-capable Progressive Web App via
`vite-plugin-pwa`:

- On first successful load (with internet), a service worker caches the
  entire app shell — code, styles, fonts, and all image assets.
- After that, the kiosk works with **zero connectivity** — it can be
  "installed" (Add to Home Screen, or launched fullscreen) and will keep
  running through wifi drop-outs for the rest of the event.
- The question data has its own independent offline fallback chain (see
  above) so a stale-but-recent question set is always available even
  without the Sheet being reachable.

**Before the event:** load the app once on the actual kiosk device while
it has a solid internet connection, so the service worker and the latest
questions both get cached. After that, it's safe to run fully offline.

## Deployment (GitHub Pages)

Every push to `main` builds and deploys automatically via
`.github/workflows/deploy.yml` using GitHub's official Pages Actions.

One-time setup after the repo is created:

1. Repo → **Settings → Pages** → under "Build and deployment", set
   **Source** to "GitHub Actions" (should already be the default once the
   workflow runs once).
2. If using the Google Sheet, add a repository secret:
   Repo → **Settings → Secrets and variables → Actions → New repository
   secret** → name `VITE_SHEET_CSV_URL`, value = your published CSV URL.
3. Push to `main` (or re-run the workflow manually from the Actions tab).

The site will be live at:

```
https://hellostudiobo.github.io/garnier-event-app/
```

### Custom domain

Once you've bought a domain:

1. In your DNS provider, add either:
   - A `CNAME` record pointing your subdomain (e.g. `event.yourdomain.com`)
     at `hellostudiobo.github.io`, **or**
   - The four GitHub Pages `A` records if using an apex/root domain (see
     [GitHub's docs](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
     for the current IPs).
2. In the repo: **Settings → Pages → Custom domain**, enter your domain,
   save (this creates a `CNAME` file in the repo automatically, or you can
   add `public/CNAME` yourself with the domain as its only contents).
3. Because a custom domain serves from the site root instead of
   `/garnier-event-app/`, also set a repository **variable** (not secret):
   Repo → **Settings → Secrets and variables → Actions → Variables** →
   add `VITE_BASE_PATH` = `/`. Re-run the deploy workflow after.
4. Tick "Enforce HTTPS" once GitHub finishes provisioning the certificate
   (can take up to ~24h after DNS propagates).

## Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Local dev server with hot reload |
| `npm run build` | Type-check + production build to `dist/` |
| `npm run preview` | Serve the production build locally to sanity-check before deploying |
| `npm run lint` | Lint the codebase |
