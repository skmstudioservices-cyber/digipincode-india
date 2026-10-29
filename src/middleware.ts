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

const CACHE_VERSION = 'v6' // bumped 15 Oct 2026: purge stale edge-cached HTML (stale _astro/*.css 404s) + serve fresh after latest deploy
const PAGE_TTL = 60 * 60 * 24 * 7; // 7 days
const SKIP = ['/api/', '/search', '/saved', '/sitemap', '/404'];

// --- Table of Contents injection -------------------------------------------
// Finds every <h2>Heading</h2> in the page, gives each an id, and inserts a
// clickable TOC box right after the update banner (or before the first h2).
// Only pages with 3+ sections get a TOC (search/saved pages auto-skip).
function withToc(html: string): string {
  const re = /<h([23])>([^<]+)<\/h\1>/g;
  const items: { id: string; lvl: number; title: string }[] = [];
  let n = 0;
  const out = html.replace(re, (_full, lvl, txt) => {
    const id = `toc-${n++}`;
    items.push({ id, lvl: Number(lvl), title: String(txt).trim() });
    return `<h${lvl} id="${id}">${txt}</h${lvl}>`;
  });
  if (items.filter((x) => x.lvl === 2).length < 3) return out;

  let list = '';
  let openSub = false;
  for (const it of items) {
    if (it.lvl === 2) {
      if (openSub) { list += '</ul></li>'; openSub = false; }
      else if (list) { list += '</li>'; }
      list += `<li><a href="#${it.id}">${it.title}</a>`;
    } else {
      if (!openSub) { list += '<ul>'; openSub = true; }
      list += `<li><a href="#${it.id}">${it.title}</a></li>`;
    }
  }
  if (openSub) list += '</ul></li>'; else if (list) list += '</li>';
  const inner = `<ol>${list}</ol>`;

  const style =
    '<style>.toc{background:#fff;border:1px solid #e3e8f0;border-radius:12px;padding:.5rem 1.1rem;margin:1rem 0}.toc summary{cursor:pointer;font-weight:700;color:#12263f;font-size:1rem;padding:.3rem 0;list-style:none}.toc summary::-webkit-details-marker{display:none}.toc summary::after{content:" ▾";color:#1a5fb4}.toc[open] summary::after{content:" ▴"}.toc ol{margin:.5rem 0 .6rem;padding-left:1.3rem}.toc ul{margin:.2rem 0;padding-left:1rem}.toc li{margin:.25rem 0}.toc a{font-size:.92rem}html{scroll-behavior:smooth}@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}}h2[id],h3[id]{scroll-margin-top:84px}</style>';
  const nav =
    `<details class="toc" aria-label="Table of contents">${style}` +
    '<summary>📑 On this page</summary>' + inner + '</details>';
  if (out.includes('class="update-banner"')) {
    return out.replace(/(<div class="update-banner"[\s\S]*?<\/div>)/, (m) => m + nav);
  }
  return out.replace('<h2 id="toc-0">', nav + '<h2 id="toc-0">');
}

