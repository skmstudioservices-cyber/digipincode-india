// middleware.ts — two jobs:
// 1) D1 read-replication session: wrap the D1 binding so reads route to the
//    nearest replica (D1 Sessions API). Never mutates shared env.
// 2) Edge caching for GET HTML pages (Q43b): served from Cloudflare's edge
//    cache for 7 days before D1 is touched again. Excludes /search, /saved,
//    /api/*, anything with a query string or file extension, and non-200s.
//    CACHE_VERSION: bump after big template changes to serve fresh HTML.
import { defineMiddleware } from 'astro:middleware';

const CACHE_VERSION = 'v1';
const PAGE_TTL = 60 * 60 * 24 * 7; // 7 days
const SKIP = ['/api/', '/search', '/saved', '/sitemap', '/404'];

export const onRequest = defineMiddleware(async (context, next) => {
  // --- D1 read-replication session ---
  const rt = (context.locals as any).runtime;
  const db = rt?.env?.DB;
  if (db && typeof db.withSession === 'function') {
    try {
      const session = db.withSession();
      (context.locals as any).runtime = { ...rt, env: { ...rt.env, DB: session } };
    } catch {
      // replication not available (e.g. local dev) — fall through to primary
    }
  }

  // --- edge cache for cacheable HTML pages ---
  const req = context.request;
  const url = new URL(req.url);
  const cacheable =
    req.method === 'GET' &&
    !url.search &&
    !url.pathname.includes('.') &&
    !SKIP.some((p) => url.pathname === p || url.pathname.startsWith(p));
  const cache = (globalThis as any).caches?.default;
  const cacheKey = () => new Request(`${url.origin}/${CACHE_VERSION}${url.pathname}`, { method: 'GET' });

  if (cacheable && cache) {
    try {
      const hit = await cache.match(cacheKey());
      if (hit) return hit;
    } catch {}
  }

  const res = await next();

  if (cacheable && cache && res.status === 200 && (res.headers.get('content-type') || '').includes('text/html')) {
    res.headers.set('Cache-Control', `public, max-age=3600, s-maxage=${PAGE_TTL}`);
    try {
      const ctx = (context.locals as any).runtime?.ctx;
      const put = cache.put(cacheKey(), res.clone());
      if (ctx?.waitUntil) ctx.waitUntil(put); else await put;
    } catch {
      /* caching must never break the page */
    }
  }
  return res;
});
