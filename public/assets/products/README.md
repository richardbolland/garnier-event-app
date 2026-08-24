# Product photography

Drop real product shots in here with these **exact filenames** — the app
already points to them via `src/data/products.ts`, so nothing else needs to
change once you do:

| Filename | Product |
|---|---|
| `vitamin-c-sorbet.png` | Garnier Vitamin C Sorbet Cream |
| `fast-action-sorbet.png` | Garnier Fast Action Sorbet |
| `matte-finish-sorbet.png` | Garnier Matte Finish Sorbet |
| `smooth-skin-sorbet.png` | Garnier Smooth Skin Sorbet |
| `ultralight-sorbet.png` | Garnier Ultralight Sorbet |

**Recommended spec:** square (1:1) PNG or JPG, at least 800×800px, on a
clean/transparent or white background — they're displayed in a rounded
square frame on the results screen. Keep individual files under ~500KB
where possible (use [squoosh.app](https://squoosh.app) or similar to
compress) since everything gets cached for offline use and bundled into
every deploy.

If you rename a product or add a 6th one, also update
`src/data/products.ts` and `src/data/defaultQuestions.ts` /
the Google Sheet's `category` column to match.

Until real photos are added, the app shows generated placeholder swatches
in the brand yellow so the layout and flow can be reviewed end-to-end.
