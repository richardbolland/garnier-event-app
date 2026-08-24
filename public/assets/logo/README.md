# Logo assets

Drop the real Garnier brand files in here with these **exact filenames** —
the app already references them, so nothing else needs to change once you do:

| Filename | Use | Notes |
|---|---|---|
| `garnier-logo.svg` | Main logo, shown on the yellow background | SVG preferred (crisp at any size). PNG works too — just also update the extension referenced in `src/components/BrandLogo.tsx`. |
| `garnier-logo-white.svg` | White/light version | For any future dark-background screens. |

Until these are replaced, the app shows a plain text "Garnier" wordmark
placeholder so you can see where the logo sits in the layout.

## Adding more branding

If you want additional branding elements (a logo watermark on the swipe
cards, a footer lock-up, a splash/loading screen logo, etc.), drop the
files in this folder and ping me (or your dev) to wire them into
`src/components/SoftLifeApp.tsx` — the layout has room built in around the
header and footer areas.

## App icons (for offline/installable mode)

The kiosk installs as a "PWA" (add-to-homescreen style app) so it can run
fullscreen and offline. It needs square PNG icons at these sizes, based on
the Garnier logo/brandmark:

- `public/assets/icons/icon-192.png` — 192×192px
- `public/assets/icons/icon-512.png` — 512×512px
- `public/assets/icons/icon-512-maskable.png` — 512×512px, logo centered
  with ~20% padding on all sides (Android "maskable" icon safe zone)

Placeholder icons are already generated so the build works out of the box —
swap them for branded versions whenever you're ready.
