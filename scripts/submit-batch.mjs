#!/usr/bin/env node
// submit-batch.mjs — B9: rotating batch of ~80 URLs to IndexNow (Bing/Yandex), every run.
// Picks a day-based window so the whole sitemap is cycled over time, keeping each
// run small (fast, reliable) instead of blasting 100k+ URLs at once.
const KEY = 'e26fc0fb7d7041ab8426b5cb01418673';
const HOST = 'digipincode.india-in.workers.dev';
const HOST_URL = `https://${HOST}`;
const UA = `digipincode-indexnow/1.0 (+${HOST_URL}/)`;
const BATCH = 80;

async function get(url) {
  const r = await fetch(url, { headers: { 'User-Agent': UA } });
  return r.ok ? r.text() : '';
}

async function main() {
  const idx = await get(`${HOST_URL}/sitemap-index.xml`);
  const maps = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
  const urls = [];
  for (const sm of maps) {
    const xml = await get(sm);
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(m[1].trim());
  }
  if (!urls.length) {
    console.log('no urls found; aborting');
    return;
  }
  const day = Math.floor(Date.now() / 86400000);
  const start = (day * BATCH) % urls.length;
  const batch = [];
  for (let i = 0; i < Math.min(BATCH, urls.length); i++) batch.push(urls[(start + i) % urls.length]);

  const res = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'User-Agent': UA },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `${HOST_URL}/${KEY}.txt`, urlList: batch }),
  });
  console.log(`IndexNow: ${batch.length} urls submitted (window start ${start}/${urls.length}) -> HTTP ${res.status}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
