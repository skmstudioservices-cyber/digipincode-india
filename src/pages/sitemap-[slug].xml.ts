// Per-state sitemap — SSR endpoint, paginated by 50K URLs
export const prerender = false;

export async function GET({ params, request, locals }) {
  const db = locals.runtime.env.DB;
  const { slug } = params;

  const state = await db.prepare('SELECT id, name FROM states WHERE slug = ?').bind(slug).first();
  if (!state) return new Response('Not found', { status: 404 });

  const base = new URL(request.url).origin;
  const villages = await db.prepare(`
    SELECT v.slug, v.pincode FROM villages v
    JOIN sub_districts sd ON sd.id = v.sub_district_id
    JOIN districts d ON d.id = sd.district_id
    JOIN states s ON s.id = d.state_id
    WHERE s.slug = ?
    ORDER BY v.slug
  `).bind(slug).all();

  const urls = villages.results.map(v => `${base}/village/${v.slug}`);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
}