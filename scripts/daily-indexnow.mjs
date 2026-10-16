#!/usr/bin/env node
// scripts/daily-indexnow.mjs — DAILY rotating per-URL submission (IndexNow), robust.
// Individual-URL pings index faster than a bulk sitemap. Google has no per-URL
// API for general pages, so this targets IndexNow partners (Bing, Yandex,
// Seznam, Naver); Google keeps the sitemap + internal links.
//
// Hardened 16 Oct 2026: retries with backoff, multiple index URLs, and it NEVER
// fails the workflow on a transient blip (exits 0 with a warning instead).

const KEY = 'e26fc0fb7d7041ab8426b5cb01418673';
const HOST_URL = 'https://digipincode.india-in.workers.dev';
const HOST = 'digipincode.india-in.workers.dev';
const UA = 'digipincode-indexnow/1.0 (+https://digipincode.india-in.workers.dev/)';
const SLICE = parseInt(process.env.SLICE || '500', 10);

async function get(u, tries = 4) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(u, { headers: { 'User-Agent': UA } });
      if (res.ok) return await res.text();
      last = new Error(`${u} -> HTTP ${res.status}`);
    } catch (e) { last = e; }
    await new Promise(r => setTimeout(r, 1500 * (i + 1)));
  }
  throw last;
}

async function submit(urls) {
  const body = JSON.stringify({ host: HOST, key: KEY, keyLocation: `${HOST_URL}/${KEY}.txt`, urlList: urls });
  for (const endpoint of ['https://api.indexnow.org/IndexNow', 'https://www.bing.com/indexnow']) {
    try {
      const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8', 'User-Agent': UA }, body });
      if (res.status >= 200 && res.status < 300) return { endpoint, status: res.status };
      console.log(`  ${endpoint} -> HTTP ${res.status}`);
    } catch (e) { console.log(`  ${endpoint} -> ${String(e).slice(0, 80)}`); }
  }
  return null;
}

async function main() {
  let idx = '';
  for (const u of [`${HOST_URL}/sitemap.xml`, `${HOST_URL}/sitemap-index.xml`]) {
    try { idx = await get(u); console.log(`index: ${u}`); break; }
    catch (e) { console.log(`  ${u} -> ${String(e).slice(0, 70)}`); }
  }
  if (!idx) {
    console.log('WARN: no sitemap index reachable after retries — transient; exiting 0 so the run is not marked failed.');
    process.exit(0);
  }
  const parts = [...idx.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]).filter(u => u.includes('/sitemap/'));
  if (!parts.length) { console.log('WARN: sitemap index had no child parts; exiting 0.'); process.exit(0); }
  const doy = Math.floor((Date.now() - Date.UTC(new Date().getUTCFullYear(), 0, 0)) / 86400000);
  const part = parts[doy % parts.length];
  console.log(`part: ${part}`);
  let xml = '';
  try { xml = await get(part); } catch (e) { console.log(`WARN: part fetch failed (${String(e).slice(0,70)}); exiting 0.`); process.exit(0); }
  let urls = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map(m => m[1]);
  urls = urls.slice(0, SLICE);
  if (!urls.length) { console.log('WARN: no URLs in part; exiting 0.'); process.exit(0); }
  const r = await submit(urls);
  console.log(r ? `OK submitted ${urls.length} URLs via ${r.endpoint} (HTTP ${r.status})` : `WARN: all IndexNow endpoints failed; exiting 0.`);
  process.exit(0);
}

main().catch(e => { console.log('WARN:', String(e).slice(0, 120), '— exiting 0'); process.exit(0); });
