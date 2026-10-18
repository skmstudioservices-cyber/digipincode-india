#!/usr/bin/env node
/**
 * bing-pull.mjs — Bing Webmaster keyword data -> JSON (for the sheet's Bing tab).
 *
 * Bing Webmaster has NO OAuth — an API key alone is sufficient.
 * Key comes from the repo secret BING_WEBMASTER_API_KEY (never hardcode it).
 *
 * Docs: https://learn.microsoft.com/bingwebmaster/
 * Endpoints used:
 *   GetUserSites                       -> list verified sites
 *   GetQueryStats?siteUrl=...          -> queries (impressions/clicks/position)
 *   GetRankAndTrafficStats?siteUrl=... -> daily impressions/clicks
 *
 * Output: writes bing-data.json  { generated, sites: [{site, queries:[...], daily:[...]}] }
 */
import fs from 'node:fs';

const KEY = process.env.BING_WEBMASTER_API_KEY;
const BASE = 'https://ssl.bing.com/webmaster/api.svc/json';
const OUT = 'bing-data.json';

if (!KEY) {
  console.error('BING_WEBMASTER_API_KEY not set — skipping Bing pull.');
  process.exit(0);
}

async function api(path, params = {}) {
  const qs = new URLSearchParams({ apikey: KEY, ...params }).toString();
  const res = await fetch(`${BASE}/${path}?${qs}`, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`${path} -> HTTP ${res.status}`);
  const j = await res.json();
  return j.d ?? j;
}

async function main() {
  const out = { generated: new Date().toISOString(), sites: [] };
  let sites = [];
  try {
    sites = await api('GetUserSites');
  } catch (e) {
    console.error('GetUserSites failed:', String(e).slice(0, 120));
    sites = [];
  }
  console.log(`Bing sites: ${sites.length}`);
  for (const s of sites) {
    const url = s.Url || s.url;
    if (!url) continue;
    let queries = [], daily = [];
    try { queries = (await api('GetQueryStats', { siteUrl: url })).slice(0, 200); } catch (e) { console.log(`  queries fail ${url}`); }
    try { daily = await api('GetRankAndTrafficStats', { siteUrl: url }); } catch (e) {}
    out.sites.push({ site: url, queries, daily });
    console.log(`  ${url}: ${queries.length} queries, ${daily.length} daily rows`);
  }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2));
  console.log(`Wrote ${OUT} (${out.sites.length} sites)`);
}
main().catch(e => { console.error('WARN:', String(e).slice(0, 140)); process.exit(0); });
