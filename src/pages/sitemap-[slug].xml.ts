// Per-state sitemap — SSR endpoint. Google allows 50K URLs per sitemap.
// URL structure v2 — hierarchy paths for pincode, village, district and sub-district pages.
export const prerender = false;

// South & western states use "taluk", the rest use "tehsil".
const TALUK_STATES = [
  'andhra-pradesh','telangana','karnataka','kerala','tamil-nadu','puducherry',
  'maharashtra','gujarat','goa','lakshadweep','andaman-and-nicobar-islands',
  'dadra-and-nagar-haveli','dadra-and-nagar-haveli-and-daman-and-diu','daman-and-diu',
];

export async function GET({ params, request, locals }) {
  const db = locals.runtime.env.DB;
  const { slug } = params;

  const state = await db.prepare('SELECT id, name FROM states WHERE slug = ?').bind(slug).first();
  if (!state) return new Response('Not found', { status: 404 });

  const base = new URL(request.url).origin;
  const word = TALUK_STATES.includes(slug) ? 'taluk' : 'tehsil';

  // District pages: /{state}/district-{d}
  const districts = await db.prepare(`
    SELECT slug FROM districts WHERE state_id = ? ORDER BY name
  `).bind(state.id).all();

  // Sub-district pages: /{state}/district-{d}/{word}-{t}
  const subDistricts = await db.prepare(`
    SELECT d.slug AS district_slug, sd.slug AS sd_slug
    FROM sub_districts sd JOIN districts d ON d.id = sd.district_id
    WHERE d.state_id = ? ORDER BY d.name, sd.name
  `).bind(state.id).all();

  // Village pages: /{state}/district-{d}/{word}-{t}/village-{v}
  const villages = await db.prepare(`
    SELECT d.slug AS district_slug, sd.slug AS sd_slug, v.slug AS village_slug
    FROM villages v
    JOIN sub_districts sd ON sd.id = v.sub_district_id
    JOIN districts d ON d.id = sd.district_id
    WHERE d.state_id = ?
    ORDER BY v.slug
  `).bind(state.id).all();

  // Pincode pages: /{state}/district-{d}/pincode-{p}
  const pincodes = await db.prepare(`
    SELECT DISTINCT d.slug AS district_slug, v.pincode
    FROM villages v
    JOIN sub_districts sd ON sd.id = v.sub_district_id
    JOIN districts d ON d.id = sd.district_id
    WHERE d.state_id = ?
    ORDER BY v.pincode
  `).bind(state.id).all();

  const urls = [
    `/${slug}`,
    ...districts.results.map(d => `/${slug}/district-${d.slug}`),
    ...subDistricts.results.map(x => `/${slug}/district-${x.district_slug}/${word}-${x.sd_slug}`),
    ...villages.results.map(x => `/${slug}/district-${x.district_slug}/${word}-${x.sd_slug}/village-${x.village_slug}`),
    ...pincodes.results.map(x => `/${slug}/district-${x.district_slug}/pincode-${x.pincode}`),
  ];

  const now = new Date().toISOString().slice(0, 10);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${base}${u}</loc><lastmod>${now}</lastmod></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
