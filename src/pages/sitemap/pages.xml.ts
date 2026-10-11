// src/pages/sitemap/pages.xml.ts — static pages + locality landing pages (B10b)
export const prerender = false;
import { LOCALITIES } from '../../data/localities.js';

export async function GET({ request, locals }) {
  const base = new URL(request.url).origin;
  const now = new Date().toISOString().slice(0, 10);
  const urls = ['/', '/states', '/digipin/', '/about', '/contact', '/privacy-policy', '/terms', '/disclaimer',
    ...LOCALITIES.map((l) => `/pin-code/${l.slug}/`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${base}${u}</loc><lastmod>${now}</lastmod></url>`).join('\n')}\n</urlset>`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400, s-maxage=86400' } });
}
