// Root sitemap index — CONVENTION: every site's sitemap is /sitemap.xml
// (this replaces the old /sitemap-index.xml entry point; old path still works)
// Edge-cached for 24h (Q42b).
export const prerender = false;

import { withRetry } from '../lib/db';

const SITEMAP_TTL = 60 * 60 * 24; // 24 hours

export async function GET({ request, locals }) {
  const cache = (globalThis as any).caches?.default;
  const key = new Request(request.url, { method: 'GET' });
  if (cache) {
    try {
      const hit = await cache.match(key);
      if (hit) return hit;
    } catch {}
  }

  const db = locals.runtime.env.DB;
  // withRetry: transient D1 blips caused HTTP 500 on /sitemap.xml (22 Sep
  // site-monitor alert) — same protection as the lib/db.ts helpers.
  const states = await withRetry(() =>
    db.prepare('SELECT slug, name FROM states ORDER BY name').all()
  );

  const base = new URL(request.url).origin;
  const urls = [
    `${base}/`,
    `${base}/states`,
    `${base}/digipin/`,
    `${base}/about`,
    `${base}/contact`,
    `${base}/privacy-policy`,
    `${base}/terms`,
    `${base}/disclaimer`,
    `${base}/sitemap-pages.xml`,
    `${base}/sitemap-flat.xml`,
    ...states.results.map(s => `${base}/sitemap-${s.slug}.xml`),
    `${base}/sitemap-chhath.xml`,
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <sitemap><loc>${u}</loc></sitemap>`).join('\n')}
</sitemapindex>`;

  const res = new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${SITEMAP_TTL}, s-maxage=${SITEMAP_TTL}`,
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
