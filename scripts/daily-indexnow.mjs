#!/usr/bin/env node
// scripts/daily-indexnow.mjs — DAILY rotating per-URL submission (IndexNow).
// Why: individual URL submission indexes faster than a bulk sitemap. Google has
// NO programmatic per-URL API for general pages (Indexing API is JobPosting/
// BroadcastEvent only), so per-URL submission goes to the IndexNow partners
// (Bing, Yandex, Seznam, Naver). Google still gets the sitemap + internal links.
//
// Rotates by day-of-year: each day submits the next ~500-URL slice, so the whole
// catalogue cycles through and fresh/updated URLs are always pinged.
const KEY = 'e26fc0fb7d7041ab8426b5cb01418673';
const HOST_URL = 'https://digipincode.india-in.workers.dev';
const HOST = 'digipincode.india-in.workers.dev';
const UA = 'digipincode-indexnow/1.0 (+https://digipincode.india-in.workers.dev/)';
const SLICE = Number(process.env.SLICE || 500);

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!r.ok) throw new Error(`${url} -> HTTP ${r.status}`);
  return r.text();
}
async function submit(urls) {
  const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: `${HOST_URL}/${KEY}.txt`, urlList: urls });
  for (const ep of ['https://api.indexnow.org/IndexNow', 'https://www.bing.com/indexnow']) {
    try {
      const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', 'User-Agent': UA }, body });
      console.log(`  ${ep} -> HTTP ${r.status} (${urls.length} urls)`);
      if (r.ok || r.status === 200 || r.status === 202) return true;
    } catch (e) { console.log(`  ${ep} ERR ${String(e).slice(0, 80)}`); }
  }
  return false;
}
async function main() {
  // The live index is served at /sitemap-index.xml; fall back to /sitemap.xml.
  let idx = "";
  for (const u of [`${HOST_URL}/sitemap-index.xml`, `${HOST_URL}/sitemap.xml`]) {
    try { idx = await get(u); console.log(`index: ${u}`); break; } catch (e) { console.log(`  ${u} -> ${String(e).slice(0,60)}`); }
  }
  if (!idx) throw new Error('no sitemap index reachable');
  const parts = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
  if (!parts.length) throw new Error('no sitemap parts');
  const doy = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000);
  const part = parts[doy % parts.length];
  console.log(`day-of-year ${doy} -> part ${part}`);
  const xml = await get(part);
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim()).slice(0, SLICE);
  console.log(`submitting ${urls.length} URLs`);
  const ok = await submit(urls);
  console.log(ok ? 'DONE ok' : 'DONE FAILED');
  if (!ok) process.exitCode = 1;
}
main().catch(e => { console.error(e); process.exitCode = 1; });
