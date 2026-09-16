#!/usr/bin/env node
// TODO(Antigravity): implement per seo/PLAN-antigravity-brief.md — WS2
// Unit tests for src/lib/digipin.ts — run with: node scripts/test-digipin.mjs
// 1. Pull official test vectors from the India Post DIGIPIN technical documentation
//    (known lat/lng <-> DigiPIN pairs) and assert encode/decode round-trips on each
// 2. Round-trip property check: decode(encode(lat,lng)) is within ~4m of the input
// 3. Edge cases: boundary coords (2.5/63.5 and 38.5/99.5), invalid chars, wrong length
// Exit code 1 on any failure. Wire into package.json as "test": "node scripts/test-digipin.mjs"
// TODO(Antigravity)
