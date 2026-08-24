import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves project sites from /<repo-name>/ unless a custom
  // domain + CNAME file is set up (see README "Custom domain" section).
  // The deploy workflow sets VITE_BASE_PATH to "/garnier-event-app/".
  // Once you attach a custom domain, drop this env var (or set it to "/")
  // and redeploy.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'assets/logo/*.svg',
        'assets/logo/*.png',
        'assets/products/*.png',
        'assets/products/*.svg',
      ],
      manifest: {
        name: 'Garnier Soft Life Match-Up',
        short_name: 'Soft Life Match-Up',
        description:
          'Swipe-to-match kiosk experience that recommends a Garnier Sorbet Cream based on your mood.',
        theme_color: '#FFDF2D',
        background_color: '#FFDF2D',
        display: 'fullscreen',
        orientation: 'portrait',
        icons: [
          {
            src: 'assets/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'assets/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'assets/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Cache everything the app shell needs so the kiosk works with
        // zero connectivity after the first successful load.
        globPatterns: ['**/*.{js,css,html,svg,png,jpg,jpeg,woff2}'],
        runtimeCaching: [
          {
            // Cache the Google Sheet CSV so a stale-but-recent copy of the
            // questions is available offline. Network-first: always try to
            // get the freshest questions, fall back to cache when offline.
            urlPattern: /^https:\/\/docs\.google\.com\/spreadsheets\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sheet-questions-cache',
              networkTimeoutSeconds: 4,
              expiration: {
                maxEntries: 4,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
})
