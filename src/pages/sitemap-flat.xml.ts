// src/pages/sitemap-flat.xml.ts — BLOCK:SITEMAP-FLAT
// Emits the flat, single-segment canonical URLs from url_index (one query).
export const prerender = false;

export async function GET({ request, locals }) {
  const db = locals.runtime.env.DB;
  const base = new URL(request.url).origin;
  const { results } = await db.prepare('SELECT url_path FROM url_index ORDER BY url_path').all();
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${results.map((r) => `  <url><loc>${base}/${r.url_path}/</loc></url>`).join('\n')}
</urlset>`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
  });
}
