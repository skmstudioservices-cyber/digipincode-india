#!/usr/bin/env node
/** count-pages.mjs — total pages per site, read from each live sitemap. */
import fs from 'node:fs';

const sites = JSON.parse(fs.readFileSync('bing-sites.json', 'utf8')).sites;

async function urlsFor(site) {
  const seen = new Set();
  const out = new Set();
  const queue = [`${site}sitemap.xml`];
  while (queue.length) {
    const u = queue.shift();
    if (seen.has(u) || seen.size > 30) continue;
    seen.add(u);
    let r;
    try { r = await fetch(u, { redirect: 'follow' }); } catch { continue; }
    if (!r.ok) continue;
    const body = await r.text();
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    if (/<sitemapindex/.test(body)) queue.push(...locs);
    else locs.forEach((l) => out.add(l));
  }
  return out;
}

const rows = [];
for (const site of sites) {
  const urls = await urlsFor(site);
  rows.push({ site, total: urls.size });
  console.log(`${site}\t${urls.size}`);
}
const sum = rows.reduce((s, r) => s + r.total, 0);
console.log(`TOTAL_SITES=${rows.length}`);
console.log(`TOTAL_PAGES=${sum}`);
fs.writeFileSync('page-counts.json', JSON.stringify(rows, null, 2));
