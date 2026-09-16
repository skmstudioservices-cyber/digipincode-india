# digipincode-india — GSC Keyword Expansion Build Brief

**For:** AI coding agent (Antigravity) working on repo `skmstudioservices-cyber/digipincode-india`
**Goal:** Turn real search-demand data (Google Trends / GSC exports from our Blogger pincode site) into new pages and tools that capture those queries.
**Stack:** Astro 5 (output: 'server', SSR) + Cloudflare Workers + D1 database `pincode-india` (binding `DB` in `wrangler.jsonc`). Deploys automatically on push via Cloudflare Workers Builds.

---

## 1. Current repo structure (already exists — do not restructure)

```
digipincode-india/
├── astro.config.mjs            # Astro 5 + @astrojs/cloudflare adapter 12, output: 'server'
├── wrangler.jsonc              # main: dist/_worker.js/index.js, assets: ./dist, D1 binding DB
├── schema.sql                  # D1 schema (READ THIS FIRST — check exact column names)
├── package.json                # astro ^5, @astrojs/cloudflare ^12
├── public/                     # robots.txt, .assetsignore (DO NOT DELETE .assetsignore)
├── skm-ai-worker/              # separate AI cron worker — DO NOT TOUCH
└── src/
    ├── components/FeedbackWidget.ts
    ├── layouts/Base.astro
    ├── lib/db.ts               # D1 query helpers
    └── pages/
        ├── index.astro                     # homepage
        ├── search.astro                     # ?q= search
        ├── states.astro                     # all states index
        ├── state/[slug].astro               # state page
        ├── state/[slug]/[district].astro    # district page
        ├── state/[slug]/[district]/[subdistrict].astro
        ├── pincode/[pincode].astro          # single pincode page (155k+ pages)
        ├── village/[slug].astro
        ├── panchayat/[lgd_code].astro
        ├── api/feedback.ts
        └── sitemap-index.xml.ts + sitemap-[slug].xml.ts   # sitemap system — extend, don't replace
```

## 2. Keyword data (the demand signal)

`seo/gsc-pincode-keywords.csv` — 151 deduplicated, cleaned queries from Google Trends Explore exports (June–Sep 2026, IN). Columns: `query, search_interest, change_pct, source, category`.

Five categories, by demand:

| Category | Count | Top queries (interest, trend) |
|---|---|---|
| **geo** (city/area pincode) | 104 | delhi 76, noida 52, bangalore 45, hyderabad 41, chennai 40, mumbai 37, gurgaon 33, jaipur 32, pune 31, coimbatore 31 … plus long-tail localities: gachibowli, kakkanad, marathahalli, dilsukhnagar, edappal (+3450%), ottapalam (+250%), sivakasi (+150%), vijayawada (Breakout) |
| **digipin** | 34 | india digipin 100, digipin india 96, india post digipin 70, know your digipin 45, digipin portal 30 (+200%), what is digipin 23, postal digipin (+250%), digipin of my location (+170%) |
| **locator** | 7 | my pincode 100, my location pincode 47, pincode of my location 35, current pincode 33, pincode near me 26 |
| **distance** | 3 | pincode to pincode distance 42 (+30%), pincode distance 28, pin to pin distance (+30%) |
| **other** | 2 | pincode delhi 73 (reverse word order — same intent as delhi pincode) |

Common misspellings in real queries — handle via content variants, NOT separate pages: *banglore, ahemdabad, trivandrum, tiruppur/tirupur, digi pin*.

**One query is a literal pincode: "201301"** — confirms /pincode/[pincode] pages already capture demand; city pages should deep-link to them.

## 3. Build plan — 4 workstreams (in priority order)

### WS1 — City hub pages (biggest gap, 104 queries)
People search `<city> pincode` but the site has no `/city/*` route.

**Create:**
- `src/pages/city/index.astro` — all cities index (linked from homepage footer)
- `src/pages/city/[slug].astro` — one page per city. Sections:
  1. H1: `{City} Pin Code — Complete List` + intro (state, district count, pincode count)
  2. Table/grid of ALL pincodes in that city (deep-link each to `/pincode/{pincode}`)
  3. Popular areas subsection (for locality queries: e.g. `Gachibowli, Hyderabad`)
  4. FAQ block (schema.org FAQPage JSON-LD) using real query phrasings: "What is the pincode of {City}?", "How many pincodes are there in {City}?", "{City} pincode list"
  5. Internal links: state page, district pages, 5–10 nearby cities
- `src/lib/cities.ts` — canonical city list + slugify + alias map (misspellings → canonical)
- `scripts/build-city-index.mjs` — one-time Node script: reads D1 export (or `wrangler d1 execute` output) of `SELECT district, state, COUNT(*) ... GROUP BY` and writes `src/data/cities.json` (name, slug, state, district(s), pincodeCount, priority = keyword interest from the CSV). Run locally by a maintainer with D1 access, output committed to repo.
- `migrations/0002_city_seo.sql` — only if needed for fast city lookups (e.g. index on district/name columns). Read `schema.sql` first; the pincode table likely already has district + state columns.

