# Google Sheet setup — copywriter question editing

The app reads its question deck from a published Google Sheet at runtime,
caches it locally, and falls back to a bundled copy if there's no
connection. This doc explains how to set that Sheet up once, so your
copywriter can then edit questions any time without needing to touch code
or redeploy.

## 1. Create the Sheet

1. Create a new Google Sheet (or use an existing one).
2. Rename the first tab to `Questions`.
3. Set up exactly these three column headers in row 1 (order doesn't
   matter, but the names must match, lowercase or not — the app
   lowercases everything):

   | question | category | active |
   |---|---|---|

   A ready-made starting point is in [`questions-template.csv`](./questions-template.csv)
   in this repo — open it, select all, copy, and paste into cell A1 of
   your Sheet (Google Sheets will split it into columns automatically via
   File → Import, or paste-special → "Split text to columns").

4. Fill in rows below the header:
   - **question** — the exact text shown on the card, e.g. `Going for a long hike today?`
   - **category** — must be exactly one of:
     `HYDRATION`, `QUICK_ABSORB`, `OIL_CONTROL`, `PORE_REDUCING`, `LIGHTWEIGHT`, `SOFTLIFE`
     (all caps, underscore not space). Any other value, or a blank
     category, causes that row to be skipped.
   - **active** — `TRUE` to include the question, `FALSE` to hide it
     without deleting it. Leaving this blank also counts as active.

You can have as many rows as you like — the app shuffles them into a
random order every time someone plays.

### The SOFTLIFE category

`SOFTLIFE` questions work differently from the 5 product categories, and
are never used to pick the recommended product — they sit above the
product logic and produce a separate "Soft Life" verdict shown alongside
the result.

**Write every SOFTLIFE question so a genuinely "soft life" person would
answer NO** — e.g. `Do you work late most nights?`, `Do you check emails
first thing when you wake up?`. If someone swipes NO (left) on every
SOFTLIFE question they saw, the app shows "You're Living the Soft Life."
Swipe YEAH (right) on even one, and it shows the softer "Soft Life... in
Progress" instead. If no SOFTLIFE question happens to come up in a given
round (the deck is shuffled and rounds are short), the badge is simply
skipped for that play rather than showing a misleading result.

Mix in as many or as few SOFTLIFE rows as you like alongside the product
questions — they shuffle into the same deck.

## 2. Publish the sheet as CSV

The app needs a public read-only CSV link (not the normal edit link).

1. In Google Sheets: **File → Share → Publish to web**.
2. Under "Link", choose the `Questions` sheet (not "Entire document") and
   set the format to **Comma-separated values (.csv)**.
3. Click **Publish**, confirm, and copy the generated URL. It looks like:

   ```
   https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=0&single=true&output=csv
   ```

   > Note: "Publish to web" is different from the regular "Share" button —
   > it makes that one sheet viewable (not editable) by anyone with the
   > link, which is what lets the kiosk fetch it without anyone logging
   > in. It does **not** expose the rest of the spreadsheet, and it does
   > not let random visitors edit anything.

## 3. Wire the URL into the app

1. Copy `.env.example` to `.env` in the project root (this file is
   git-ignored, so it's local-only) and paste the published CSV URL:

   ```
   VITE_SHEET_CSV_URL="https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?output=csv"
   ```

2. For the **deployed** kiosk build, add the same value as a GitHub
   Actions secret named `VITE_SHEET_CSV_URL` (Repo → Settings → Secrets
   and variables → Actions → New repository secret). The deploy workflow
   (`.github/workflows/deploy.yml`) already reads this secret in and
   bakes it into the production build.
3. Redeploy (push to `main`, or re-run the workflow) once the secret is set.

## 4. How live edits behave on the kiosk

- Every time the app loads (e.g. kiosk restarts, or someone refreshes),
  it tries to fetch the latest CSV. If that succeeds, it updates the
  local cache immediately — so a copywriter's edit shows up the next time
  the app is opened while online.
- If there's no internet at that moment, the app silently uses the last
  successful copy it cached, so the kiosk never breaks mid-event.
- If the app has *never* successfully fetched (e.g. very first run,
  offline out of the box), it falls back to the bundled default question
  set shipped in the code (`src/data/defaultQuestions.ts`).

If you want the questions to definitely be up to date on event day
without relying on venue wifi, load the app once on the kiosk device
while it has a good connection before doors open — that fetch gets
cached and will hold for the rest of the event even if wifi drops.

## Troubleshooting

- **Sheet edits aren't showing up:** confirm you edited the *published*
  sheet/tab, and that "Publish to web" is still active (Google
  occasionally requires re-confirming Automatically republish when
  changes are made — that checkbox is on by default and should be left
  checked).
- **A question isn't appearing:** check its `category` value is spelled
  exactly right and `active` isn't `FALSE`.
- **Testing locally:** run `npm run dev` with `.env` set — check the
  bottom of the start screen in dev mode, which shows where the question
  data came from (`network`, `cache`, or `bundled-default`).
