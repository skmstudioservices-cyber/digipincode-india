// src/pages/sitemap.xml.ts — Unified root sitemap index
// Partitions all directory URLs into 15K-URL chunks under /sitemap/part-N.xml
// Auto-updates as url_index rows grow or shrink.
export const prerender = false;
const CHUNK = 15000;

function indexResponse(body: string, maxAge: number) {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function GET({ request, locals }) {
  const base = new URL(request.url).origin;
  const today = new Date().toISOString().slice(0, 10);
  try {
    const db = locals?.runtime?.env?.DB;
    const cache = (globalThis as any).caches?.default;
    const key = new Request(request.url, { method: 'GET' });
    if (cache) {
      try {
        const hit = await cache.match(key);
        if (hit && hit.status === 200) return hit;
      } catch {}
    }

    let total = 0;
    if (db) {
      try {
        const m = await db.prepare("SELECT v FROM meta WHERE k = 'url_index_count'").first();
        total = Number((m as any)?.v || 0);
      } catch {}
      if (!total) {
        try {
          const row = await db.prepare('SELECT COUNT(*) AS total FROM url_index').first();
          total = Number((row as any)?.total || 0);
          try { await db.prepare("INSERT OR REPLACE INTO meta(k,v) VALUES('url_index_count', ?)").bind(String(total)).run(); } catch {}
        } catch {}
      }
    }
    const parts = Math.max(1, Math.ceil(total / CHUNK));

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += `  <sitemap>\n    <loc>${base}/sitemap/pages.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    for (let i = 0; i < parts; i++) {
      xml += `  <sitemap>\n    <loc>${base}/sitemap/part-${i}.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n`;
    }
    xml += '</sitemapindex>';

    const res = indexResponse(xml, 86400);
    if (cache) {
      try {
        const ctx = (locals as any).runtime?.ctx;
        const put = cache.put(key, res.clone());
        if (ctx?.waitUntil) ctx.waitUntil(put);
        else await put;
      } catch {}
    }
    return res;
  } catch {
    const fallback = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
      + `  <sitemap>\n    <loc>${base}/sitemap/pages.xml</loc>\n    <lastmod>${today}</lastmod>\n  </sitemap>\n</sitemapindex>`;
    return indexResponse(fallback, 300);
  }
}
