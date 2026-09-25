// Per-state sitemap - SSR endpoint. Google allows 50K URLs per sitemap.
// LEAN SITEMAP (25 Sep 2026): only URLs that serve HTTP 200 directly.
//  - sub-districts/villages with EMPTY slugs excluded (they emitted
//    .../tehsil-/... URLs that 301'd - 44% of all requests were these).
//  - villages: must have pincode, top 1000 per state by population.
//  - no <lastmod>: it was "today" for every URL on every build.
// Edge-cached 24h. SV_VERSION busts the edge cache after deploy.
export const prerender = false;

const TALUK_STATES = [
  'andhra-pradesh','telangana','karnataka','kerala','tamil-nadu','puducherry',
  'maharashtra','gujarat','goa','lakshadweep','andaman-and-nicobar-islands',
  'dadra-and-nagar-haveli','dadra-and-nagar-haveli-and-daman-and-diu','daman-and-diu',
];

const SITEMAP_TTL = 60 * 60 * 24;
const SV_VERSION = 'lean1';
const VILLAGES_PER_STATE = 1000;

export async function GET({ params, request, locals }) {
  const cache = (globalThis as any).caches?.default;
  const key = new Request(request.url + '?sv=' + SV_VERSION, { method: 'GET' });
  if (cache) {
    try {
      const hit = await cache.match(key);
      if (hit) return hit;
    } catch {}
  }

  const db = locals.runtime.env.DB;
  const { slug } = params;

  const state = await db.prepare('SELECT id, name FROM states WHERE slug = ?').bind(slug).first();
  if (!state) return new Response('Not found', { status: 404 });

  const base = new URL(request.url).origin;
  const word = TALUK_STATES.includes(slug) ? 'taluk' : 'tehsil';

  const districts = await db.prepare(
    `SELECT slug FROM districts WHERE state_id = ? AND slug IS NOT NULL AND slug != '' ORDER BY name`
  ).bind(state.id).all();

  const subDistricts = await db.prepare(
    `SELECT d.slug AS district_slug, sd.slug AS sd_slug FROM sub_districts sd JOIN districts d ON d.id = sd.district_id WHERE d.state_id = ? AND sd.slug IS NOT NULL AND sd.slug != '' ORDER BY d.name, sd.name`
  ).bind(state.id).all();

  const villages = await db.prepare(
    `SELECT d.slug AS district_slug, sd.slug AS sd_slug, v.slug AS village_slug, v.pincode FROM villages v JOIN sub_districts sd ON sd.id = v.sub_district_id JOIN districts d ON d.id = sd.district_id WHERE d.state_id = ? AND sd.slug IS NOT NULL AND sd.slug != '' AND v.slug IS NOT NULL AND v.slug != '' AND v.pincode IS NOT NULL ORDER BY v.population DESC, v.name LIMIT ?`
  ).bind(state.id, VILLAGES_PER_STATE).all();

  const pincodes = await db.prepare(
    `SELECT DISTINCT d.slug AS district_slug, v.pincode FROM villages v JOIN sub_districts sd ON sd.id = v.sub_district_id JOIN districts d ON d.id = sd.district_id WHERE d.state_id = ? AND v.pincode IS NOT NULL ORDER BY v.pincode`
  ).bind(state.id).all();

  const urls = [
    '/' + slug,
    ...districts.results.map(d => '/' + slug + '/district-' + d.slug),
    ...subDistricts.results.map(x => '/' + slug + '/district-' + x.district_slug + '/' + word + '-' + x.sd_slug),
    ...villages.results.map(x => '/' + slug + '/district-' + x.district_slug + '/' + word + '-' + x.sd_slug + '/village-' + x.village_slug + '/pincode-' + x.pincode),
    ...pincodes.results.map(x => '/' + slug + '/district-' + x.district_slug + '/pincode-' + x.pincode),
  ];

  const body = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(u => '  <url><loc>' + base + u + '</loc></url>').join('\n') + '\n</urlset>';

  const res = new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=' + SITEMAP_TTL + ', s-maxage=' + SITEMAP_TTL,
    },
  });
  if (cache) {
    try {
      const ctx = locals.runtime?.ctx;
      const put = cache.put(key, res.clone());
      if (ctx?.waitUntil) ctx.waitUntil(put); else await put;
    } catch {}
  }
  return res;
}
