// src/pages/sitemap/[part].xml.ts — Chunked child sitemaps (15k URLs each, keyset pagination, 24h edge cached)
export const prerender = false;
const CHUNK = 15000;
const MAX_HOPS = 3;

const EMPTY_URLSET =
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>';

function xmlResponse(body: string, maxAge: number) {
  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${maxAge}, s-maxage=${maxAge}`,
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

export async function GET({ request, params, locals }) {
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
  if (cache) {
    try {
      const hit = await cache.match(key);
      if (hit && hit.status === 200) return hit;
    } catch {}
  }

  let results: any[] = [];
  const cursorKey = `part_start_15k_${i}`;

  if (i === 0) {
    try {
      const r = await db.prepare('SELECT url_path FROM url_index ORDER BY url_path LIMIT ?').bind(CHUNK).all();
      results = (r as any).results || [];
      if (results.length === CHUNK) {
        const nextStart = results[results.length - 1].url_path;
        try { await db.prepare("INSERT OR REPLACE INTO meta(k,v) VALUES('part_start_15k_1', ?)").bind(nextStart).run(); } catch {}
      }
    } catch {}
  } else {
    // Check if cursor for part i is already cached
    let startCursor: string | null = null;
    try {
      const m1 = await db.prepare('SELECT v FROM meta WHERE k = ?').bind(cursorKey).first();
      startCursor = (m1 as any)?.v || null;
    } catch {}

    if (startCursor) {
      try {
        const r = await db.prepare('SELECT url_path FROM url_index WHERE url_path > ? ORDER BY url_path LIMIT ?').bind(startCursor, CHUNK).all();
        results = (r as any).results || [];
        if (results.length === CHUNK) {
          const nextStart = results[results.length - 1].url_path;
          try { await db.prepare('INSERT OR REPLACE INTO meta(k,v) VALUES(?, ?)').bind(`part_start_15k_${i + 1}`, nextStart).run(); } catch {}
        }
      } catch {}
    } else {
      // Keyset walk forward from nearest known cursor
      try {
        let nearestIdx = -1;
        let nearestCursor: string | null = null;
        for (let k = i - 1; k >= 0 && k >= i - MAX_HOPS; k--) {
          const pm = await db.prepare('SELECT v FROM meta WHERE k = ?').bind(`part_start_15k_${k}`).first();
          if ((pm as any)?.v) {
            nearestIdx = k;
            nearestCursor = (pm as any).v;
            break;
          }
        }

        if (nearestIdx >= 0 && nearestCursor) {
          let cur = nearestIdx;
          let curCursor = nearestCursor;
          while (cur < i && curCursor) {
            const nx = await db.prepare('SELECT url_path FROM url_index WHERE url_path > ? ORDER BY url_path LIMIT ?').bind(curCursor, CHUNK).all();
            const arr = (nx as any).results || [];
            if (!arr.length) { curCursor = null; break; }
            curCursor = arr[arr.length - 1].url_path;
            cur++;
            try { await db.prepare('INSERT OR REPLACE INTO meta(k,v) VALUES(?, ?)').bind(`part_start_15k_${cur}`, curCursor).run(); } catch {}
          }
          if (cur === i && curCursor) {
            const r4 = await db.prepare('SELECT url_path FROM url_index WHERE url_path > ? ORDER BY url_path LIMIT ?').bind(curCursor, CHUNK).all();
            results = (r4 as any).results || [];
          }
        } else {
          // Bounded OFFSET fallback if no cursor exists
          const offset = i * CHUNK;
          const r5 = await db.prepare('SELECT url_path FROM url_index ORDER BY url_path LIMIT ? OFFSET ?').bind(CHUNK, offset).all();
          results = (r5 as any).results || [];
          if (results.length) {
            try {
              const prevStart = results[0].url_path;
              await db.prepare('INSERT OR REPLACE INTO meta(k,v) VALUES(?, ?)').bind(cursorKey, prevStart).run();
              if (results.length === CHUNK) {
                await db.prepare('INSERT OR REPLACE INTO meta(k,v) VALUES(?, ?)').bind(`part_start_15k_${i + 1}`, results[results.length - 1].url_path).run();
              }
            } catch {}
          }
        }
      } catch {}
    }
  }

  if (!results || !results.length) return xmlResponse(EMPTY_URLSET, 300);

  const today = new Date().toISOString().slice(0, 10);
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const r of results as any[]) {
    const p = String(r.url_path || '').trim().replace(/^\/+|\/+$/g, '');
    if (!p) continue;
    xml += `  <url>\n    <loc>${base}/${p}/</loc>\n    <lastmod>${today}</lastmod>\n  </url>\n`;
  }
  xml += '</urlset>';

  const res = xmlResponse(xml, 86400);
  if (cache) {
    try {
      const ctx = (locals as any).runtime?.ctx;
      const put = cache.put(key, res.clone());
      if (ctx?.waitUntil) ctx.waitUntil(put);
      else await put;
    } catch {}
  }
  return res;
}
