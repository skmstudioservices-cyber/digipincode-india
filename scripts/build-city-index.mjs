#!/usr/bin/env node
// TODO(Antigravity): implement per seo/PLAN-antigravity-brief.md — WS1
// One-time generator: produces src/data/cities.json
// 1. Reads D1 via `wrangler d1 execute pincode-india --remote --json --command "..."`
//    (maintainer runs this locally with Cloudflare access) OR reads a local CSV export
//    of: city/district name, state, pincode, per row
// 2. Groups by city -> { name, slug, state, districts[], pincodeCount }
// 3. Joins priority from seo/gsc-pincode-keywords.csv: <city> pincode -> search_interest
//    (cities with no keyword get priority 0, sorted last)
// 4. Writes src/data/cities.json sorted by priority desc — commit the output to the repo
// Usage: node scripts/build-city-index.mjs [--d1 | path-to-csv]
// TODO(Antigravity)
