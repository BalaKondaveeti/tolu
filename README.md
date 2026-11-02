# tolu

A small home for personal tools. The home screen lists every tool; pick one to open it. Data is stored in Supabase and synced across devices.

**Live:** https://balakondaveeti.github.io/tolu/

## Tools

- **Counter**: as many counters as you like, each with +1 / −1 buttons and a note on top (type or paste). Values and notes sync to Supabase. Taps are batched and applied with an atomic server-side increment, so tapping on two devices never loses a count.

New tools are added to `src/tools.ts` (the home grid is built from that list) plus a page under `src/pages/`.

## Stack

- Vite + React + TypeScript, plain CSS (no UI framework)
- Supabase (Postgres, email + password auth, Row Level Security) via `@supabase/supabase-js`, the only runtime dependency besides React
- Hash routing (`#/`, `#/counter`, `#/counter/<id>`, `#/settings`) with a tiny hook in `src/lib/useHashRoute.ts`
- GitHub Pages, deployed by GitHub Actions on every push to `main`

## Run locally

```sh
npm install
npm run dev      # http://localhost:5173
npm run lint
npm run build    # outputs dist/
```

## Supabase setup

The app uses the shared project `yxwqmwvelpjwwlvrpvki`. Its URL and publishable key are built in as `DEFAULT_CONFIG` in `src/lib/config.ts`.

1. Run the tolu SQL in the project's **SQL Editor**. It is intentionally not kept in this repo; each tool's SQL is shared privately when the tool is added. The tables are `tolu_counters` (plus the `tolu_counter_bump` function) and `tolu_wakeup_quotes`, all with Row Level Security.
2. Open the app and use **Create account** on the sign-in screen (any existing login for this Supabase project also works).
3. Then turn sign-ups off: **Authentication → Sign In / Providers → Allow new users to sign up → off**.

Only the publishable (anon) key is ever in the client. Data is protected by Row Level Security (each row is only visible to its owner) plus sign-ups being disabled, not by hiding the key. Never put a `service_role` / secret key in this app.

To point one browser at a different Supabase project, use **Change Supabase project** on the sign-in screen or in Settings. The override is kept in that browser's localStorage only.

If the free project pauses after about a week of inactivity, the app shows a notice with a **Restore in Supabase** link and a **Retry** button. Cached data stays visible meanwhile.

## Data and caching

- Query results are cached in localStorage per user (`tolu:cache:<user>:…`) and shown instantly, then refreshed when older than an hour, when the app returns to the foreground, or via the "Updated Xm ago ↻" pill.
- Every write invalidates the cache and refetches.
- Sign-out clears that user's cache.
- All localStorage keys start with `tolu:` because every app on `balakondaveeti.github.io` shares one origin.
- On first sign-in, an empty account gets one starter counter.

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`, which lints, builds and publishes `dist/` to GitHub Pages. Pages must be set to **Source: GitHub Actions** (already done for this repo). `vite.config.ts` uses `base: './'`, so the build works under any repo name.

## Restyle

Every color, gradient, font, radius, shadow and spacing value is a CSS variable in `src/theme.css`, with a light set and a dark set (`prefers-color-scheme`). `src/styles.css` only references those tokens, so changing the look means editing one file. Chart and category colors use a fixed, colorblind-safe palette (`--cat-1` … `--cat-8`, `--cat-neutral`).

The app icon is `public/icon.svg`; the PNGs next to it (192, 512, Apple touch) are rendered from it.
