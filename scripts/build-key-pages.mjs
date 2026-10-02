// scripts/build-key-pages.mjs
// BLOCK:KEY-PAGES-300 — builds the priority indexing list (states + top districts).
import fs from 'node:fs';
const raw = JSON.parse(fs.readFileSync('districts.json', 'utf8'));
const rows = (raw[0] && raw[0].results) || raw.results || [];
const base = 'https://digipincode.india-in.workers.dev';
const states = new Set(), urls = [];
for (const r of rows) {
  if (r.s_slug && !states.has(r.s_slug)) { states.add(r.s_slug); urls.push(`${base}/${r.s_slug}/`); }
  if (r.s_slug && r.d_slug) urls.push(`${base}/${r.s_slug}/district-${r.d_slug}/`);
}
fs.writeFileSync('key-pages-300.txt', urls.join('\n') + '\n');
console.log('key pages:', urls.length, '| states:', states.size);
