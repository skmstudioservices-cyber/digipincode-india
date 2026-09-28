// Diwali sitemap — /diwali/ hub + /diwali/[city] pages (45 cities)
export const prerender = false;

import { festivalCities } from '../data/cities';

export async function GET({ request }) {
  const base = new URL(request.url).origin;
  const urls = [
    `${base}/diwali/`,
    ...festivalCities.map((c) => `${base}/diwali/${c.slug}`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;

  return new Response(body, {
    headers: { 'Content-Type': 'application/xml' },
  });
}
