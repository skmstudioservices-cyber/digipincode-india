// middleware.ts — three jobs:
// 1) D1 read-replication session: wrap the D1 binding so reads route to the
//    nearest replica (D1 Sessions API). Never mutates shared env.
// 2) Edge caching for GET HTML pages (Q43b): served from Cloudflare's edge
//    cache for 7 days before D1 is touched again. Excludes /search, /saved,
//    /api/*, anything with a query string or file extension, and non-200s.
//    CACHE_VERSION: bump after big template changes to serve fresh HTML.
// 3) Table of Contents (user request): WordPress-style "On this page" box,
//    injected SERVER-SIDE into the raw HTML so it works for visitors AND
//    appears in the HTML that AI crawlers fetch (no JS needed to see it).
import { defineMiddleware } from 'astro:middleware';

const CACHE_VERSION = 'v1';
const PAGE_TTL = 60 * 60 * 24 * 7; // 7 days
const SKIP = ['/api/', '/search', '/saved', '/sitemap', '/404'];

// --- Table of Contents injection -------------------------------------------
// Finds every <h2>Heading</h2> in the page, gives each an id, and inserts a
// clickable TOC box right after the update banner (or before the first h2).
// Only pages with 3+ sections get a TOC (search/saved pages auto-skip).
function withToc(html: string): string {
  const heads = [...html.matchAll(/<h2>([^<]+)<\/h2>/g)];
  if (heads.length < 3) return html;
  const entries = heads.map((m, i) => ({ id: `toc-${i}`, title: m[1].trim() }));
  let i = 0;
  const out = html.replace(/<h2>([^<]+)<\/h2>/g, (_full, t) => `<h2 id="toc-${i++}">${t}</h2>`);
  const style =
    '<style>.toc{background:#fff;border:1px solid #e3e8f0;border-radius:12px;padding:.8rem 1.1rem;margin:1rem 0}.toc strong{color:#12263f;font-size:1rem}.toc ol{margin:.5rem 0 0;padding-left:1.3rem}.toc li{margin:.25rem 0}.toc a{font-size:.92rem}html{scroll-behavior:smooth}@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}h2[id]{scroll-margin-top:84px}</style>';
  const nav =
    `<nav class="toc" aria-label="Table of contents">${style}<strong>📑 On this page</strong><ol>` +
    entries.map((e) => `<li><a href="#${e.id}">${e.title}</a></li>`).join('') +
    '</ol></nav>';
  if (out.includes('class="update-banner"')) {
    return out.replace(/(<div class="update-banner"[\s\S]*?<\/div>)/, (m) => m + nav);
  }
  return out.replace('<h2 id="toc-0">', nav + '<h2 id="toc-0">');
}

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
    // Read the body ONCE — a second res.text() would throw (body already used).
    let raw: string;
    try {
      raw = await res.text();
    } catch {
      return res;
    }
    const html = withToc(raw);
    // FIX (23 Sep 2026): passing res.headers straight into new Response() makes
    // the new response's headers IMMUTABLE (guard is inherited), so the
    // headers.set() below threw "TypeError: Can't modify immutable headers" and
    // every cache-MISS HTML page returned a 500. Copy into a fresh Headers.
    const headers = new Headers(res.headers);
    headers.set('Cache-Control', `public, max-age=3600, s-maxage=${PAGE_TTL}`);
    const fresh = new Response(html, { status: res.status, headers });
    try {
      const ctx = (context.locals as any).runtime?.ctx;
      const put = cache.put(cacheKey(), fresh.clone());
      if (ctx?.waitUntil) ctx.waitUntil(put); else await put;
    } catch {
      /* caching must never break the page */
    }
    return fresh;
  }
  return res;
});