**SEO rules:** title `{City} Pin Code List 2026 | All Pincodes of {City}, {State}`; meta description with count; slug = lowercase-dashed; noindex only empty pages. Every page must render server-side from D1 (no client fetch for the main table).

### WS2 — DigiPIN tools + landing (34 queries, several Breakout)
`india digipin` (100), `digipin portal` (+200%), `know your digipin`, `what is digipin`, `digipin of my location` — the site is literally named digipincode but has NO digipin route.

**Create:**
- `src/pages/digipin/index.astro` — landing: what is DigiPIN (India Post's 10-character digital address, ~4m grid), how to get yours, FAQ, big CTA to the lookup tool
- `src/pages/digipin/[pincode].astro` — DigiPIN for a given pincode area (encode from lat/long of the pincode row)
- `src/pages/api/digipin/encode.ts` — POST {lat, lng} → DigiPIN (10-char)
- `src/pages/api/digipin/decode.ts` — POST {digipin} → {lat, lng}
- `src/lib/digipin.ts` — pure-TS implementation of the official India Post DigiPIN algorithm (10-char, ~4m grid). **CRITICAL: implement from the official India Post / DOT spec with test vectors; unit-test it.** Also: "digipin of my location" → wire a "Use my location" button (browser Geolocation API → encode API).

### WS3 — Pincode-to-pincode distance tool (3 queries, +30% trend)
- `src/pages/tools/pincode-distance.astro` — two inputs (from-pincode, to-pincode) → distance in km + straight-line note. Server API: `src/pages/api/distance.ts` — POST {from, to} → haversine over lat/long columns in D1. Result page URL `?from=110001&to=560001` so it's indexable/linkable.

### WS4 — "My pincode" locator on homepage (7 queries, "my pincode" = 100)
- On `index.astro`: "Find pincode of my location" card → browser Geolocation → `src/pages/api/nearest-pincode.ts` (POST {lat,lng} → nearest pincode rows by lat/long distance, LIMIT 5) → render result with deep links. Graceful no-geolocation fallback = search box.

## 4. Final target file structure (new files marked +)

```
src/
├── data/
│   └── cities.json                      (+ generated by scripts/build-city-index.mjs)
├── lib/
│   ├── db.ts                            (existing)
│   ├── cities.ts                        (+)
│   └── digipin.ts                       (+ pure algorithm + tests)
├── pages/
│   ├── city/index.astro                 (+)
│   ├── city/[slug].astro                (+)
│   ├── digipin/index.astro              (+)
│   ├── digipin/[pincode].astro          (+)
│   ├── tools/pincode-distance.astro     (+)
│   ├── api/
│   │   ├── feedback.ts                  (existing)
│   │   ├── digipin/encode.ts            (+)
│   │   ├── digipin/decode.ts            (+)
│   │   ├── distance.ts                   (+)
│   │   └── nearest-pincode.ts           (+)
│   ├── sitemap-index.xml.ts             (extend: add city + digipin + tools entries)
│   └── sitemap-[slug].xml.ts            (extend)
└── (everything else unchanged)
scripts/
└── build-city-index.mjs                 (+ Node script, run manually, output committed)
migrations/
└── 0002_city_seo.sql                    (+ only if index needed)
seo/
├── gsc-pincode-keywords.csv             (committed — source of truth for priorities)
└── PLAN-antigravity-brief.md            (this file)
```

## 5. Verification (do before pushing)

1. `npm install && npm run build` — must pass, `dist/_worker.js/index.js` must exist.
2. `wrangler dev` locally with D1 binding — check: `/city/delhi`, `/city/bangalore`, `/digipin`, `/digipin/110001`, `/tools/pincode-distance?from=110001&to=560001`, `/api/digipin/encode`.
3. DigiPIN unit tests against official test vectors (add `npm test` script).
4. Push to `main` triggers the real deploy; then verify `https://digipincode.india-in.workers.dev/city/delhi` returns 200.

## 6. Constraints

- **Free tier only.** No paid Cloudflare features (no R2, no Cloudflare Images, no Queues).
- **No data.gov.in / GODL datasets** (branding decision — attribution not wanted). Use only the existing D1 data.
- **Do not touch**: `skm-ai-worker/`, `public/.assetsignore`, `wrangler.jsonc` main/assets config, the `mapsnearme` deployment workflows in `.github/workflows/`, or any other repo.
- Keep pages fast: one or two D1 queries per page, no N+1 loops, cache-friendly HTML.
- City page priority order = `search_interest` descending in `seo/gsc-pincode-keywords.csv` (build cities.json sorted by it).