export const onRequest = defineMiddleware(async (context, next) => {
  // --- Canonical host (B11): pages.dev 301 -> workers.dev so Google indexes ONE host ---
  const _cu = new URL(context.request.url);
  if (_cu.hostname.endsWith('.pages.dev') && context.request.method === 'GET') {
    return Response.redirect(`https://digipincode.india-in.workers.dev${_cu.pathname}${_cu.search}`, 301);
  }
  // --- Bot guard (D1 read protection, 14 Oct 2026) ---
  // Known AI / heavy crawlers that ignore robots.txt and burn D1 reads on
  // cold (uncached) unique URLs. Googlebot/Bingbot and real search engines
  // are never matched here. Mirrors the robots.txt AI-block list.
  const _ua = (context.request.headers.get('user-agent') || '').toLowerCase();
  // Amzn-SearchBot deliberately NOT blocked (15 Oct 2026): it powers Alexa/Rufus AI-search
  // and does NOT train AI models — blocking it forfeits AI-search eligibility. Edge cache absorbs it.
  // 26 Oct 2026 SKM audit: 'oai-searchbot' removed from BOT_BLOCK - repo robots.txt
  // (24 Oct, rule 434) ALLOWS OAI-SearchBot for AI-search visibility, so the
  // middleware 403 was silently contradicting robots.txt. Edge cache absorbs it.
  const BOT_BLOCK = ['reflectionbot','exasearchbot','exauser','ccbot','bytespider','petalbot','mj12bot','dotbot','dataforseobot','semrushbot','ahrefsbot','baiduspider','yandexbot','sogou','scrapy','diffbot','omgili','timpibot','gptbot','chatgpt-user','chatgpt agent','claudebot','claude-searchbot','claude-web','anthropic','perplexitybot','perplexity-user','google-extended','meta-externalagent','meta-externalfetcher','cohere-ai','youbot','iaskspider','webzio','linespider','aihitbot','velenpublicwebcrawler','img2dataset','icc-crawler','amazonbot','amzn-searchbot','applebot-extended','ahrefssiteaudit','tlm-scanner','l9scan','leakix','cms-checker'];  // 16 Oct 2026 SKM audit: enforce robots Amzn-SearchBot block in middleware + close AhrefsSiteAudit/tlm-scanner/l9scan gaps (top non-blocked read burners)
  if (_ua && BOT_BLOCK.some((b) => _ua.includes(b))) {
    return new Response('Forbidden', { status: 403, headers: { 'cache-control': 'no-store' } });
  }

  // --- Empty-UA guard (D1 read protection, 15 Oct 2026) ---
  // CF analytics show the single biggest D1 read drain is UA-less traffic:
  // ~13.7k req/day to this worker (more than every named bot combined), hitting
  // the hierarchy catch-all and timing out (504). Every real browser and every
  // legitimate crawler sends a User-Agent, so we refuse UA-less requests.
  // /api/* is exempt so the first-party /api/collect beacon keeps working.
  const _path0 = new URL(context.request.url).pathname;
  if (!_ua && !_path0.startsWith('/api/')) {
    return new Response('Forbidden', { status: 403, headers: { 'cache-control': 'no-store' } });
  }

  // --- Bogus cache-key prefix guard (29 Oct 2026, D1 read incident) ---
  // Requests shaped /<uuid>/... are Workers Cache API keys, never real pages.
  // A UA-less crawler landed on one (it answered 200 because the Astro
  // catch-all matched), followed that page's RELATIVE links, and generated
  // thousands of unique URLs -> every one a cache miss -> 18.6M D1 rows read
  // in 11h (373% of the 5M/day free cap) plus ~29k 504s from retry storms.
  // 410 Gone kills the whole subtree instantly at zero D1 cost.
  if (/^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\/|$)/i.test(_path0)) {
    return new Response('Gone', {
      status: 410,
      headers: { 'cache-control': 'public, max-age=86400', 'x-robots-tag': 'noindex' },
    });
  }

  // Protect the expensive /search endpoint: crawlers and empty-UA agents hammering
  // it burn D1 reads (the top read drain). Real browsers always send a user-agent.
  if (new URL(context.request.url).pathname.startsWith('/search') && (!_ua || BOT_BLOCK.some((b) => _ua.includes(b)))) {
    return new Response('Forbidden', { status: 403, headers: { 'cache-control': 'no-store' } });
  }

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
  // Query strings are intentionally NOT excluded: the cache key below already
  // ignores them, so ?utm=/?fbclid= bot hits share the cached entry instead of
  // bypassing the cache and burning a D1 read on every request.
  const cacheable =
    req.method === 'GET' &&
    !url.pathname.includes('.') &&
    !SKIP.some((p) => url.pathname === p || url.pathname.startsWith(p));
  const cache = (globalThis as any).caches?.default;
  // Auto cache-bust: Cloudflare's version_metadata.id changes on EVERY deploy,
  // so the HTML cache key changes with each release and stale pages never persist.
  const CV = (rt?.env?.CF_VERSION_METADATA?.id) || CACHE_VERSION;
  const cacheKey = () => new Request(`${url.origin}/${CV}${url.pathname}`, { method: 'GET' });

  if (cacheable && cache) {
    try {
      const hit = await cache.match(cacheKey());
      if (hit) {
        // FIX (23 Sep 2026): the Workers Cache API returns a Response with
        // IMMUTABLE headers. Returning it raw made Astro's RenderContext
        // throw "TypeError: Can't modify immutable headers" -> 500 on every
        // cache HIT. Re-wrap with a mutable Headers copy.
        return new Response(hit.body, { status: hit.status, headers: new Headers(hit.headers) });
      }
    } catch {}
  }

  // D1-resilience (18 Oct 2026): never return a 500 when D1 is over-quota/slow.
  // Serve a graceful 200 page (with the verification tags) instead.
  let res: Response;
  try {
    res = await next();
  } catch (e) {
    const fallback = `<!doctype html><html lang="en"><head><meta charset="utf-8">`
      + `<meta name="viewport" content="width=device-width, initial-scale=1">`
      + `<meta name="google-site-verification" content="GlkDu5ZL-CyyKjwPSj9d9X3Y2qsHUj_qAwRwxiLr7nI" />`
      + `<meta name="google-site-verification" content="Y_eKs_NNxezM-xRutg7oqy5Ga7qwl1W_ZbIPLGmn3pI" />`
      + `<title>Digipincode — temporarily busy</title>`
      + `<meta name="robots" content="noindex"></head><body style="font-family:system-ui;max-width:640px;margin:60px auto;padding:0 20px">`
      + `<h1>We're briefly busy</h1><p>Our data service is catching up. Please refresh in a moment — or use search below.</p>`
      + `<p><a href="/">← Home</a> · <a href="/states">All states</a></p></body></html>`;
    return new Response(fallback, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } });
  }

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
