// Sitemap index — SSR endpoint. Google allows 50K URLs per sitemap.
// We generate one sitemap per state (37 states × ~16K villages = ~600K URLs)
export const prerender = false;

export async function GET({ request, locals }) {
  const db = locals.runtime.env.DB;
  const states = await db.prepare('SELECT slug, name FROM states ORDER BY name').all();

  const base = new URL(request.url).origin;
  const urls = states.results.map(s =>
    `${base}/sitemap-${s.slug}.xml`
  );

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <sitemap><loc>${u}</loc></sitemap>`).join('\n')}
</sitemapindex>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
}