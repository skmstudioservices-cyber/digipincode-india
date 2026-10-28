// src/pages/sitemap/pages.xml.ts — static pages, festival hubs & cities, and locality landing pages
export const prerender = false;
import { LOCALITIES } from '../../data/localities.js';
import { chhathCities } from '../../data/chhath';
import { festivalCities } from '../../data/cities';

export async function GET({ request, locals }) {
  const base = new URL(request.url).origin;
  const now = new Date().toISOString().slice(0, 10);
  const coreUrls = [
    '/',
    '/states',
    '/digipin/',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms',
    '/disclaimer',
    '/saved',
    '/chhath/',
    '/diwali/',
    '/karva-chauth/',
  ];
  const chhathUrls = chhathCities.map((c) => `/chhath/${c.slug}`);
  const diwaliUrls = festivalCities.map((c) => `/diwali/${c.slug}`);
  const localityUrls = LOCALITIES.map((l) => `/pin-code/${l.slug}/`);

  const urls = [...coreUrls, ...chhathUrls, ...diwaliUrls, ...localityUrls];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((u) => `  <url><loc>${base}${u.startsWith('/') ? u : '/' + u}</loc><lastmod>${now}</lastmod></url>`)
    .join('\n')}\n</urlset>`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
