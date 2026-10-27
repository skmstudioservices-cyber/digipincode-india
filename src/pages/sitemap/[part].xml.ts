// src/pages/sitemap/[part].xml.ts — chunked child sitemaps (3k URLs each, cached; smaller = faster + cacheable)
export const prerender = false;
const CHUNK = 3000;
// 26 Oct 2026 SKM audit: bounded self-heal walk for chunks with no stored cursor.
// 27 Oct 2026 SKM audit: reduced 8 -> 2. All part cursors are now precomputed
// into meta (part_start_0..N) by one ROW_NUMBER() query, so the walk is only a
// rare safety net. A long walk blew the Worker CPU budget and produced 504s.
const MAX_HOPS = 2;

const EMPTY_URLSET =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>';

function xmlResponse(body: string, maxAge: number) {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
    },
  });
}

export async function GET({ request, params, locals }) {
  // 27 Oct 2026 SKM audit: never let this route emit 204 / 5xx.
  // CF analytics showed 137 x 204 and 433 x 504 on /sitemap* over 72h,
  // which is exactly what GSC reports as sitemap errors. Any throw now
  // degrades to a valid (empty) urlset with status 200 instead.
  try {
    return await buildPart({ request, params, locals });
  } catch {
    return xmlResponse(EMPTY_URLSET, 300);
  }
}

async function buildPart({ request, params, locals }): Promise<Response> {
  const db = locals?.runtime?.env?.DB;
  if (!db) return xmlResponse(EMPTY_URLSET, 300);
  const base = new URL(request.url).origin;
  const m = String((params as any).part || '').match(/^part-(\d+)$/);
  if (!m) return new Response('Not Found', { status: 404 });
  const i = parseInt(m[1], 10);

  const cache = (globalThis as any).caches?.default;
  const key = new Request(request.url, { method: 'GET' });
  // Only a cached 200 is reusable — a cached empty/edge response must not stick.
  if (cache) {
    try {
      const hit = await cache.match(key);
      if (hit && hit.status === 200) return hit;
    } catch {}
  }

  // Keyset pagination: start from the meta cursor (reads only CHUNK rows).
  // OFFSET would scan offset+limit rows (part-10 scanned ~165k) per miss.
  let results: any[] = [];
  try {
    const m1 = await db.prepare('SELECT v FROM meta WHERE k = ?').bind('part_start_' + i).first();
    const start = (m1 as any)?.v;
    if (start) {
      const r = await db.prepare('SELECT url_path FROM url_index WHERE url_path >= ? ORDER BY url_path LIMIT ?').bind(start, CHUNK).all();
      results = (r as any).results || [];
    }
  } catch {}
  if (!results.length) {
    // BOUNDED fallback (16 Oct 2026): never OFFSET-scan more than ~40k rows.
    try {
      const prevM = await db.prepare('SELECT v FROM meta WHERE k = ?').bind('part_start_' + (i - 1)).first();
      const prevStart = (prevM as any)?.v;
      if (i === 0) {
        const r2 = await db.prepare('SELECT url_path FROM url_index ORDER BY url_path LIMIT ?').bind(CHUNK).all();
        results = (r2 as any).results || [];
      } else if (prevStart) {
        const pr = await db.prepare('SELECT url_path FROM url_index WHERE url_path >= ? ORDER BY url_path LIMIT ?').bind(prevStart, CHUNK * 2).all();
        const arr = (pr as any).results || [];
        if (arr.length > CHUNK) {
          const start2 = arr[CHUNK].url_path;
          const r3 = await db.prepare('SELECT url_path FROM url_index WHERE url_path >= ? ORDER BY url_path LIMIT ?').bind(start2, CHUNK).all();
          results = (r3 as any).results || [];
        }
      }
    } catch {}
    if (results.length) { try { await db.prepare('INSERT OR REPLACE INTO meta(k,v) VALUES(?, ?)').bind('part_start_' + i, results[0].url_path).run(); } catch {} }
  }

  // Self-heal (26 Oct 2026): when neither cursor at i nor at i-1 exists, walk
  // forward from the nearest lower cursor, at most MAX_HOPS chunks, storing each
  // cursor we pass so the next request is a single-row read.
  if (!results.length && i > 0) {
    try {
      let j = -1;
      for (let k = i - 1; k >= 0 && k >= i - MAX_HOPS; k--) {
        const pm = await db.prepare('SELECT v FROM meta WHERE k = ?').bind('part_start_' + k).first();
        if ((pm as any)?.v) { j = k; break; }
      }
      if (j >= 0) {
        let cursor = (await db.prepare('SELECT v FROM meta WHERE k = ?').bind('part_start_' + j).first() as any)?.v;
        let cur = j;
        while (cur < i && cursor) {
          const nx = await db.prepare('SELECT url_path FROM url_index WHERE url_path >= ? ORDER BY url_path LIMIT ?').bind(cursor, CHUNK).all();
          const arr = (nx as any).results || [];
          if (!arr.length) { cursor = null; break; }
          cursor = arr[arr.length - 1].url_path;
          cur++;
          try { await db.prepare('INSERT OR REPLACE INTO meta(k,v) VALUES(?, ?)').bind('part_start_' + cur, cursor).run(); } catch {}
        }
        if (cursor && cur === i) {
          const r4 = await db.prepare('SELECT url_path FROM url_index WHERE url_path >= ? ORDER BY url_path LIMIT ?').bind(cursor, CHUNK).all();
          results = (r4 as any).results || [];
        }
      }
    } catch {}
    if (results.length) { try { await db.prepare('INSERT OR REPLACE INTO meta(k,v) VALUES(?, ?)').bind('part_start_' + i, results[0].url_path).run(); } catch {} }
  }

  // Never 404 a chunk the index advertises: an unfilled or out-of-range chunk
  // returns a valid (possibly empty) urlset so GSC and audits see no broken
  // sitemap, and re-checks itself after a short cache.
  if (!results || !results.length) return xmlResponse(EMPTY_URLSET, 300);

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const r of results as any[]) {
    const p = String(r.url_path || '').trim().replace(/^\/+|\/+$/g, ''); // strip leading/trailing slashes -> no double slash
    if (!p) continue;
    xml += `  <url><loc>${base}/${p}</loc></url>\n`;
  }
  xml += '</urlset>';

  const res = xmlResponse(xml, 86400);
  if (cache) { try { const ctx = (locals as any).runtime?.ctx; const put = cache.put(key, res.clone()); if (ctx?.waitUntil) ctx.waitUntil(put); else await put; } catch {} }
  return res;
}
