#!/usr/bin/env node
// IndexNow bulk submit — reads the full sitemap and submits all URLs to api.indexnow.org
// Batches of 10,000 (protocol limit), 2s delay between requests.
// NOTE: a proper User-Agent is REQUIRED — api.indexnow.org returns 403 to node's default UA.
const KEY = 'e26fc0fb7d7041ab8426b5cb01418673';
const HOST_URL = 'https://digipincode.india-in.workers.dev';
const HOST = 'digipincode.india-in.workers.dev';
const UA = 'digipincode-indexnow/1.0 (+https://digipincode.india-in.workers.dev/)';

async function submit(batch) {
  const res = await fetch('https://api.indexnow.org/IndexNow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'User-Agent': UA,
    },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: `${HOST_URL}/${KEY}.txt`,
      urlList: batch,
    }),
  });
  return res;
}

async function main() {
  console.log('Fetching sitemap index…');
  const idxRes = await fetch(`${HOST_URL}/sitemap-index.xml`, { headers: { 'User-Agent': UA } });
  if (!idxRes.ok) throw new Error(`sitemap-index HTTP ${idxRes.status}`);
  const idx = await idxRes.text();
  const sitemaps = [...idx.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
  console.log(`Found ${sitemaps.length} sitemap files`);

  const urls = [];
  for (const sm of sitemaps) {
    const res = await fetch(sm, { headers: { 'User-Agent': UA } });
    if (!res.ok) { console.log(`  ! ${sm}: HTTP ${res.status}`); continue; }
    const xml = await res.text();
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) urls.push(m[1].trim());
  }
  console.log(`Total URLs: ${urls.length}`);
  if (urls.length === 0) throw new Error('no URLs found');

  const BATCH = 10000;
  let ok = 0, fail = 0;
  for (let i = 0; i < urls.length; i += BATCH) {
    const batch = urls.slice(i, i + BATCH);
    let res = await submit(batch);
    if (res.status === 429 || res.status >= 500) {
      console.log(`  HTTP ${res.status} — retrying in 30s…`);
      await new Promise(r => setTimeout(r, 30000));
      res = await submit(batch);
    }
    if (res.ok) ok++; else fail++;
    console.log(`Batch ${Math.floor(i / BATCH) + 1}/${Math.ceil(urls.length / BATCH)}: HTTP ${res.status} (${batch.length} URLs)`);
    await new Promise(r => setTimeout(r, 2000));
  }
  console.log(`DONE — batches ok=${ok} fail=${fail}, URLs=${urls.length}`);
  if (fail > 0) process.exitCode = 1;
}

main().catch(e => { console.error(e); process.exit(1); });
