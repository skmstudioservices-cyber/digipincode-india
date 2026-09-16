# AGENTS.md — rules for AI coding agents (Antigravity) in this repo

## First: read the plan
`seo/PLAN-antigravity-brief.md` is the single source of truth for the current build. Read it fully before writing any code. The keyword dataset `seo/gsc-pincode-keywords.csv` drives priorities.

## Workflow
- Work on branch `antigravity-build` — do NOT commit to main.
- Build in workstream order: WS1 city pages → WS2 digipin tools → WS3 distance tool → WS4 my-location locator (see the brief).
- `npm install && npm run build` must pass before every push, and `dist/_worker.js/index.js` must exist after build.
- Small, focused commits. Never force-push.
- Scaffold files with `TODO(Antigravity)` headers already exist in this branch — fill them in; do not relocate or delete them.

## Hard constraints
- **FREE TIER ONLY** — no R2, no Cloudflare Images, no Queues, no paid Workers features.
- **NO data.gov.in / GODL datasets** (branding decision, no attribution wanted). Use only the existing D1 data.
- **DO NOT TOUCH**: `skm-ai-worker/`, `public/.assetsignore`, `public/robots.txt`, `wrangler.jsonc`, `.github/workflows/*`, `astro.config.mjs`, `package.json` version pins. Astro 5 + @astrojs/cloudflare ^12 is LOCKED — adapter 14+ emits a Workers-only layout that breaks this Pages-style deploy.
- Read `schema.sql` before writing any D1 query — use the exact table/column names it defines.
- SSR everywhere: no client-side fetch for main content; 1–2 D1 queries per page; no N+1 loops.
- City pages built in order of `search_interest` descending in `seo/gsc-pincode-keywords.csv`.

## Model settings (for the human driving Antigravity)
- Planning / task breakdown: Gemini 3 Pro (Agent Manager), thinking ON (high).
- Astro pages & components (templated work): Claude Sonnet 4.5 (Artifacts), thinking OFF.
- DigiPIN algorithm, D1 schema/migrations, hard debugging: Claude Opus 4.5 (Artifacts), thinking ON.
- Mechanical work (sitemap entries, CSV scripts, formatting): Gemini Flash, thinking OFF.
