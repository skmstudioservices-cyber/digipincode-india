# DATA.md — what's in the D1 `pincode-india-db` database (reference for agents)

## STANDING RULES (owner-mandated)
1. **All databases in India region** — D1 = `--location apac` (India is not offered for D1; apac/Singapore is the closest allowed). Supabase = Mumbai (ap-south-1). KV = global edge. Never create a DB in a US/EU region.
2. **Naming convention:** D1 names end with `-db` (e.g. `pincode-india-db`, `mapsnearme-db`); KV namespaces end with `_KV` (e.g. `SESSION_KV`, `MAPSNEARME_ADS_KV`).

## Current contents
- **`pincode-india-db`** (id 74274a3f-9fca-42ec-9fbf-c707ffbc56a4, region **APAC**) — the NEW primary, being seeded via `.github/workflows/d1-apply.yml` (daily 00:35 UTC, budget-aware).
- **`pincode-india`** (id 908096d2-3de5-43eb-8fdb-88252e3ac2e8, region wnam — legacy) — still bound to the live Worker; will be deleted after the apac DB is fully seeded and the binding flips.

Data (identical in both during migration), populated 2026-09-16 from the owner's KB datasets (All-India pincode list + state village lists):

| Table | Rows (grows daily*) | Notes |
|---|---|---|
| states | 37 | census codes + slugs, all India |
| districts | 805 | union of census + India Post districts, deduped by (state, slug) |
| sub_districts | 4,203 | census codes, from village lists |
| pincodes | 19,586 | all unique India pincodes: office name/type, delivery, division/region/circle, lat/lon, district_id, state_id |
| villages | 384,479 target | 19 states (Delhi, Goa, A&N, Tripura, Arunachal, J&K, HP, Haryana, Chhattisgarh, Gujarat, Uttarakhand, Assam, AP, WB, Jharkhand, MH, Bihar, UP + All-Villages). Fields: name, globally-unique slug, pincode, census_code, sub_district_id |

\* D1 free tier allows ~100,000 row writes/day **per database** — each DB has its own limit, so seeding the new apac DB does not waste the old one's quota. The apply workflow counts existing rows and only applies what fits the budget. Re-dispatch daily until all 384k villages are in (script prints how many rows remain).

## Cutover checklist (when pincode-india-db is fully seeded)
1. Update `wrangler.jsonc` d1 binding `database_name`/`database_id` → `pincode-india-db` / 74274a3f-9fca-42ec-9fbf-c707ffbc56a4
2. Update `deploy.yml` migration step to target `pincode-india-db`
3. Deploy + verify site pages
4. Delete old `pincode-india` (wnam) via cf-infra cleanup

## How this maps to the site
- `/pincode/{pincode}` — 19,586 pages from `pincodes`
- `/state/{slug}`, `/state/{slug}/{district}`, `/{district}/{subdistrict}` — from states/districts/sub_districts
- `/village/{slug}` — villages (slug is globally unique)
- WS1 city pages (`src/data/cities.json`) — build it from D1: `SELECT district, state, COUNT(*) ... GROUP BY` joined with `pincodes` lat/lon; priority order from `seo/gsc-pincode-keywords.csv`

## Useful queries
```sql
-- villages for a pincode
SELECT v.name, v.slug, d.name AS district FROM villages v
  JOIN sub_districts s ON s.id = v.sub_district_id
  JOIN districts d ON d.id = s.district_id
  WHERE v.pincode = '110001';

-- all pincodes in a district
SELECT pincode, office_name, office_type, lat, lon FROM pincodes
  WHERE district_id = (SELECT id FROM districts WHERE slug = 'aligarh');
```

## Notes
- Village rows have no lat/lon yet (source CSV didn't include coordinates) — skm-ai-worker can backfill via pincode coords later.
- Missing states for villages (Karnataka, Kerala, MP, Odisha, Punjab, Rajasthan, TN, Telangana...) — owner will add KB lists; regenerate the seed the same way (the pattern: KB CSV -> INSERT OR IGNORE SQL chunks -> release asset -> d1-apply workflow).
- `mapsnearme-db` (id 03a74322-da9e-485d-af1c-e73249d19039, apac) — reserved for the mapsnearme site's ads + internal analytics events.
