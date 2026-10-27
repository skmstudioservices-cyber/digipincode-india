# EmDash migration — DigiPinCode

Branch: `feat/emdash` · **Do not merge to main until the preview passes.**
Prepared 2026-10-27.

## Current stack
- Astro ^5.0.0, `@astrojs/cloudflare` ^12.0.0, `output: "server"`
- D1 binding `DB` = pincode-india-db, plus SEO_DB
- Worker: `digipincode` (existing — **no new worker**)

## What EmDash needs
| Item | Why | Our action |
|---|---|---|
| Astro 6+ | EmDash requires it | upgrade astro 5 -> 6 |
| `@astrojs/react` + `react`, `react-dom` | EmDash **admin UI** is React (public pages unaffected) | add |
| `emdash` + `@emdash-cms/cloudflare` | core + Cloudflare adapters | add |
| D1 binding `DB` | already exists | reuse |
| R2 binding `MEDIA` | media uploads (no filesystem on Workers) | create bucket `digipincode-media` |
| `src/worker.ts` entry | scheduled handler + plugin bridge | add |
| `src/live.config.ts` | `emdashLoader()` live collection | add |
| Cron trigger | scheduled publishing | add |

## Steps (in order, each verified before the next)
1. `git checkout -b feat/emdash`
2. Upgrade: `astro@^6`, `@astrojs/cloudflare@^14`
3. `npm run build` — **must pass before continuing**
4. Add `@astrojs/react`, `react`, `react-dom`; register `react()` in astro.config
5. Add `emdash` + `@emdash-cms/cloudflare`; register `emdash({ database: d1({binding:"DB"}), storage: r2({binding:"MEDIA"}) })`
6. Create R2 bucket `digipincode-media`; add binding `MEDIA`
7. Add `src/worker.ts` (scheduled handler) + `src/live.config.ts`
8. `npm run build` again — must pass
9. Deploy to a **preview** (separate worker name or `wrangler versions upload`), never production
10. Visit `/_emdash/admin`, complete setup wizard, publish one test page
11. Verify public pages still render (compare 5 URLs before/after)
12. Only then open a PR to main

## Risks
- **Astro 5 -> 6** may break existing routes, the Cloudflare adapter API, or prerender flags.
- **Worker entry change** (`main`) can break the SSR output if it does not match the adapter.
- **D1 read cost**: EmDash is SSR — every admin/public request hits D1. pincode-india-db is already over the 5M rows/day free cap. EmDash tables must live in a **separate small D1**, not pincode-india-db.
- R2 is a new resource (free tier 10 GB).

## Decision needed before step 5
EmDash content should use a **dedicated D1** (e.g. `digipincode-cms-db`), NOT `pincode-india-db`.
Reason: keep the huge pincode table out of the CMS read path.
