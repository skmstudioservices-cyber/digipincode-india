// Root sitemap index — CONVENTION: every site's sitemap is /sitemap.xml
// (this replaces the old /sitemap-index.xml entry point; old path still works)
export const prerender = false;

export async function GET({ request, locals }) {
  const db = locals.runtime.env.DB;
  const states = await db.prepare('SELECT slug, name FROM states ORDER BY name').all();

  const base = new URL(request.url).origin;
  const urls = [
    `${base}/`,
    `${base}/search`,
    `${base}/states`,
    `${base}/about`,
    `${base}/contact`,
    `${base}/privacy-policy`,
    `${base}/terms`,
    `${base}/disclaimer`,
    ...states.results.map(s => `${base}/sitemap-${s.slug}.xml`),
    `${base}/sitemap-chhath.xml`,
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <sitemap><loc>${u}</loc></sitemap>`).join('\n')}
</sitemapindex>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
