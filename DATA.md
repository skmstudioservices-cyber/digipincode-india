# DATA.md — what's in the D1 `pincode-india` database (reference for agents)

## Current contents
Populated 2026-09-16 from the owner's KB datasets (All-India pincode list + state village lists):

| Table | Rows (grows daily*) | Notes |
|---|---|---|
| states | 37 | census codes + slugs, all India |
| districts | 805 | union of census + India Post districts, deduped by (state, slug) |
| sub_districts | 4,203 | census codes, from village lists |
| pincodes | 19,586 | all unique India pincodes: office name/type, delivery, division/region/circle, lat/lon, district_id, state_id |
| villages | 384,479 target | 19 states (Delhi, Goa, A&N, Tripura, Arunachal, J&K, HP, Haryana, Chhattisgarh, Gujarat, Uttarakhand, Assam, AP, WB, Jharkhand, MH, Bihar, UP + All-Villages). Fields: name, globally-unique slug, pincode, census_code, sub_district_id |

\* D1 free tier allows ~100,000 row writes/day. Seed is applied via `.github/workflows/d1-apply.yml` (workflow_dispatch) using the release asset `d1-data-v1/d1-populate-sql.zip` — it counts existing rows first and only applies what fits the budget. Re-dispatch daily until all 384k villages are in (script prints how many rows remain).

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
