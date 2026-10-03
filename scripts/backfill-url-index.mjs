// scripts/backfill-url-index.mjs — BLOCK:URL-PATH-COLUMN
// Builds url_index rows (flat slug -> hierarchy) from D1 dumps. Writes SQL.
import fs from 'node:fs';
const slugify = (s) => String(s ?? '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const read = (f) => { try { const r = JSON.parse(fs.readFileSync(f, 'utf8')); return (r[0] && r[0].results) || r.results || []; } catch { return []; } };
const esc = (s) => String(s ?? '').replace(/'/g, "''");

const states = read('states.json'), districts = read('districts.json'),
      subs = read('subdistricts.json'), pins = read('pincodes.json');

const rows = [];
for (const s of states) rows.push([`${slugify(s.name)}-pin-codes`, 'state', s.slug, null, null, null, null]);
for (const d of districts) rows.push([`${slugify(d.name)}-district-pin-codes-${slugify(d.state_name)}`, 'district', d.state_slug, d.slug, null, null, null]);
for (const t of subs) rows.push([`${slugify(t.name)}-subdistrict-pin-codes-${slugify(t.district_name)}-${slugify(t.state_name)}`, 'subdistrict', t.state_slug, t.district_slug, t.slug, null, null]);
for (const p of pins) rows.push([`pin-code-${p.pincode}-${slugify(p.taluk || p.office_name || '')}-${slugify(p.district_name)}-${slugify(p.state_name)}`, 'pincode', p.state_slug, p.district_slug, null, null, p.pincode]);

const seen = new Set();
const out = ["CREATE TABLE IF NOT EXISTS url_index (url_path TEXT PRIMARY KEY, kind TEXT, state_slug TEXT, district_slug TEXT, sub_slug TEXT, village_slug TEXT, pincode TEXT);",
  "CREATE INDEX IF NOT EXISTS idx_url_index_path ON url_index(url_path);"];
for (const r of rows) { if (seen.has(r[0])) continue; seen.add(r[0]);
  out.push(`INSERT OR IGNORE INTO url_index (url_path,kind,state_slug,district_slug,sub_slug,village_slug,pincode) VALUES ('${esc(r[0])}','${r[1]}','${esc(r[2])}','${esc(r[3])}','${esc(r[4])}','${esc(r[5])}','${esc(r[6])}');`); }
fs.writeFileSync('url-index.sql', out.join('\n') + '\n');
console.log('url_index rows:', seen.size, '| states', states.length, 'districts', districts.length, 'subdistricts', subs.length, 'pincodes', pins.length);
