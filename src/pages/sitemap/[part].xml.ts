// src/pages/sitemap/[part].xml.ts — chunked child sitemaps (15k URLs each, cached)
export const prerender = false;
const CHUNK = 15000;

export async function GET({ request, params, locals }) {
  const db = locals.runtime.env.DB;
  const base = new URL(request.url).origin;
  const m = String((params as any).part || '').match(/^part-(\d+)$/);
  if (!m) return new Response('Not Found', { status: 404 });
  const i = parseInt(m[1], 10);

  const cache = (globalThis as any).caches?.default;
  const key = new Request(request.url, { method: 'GET' });
  if (cache) { try { const hit = await cache.match(key); if (hit) return hit; } catch {} }

  // Keyset pagination: start from the meta cursor (reads only CHUNK rows).
  // OFFSET would scan offset+limit rows (part-10 scanned ~165k) per miss.
  let results: any[] = [];
  try {
    const m = await db.prepare('SELECT v FROM meta WHERE k = ?').bind('part_start_' + i).first();
    const start = (m as any)?.v;
    if (start) {
      const r = await db.prepare('SELECT url_path FROM url_index WHERE url_path >= ? ORDER BY url_path LIMIT ?').bind(start, CHUNK).all();
      results = (r as any).results || [];
    }
  } catch {}
  if (!results.length) {
    const r2 = await db.prepare('SELECT url_path FROM url_index ORDER BY url_path LIMIT ? OFFSET ?').bind(CHUNK, i * CHUNK).all();
    results = (r2 as any).results || [];
    // persist the cursor once so future hits read only CHUNK rows (keyset)
    if (results.length) { try { await db.prepare('INSERT OR REPLACE INTO meta(k,v) VALUES(?, ?)').bind('part_start_' + i, results[0].url_path).run(); } catch {} }
  }
  if (!results || !results.length) return new Response('Not Found', { status: 404 });

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const r of results as any[]) {
    const p = String(r.url_path || '').trim().replace(/^\/+|\/+$/g, ''); // strip leading/trailing slashes -> no double slash
    if (!p) continue;
    xml += `  <url><loc>${base}/${p}</loc></url>\n`;
  }
  xml += '</urlset>';

  const res = new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=86400, s-maxage=86400' } });
  if (cache) { try { const ctx = (locals as any).runtime?.ctx; const put = cache.put(key, res.clone()); if (ctx?.waitUntil) ctx.waitUntil(put); else await put; } catch {} }
  return res;
}
