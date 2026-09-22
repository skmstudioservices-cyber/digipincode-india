// Small static-ish sitemap for standalone pages (not tied to a state).
// Edge-cached 24h like the state sitemaps.
export const prerender = false;

export async function GET({ request, locals }) {
  const cache = (globalThis as any).caches?.default;
  const key = new Request(request.url, { method: 'GET' });
  if (cache) {
    try {
      const hit = await cache.match(key);
      if (hit) return hit;
    } catch {}
  }
  const base = new URL(request.url).origin;
  const now = new Date().toISOString().slice(0, 10);
  const urls = ['/', '/states', '/digipin/', '/about', '/contact', '/privacy-policy', '/terms', '/disclaimer', '/search'];
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${base}${u}</loc><lastmod>${now}</lastmod></url>`).join('\n')}
</urlset>`;
  const res = new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400, s-maxage=86400' },
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
