# Digipincode — Astro + D1 + Workers AI

One site covering all ~6 lakh Indian villages, panchayats, and pincodes.
Worker name: `digipincode` (short, memorable — URL: digipincode.workers.dev)

## Stack
- **Astro SSR** (hybrid: prerender top pages, SSR the long tail) on Cloudflare Workers
- **D1** — pincode, village, and LGD panchayat data (~600K rows ≈ 1 GB, fits free 5 GB)
- **Workers AI** (`skm-ai-worker`) — generates unique village descriptions on a cron
- **Sitemap index + per-state sitemaps** — for Google Search Console
- **DIGIPIN** — 10-digit geolocation codes for villages
- **Feedback widget** — feature requests & updates from visitors

## Setup

```bash
npm install
wrangler d1 create pincode-india        # note the database_id
wrangler d1 execute pincode-india --file=./schema.sql
# import your pincode + LGD data (see data/ folder)
npm run dev
npm run deploy
```

## GitHub auto-deploy

1. Push this repo to GitHub (e.g. `skmstudioservices-cyber/digipincode`)
2. Add two repo secrets:
   - `CLOUDFLARE_API_TOKEN` — API token with Workers Scripts:Edit + D1 permissions
   - `CLOUDFLARE_ACCOUNT_ID` — your account ID
3. Every push to `main` auto-deploys the Astro site AND the AI worker via GitHub Actions (`.github/workflows/deploy.yml`)

## DIGIPIN support
- `villages.digipin` column stores the 10-digit DIGIPIN code
- `digipin` table maps DIGIPIN → lat/lon/pincode/village
- Village pages show DIGIPIN + coordinates when available

## Feedback & Updates widget
- Floating "💡 Feedback & Updates" button at bottom-right
- Two tabs: Feature Request / Updates
- Submissions POST to `/api/feedback` → stored in D1 `feedback` table
- View submissions: `wrangler d1 execute pincode-india --command "SELECT * FROM feedback ORDER BY created_at DESC"`

## Routes
| Route | Type | Content |
|---|---|---|
| `/` | SSR | Home + search |
| `/state/[slug]` | SSR | State → districts |
| `/state/[slug]/[district]` | SSR | District → sub-districts |
| `/state/[slug]/[district]/[subdistrict]` | SSR | Sub-district → villages |
| `/pincode/[pincode]` | SSR | Pincode details + villages + panchayats |
| `/village/[slug]` | SSR | Village + LGD panchayat + AI description + DIGIPIN |
| `/panchayat/[lgd_code]` | SSR | Panchayat details |
| `/search` | SSR | Search across pincodes/villages/panchayats |
| `/api/feedback` | POST | Store feature requests & updates |
| `/sitemap-index.xml` | SSR | Sitemap index |
| `/sitemap-[state].xml` | SSR | Per-state sitemap (50K URLs each) |
| `/robots.txt` | SSR | Allow Google, block AI crawlers |

## AI worker
Deploy separately:
```bash
cd skm-ai-worker
wrangler deploy
```
Cron: every 6 hours, generates ~50 descriptions per run (200/day, within free 10K neurons/day).

## To do
- [ ] Replace `YOUR_D1_DATABASE_ID` in `skm-ai-worker/wrangler.jsonc` and `wrangler.jsonc`
- [ ] Replace `YOUR_SITE_TAG` in `Base.astro` with your Web Analytics site tag
- [ ] Import pincode data (CSV → SQL)
- [ ] Import LGD panchayat data (your GitHub repo)
- [ ] Import DIGIPIN data (if you have the dataset)
- [ ] Set custom domain + submit sitemap to Search Console