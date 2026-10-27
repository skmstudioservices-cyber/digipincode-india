// src/pages/sitemap.xml.ts — BLOCK:SITEMAP-INDEX (single entry point; auto add/remove)
export const prerender = false;
const CHUNK = 3000; // 16 Oct 2026 SKM audit: MUST match [part].xml.ts CHUNK (3000). Was 5000 -> index listed only 33 parts while the child generator needs 55, so ~66k URLs (parts 33-54) were missing from the sitemap. Aligned to 3000 so the index covers all URLs.

function indexResponse(body: string, maxAge: number) {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    },
  });
}

export async function GET({ request, locals }) {
  // 27 Oct 2026 SKM audit: this route must never emit 204/5xx (CF analytics
  // showed 66 x 204 on /sitemap.xml today). Any throw degrades to a minimal
  // valid index pointing at the static pages sitemap.
  const base = new URL(request.url).origin;
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

    // Count from the tiny meta table (1 row read). The old COUNT(*) scanned
    // ~163,893 rows on EVERY cache-miss per colo and was a top D1 read burner.
    let total = 0;
    if (db) {
      try {
        const m = await db.prepare("SELECT v FROM meta WHERE k = 'url_index_count'").first();
        total = Number((m as any)?.v || 0);
      } catch {}
      if (!total) {
        // one-time fallback: compute once, then persist so future hits are 1 row
        try {
          const row = await db.prepare('SELECT COUNT(*) AS total FROM url_index').first();
          total = Number((row as any)?.total || 0);
          try { await db.prepare("INSERT OR REPLACE INTO meta(k,v) VALUES('url_index_count', ?)").bind(String(total)).run(); } catch {}
        } catch {}
      }
    }
    const parts = Math.max(1, Math.ceil(total / CHUNK));

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += `  <sitemap><loc>${base}/sitemap/pages.xml</loc></sitemap>\n`;
    for (let i = 0; i < parts; i++) xml += `  <sitemap><loc>${base}/sitemap/part-${i}.xml</loc></sitemap>\n`;
    xml += '  <sitemap><loc>' + base + '/sitemap-chhath.xml</loc></sitemap>\n';
    xml += '  <sitemap><loc>' + base + '/sitemap-diwali.xml</loc></sitemap>\n';
    xml += '</sitemapindex>';

    const res = indexResponse(xml, 3600);
    if (cache) { try { const ctx = (locals as any).runtime?.ctx; const put = cache.put(key, res.clone()); if (ctx?.waitUntil) ctx.waitUntil(put); else await put; } catch {} }
    return res;
  } catch {
    const fallback = '<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
      + `  <sitemap><loc>${base}/sitemap/pages.xml</loc></sitemap>\n</sitemapindex>`;
    return indexResponse(fallback, 300);
  }
}
