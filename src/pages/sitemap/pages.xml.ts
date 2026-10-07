// src/pages/sitemap/pages.xml.ts — static pages (inside the /sitemap folder)
export const prerender = false;

export async function GET({ request, locals }) {
  const base = new URL(request.url).origin;
  const now = new Date().toISOString().slice(0, 10);
  const urls = ['/', '/states', '/digipin/', '/about', '/contact', '/privacy-policy', '/terms', '/disclaimer', '/search'];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${base}${u}</loc><lastmod>${now}</lastmod></url>`).join('\n')}\n</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400, s-maxage=86400' } });
}
