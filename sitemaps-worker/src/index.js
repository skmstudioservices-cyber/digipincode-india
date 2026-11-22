// SKM Sitemap Hub — one reliable fetch path for every site.
// GET /                      -> HTML index of every sitemap
// GET /sitemap-index.xml     -> master sitemap index (the one URL Google needs)
// GET /sitemap.xml           -> alias of the index (Google's default guess)
// GET /<site>/sitemap.xml    -> that site's sitemap, proxied from origin with edge cache
// GET /<site>/robots.txt     -> that site's robots.txt, proxied
//
// Why this exists: every *.pages.dev sitemap endpoint flaps between 200, 204 and
// 504 at the edge. Workers do not. This gives Google one host that answers.
//
// 22 Nov 2026 fixes (network audit):
//   1. /sitemap.xml was a 404 — Google's default probe. Now an alias of the index.
//   2. The index emitted lastmod = new Date() on every request. Google ignores a
//      lastmod that changes on every fetch, so the whole index carried zero
//      freshness signal. Now a stable BUILD_DATE that only moves on redeploy.
//   3. Upstream 204/504/HTML returned an HTML error page at a .xml URL — Google
//      parsed that as an invalid sitemap and backed off. Now: serve the last good
//      copy from cache (stale-if-error); if there is none, return 503 + valid XML
//      so Google retries later instead of marking the sitemap broken.

const SITES = [
  'toiletsnearme', 'washroomsnearme', 'restareanearme', 'evchargersnearme',
  'petrolpumpsnearme', 'cngpumpsnearme', 'karvachauth', 'banksnearme',
  'atmsnearme', 'hospitalsnearme-9cp', 'railwaystationnearme', 'floodsnearme',
  'templesnearme', 'churchesnearme', 'mosquesnearme', 'cafenearme',
  'gymnearme', 'salonnearme', 'parksnearme', 'lodgenearme',
  'bakerynearme', 'dhabanearme', 'hotelnearme', 'tailorshopnearme',
  'medicalshopnearme', 'mobilerepairnearme', 'mechanicnearme', 'tirenearme',
  'paintshopnearme', 'hardwareshopnearme', 'sweetsshopnearme', 'laundrynearme',
  'policestationsnearme', 'postofficenearme', 'rtoofficenearme', 'courtnearme',
  'busstopnearme', 'busstationnearme', 'autostandnearme', 'bikestandnearme',
  'erickshawstandnearme', 'bicyclestandnearme', 'carparkingnearme',
  'tollplazanearme', 'rationcardofficernearme', 'aadhaarcenternearme',
  'aadhaar-seva-kendra-near-me', 'bloodbanksnearme', 'airqualitynearme',
  'earthquakenearme', 'protestsnearme', 'skmtools', 'demo-vmv', 'mapsnearme',
  'isrotracker', 'issspotter', 'bharatlive', 'asiangamesmedaltally2026', 'subhammaddheshiya', 'skmstudio',
];

const HUB = 'https://sitemaps.india-in.workers.dev/';

// Stable per-deploy stamp. Only changes when this worker is redeployed, so
// Google can trust it as a real lastmod signal.
const BUILD_DATE = '2026-11-22';

const ORIGIN = (site) => `https://${site}.pages.dev`;
const XML_HEADERS = {
  'content-type': 'application/xml; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'cache-control': 'public, max-age=3600, s-maxage=86400',
};

function html(body, status = 200) {
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

function sitemapIndex() {
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    SITES.map((s) => `  <sitemap><loc>${HUB}${s}/sitemap.xml</loc><lastmod>${BUILD_DATE}</lastmod></sitemap>`).join('\n') +
    '\n</sitemapindex>\n';
  return new Response(body, { status: 200, headers: XML_HEADERS });
}

// Valid XML on failure — never an HTML page at a .xml URL.
function xmlUnavailable(site, status) {
  const body = '<?xml version="1.0" encoding="UTF-8"?>\n' +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `  <!-- upstream ${site} returned ${status}; retry later -->\n` +
    '</urlset>\n';
  return new Response(body, {
    status: 503,
    headers: { ...XML_HEADERS, 'retry-after': '3600', 'cache-control': 'no-store' },
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);

    // Master sitemap index - one URL Google can read to find every site sitemap.
    // /sitemap.xml is an alias: it is the path Google probes by default.
    if (url.pathname === '/sitemap-index.xml' || url.pathname === '/sitemap.xml') {
      return sitemapIndex();
    }

    if (url.pathname === '/robots.txt') {
      return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${HUB}sitemap-index.xml\n`, {
        status: 200,
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600' },
      });
    }

    if (parts.length === 0) {
      const rows = SITES.map(
        (s) => `<li><a href="/${s}/sitemap.xml">${s}</a> · <a href="/${s}/robots.txt">robots</a></li>`
      ).join('');
      return html(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>SKM Sitemap Hub — every site sitemap in one place</title>
<meta name="description" content="Index of every SKM network sitemap. One reliable fetch path for search engines.">
<meta name="google-site-verification" content="Y_eKs_NNxezM-xRutg7oqy5Ga7qwl1W_ZbIPLGmn3pI">
<link rel="canonical" href="${HUB}sitemap-index.xml">
<style>body{font:15px/1.6 system-ui,sans-serif;max-width:44rem;margin:2rem auto;padding:0 1rem}
a{color:#0b7285}li{margin:.25rem 0}</style></head><body>
<h1>SKM Sitemap Hub</h1>
<p>${SITES.length} sitemaps. One host. Fetched from each site's origin with edge caching.</p>
<p><a href="/sitemap-index.xml">sitemap-index.xml</a> — submit this one URL, not the ${SITES.length} below.</p>
<ul>${rows}</ul></body></html>`);
    }

    // Google Search Console - HTML FILE verification method.
    // Content must be exactly this one line, served at the site root.
    if (url.pathname === '/google89ab3618a1b62b6f.html') {
      return new Response('google-site-verification: google89ab3618a1b62b6f.html', {
        status: 200,
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' },
      });
    }

    const site = parts[0];
    const file = parts[1];
    if (!SITES.includes(site) || (file !== 'sitemap.xml' && file !== 'robots.txt')) {
      return html('<h1>404</h1><p>Unknown site or file.</p>', 404);
    }

    const target = `${ORIGIN(site)}/${file}`;
    // Stable cache key per site+file so a stale copy can be replayed on failure.
    const cache = caches.default;
    const cacheKey = new Request(`https://sitemap-hub-cache.internal/${site}/${file}`);

    let resp = null;
    try {
      resp = await fetch(target, {
        cf: { cacheTtl: 3600, cacheEverything: true },
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
      });
    } catch (err) {
      resp = null;
    }

    let body = null;
    if (resp && resp.ok) {
      body = await resp.text();
      const t = body.trimStart();
      // A 200 with an empty body or an HTML page is not a sitemap.
      const looksXml = t.startsWith('<?xml') || t.startsWith('<urlset') || t.startsWith('<sitemapindex');
      if (!looksXml) body = null;
    }

    if (body) {
      const out = new Response(body, {
        status: 200,
        headers: file === 'robots.txt'
          ? { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600, s-maxage=86400' }
          : XML_HEADERS,
      });
      // Keep a copy to replay when the origin next flaps.
      ctx.waitUntil(cache.put(cacheKey, new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=604800' } })));
      return out;
    }

    // Origin failed — stale-if-error: replay the last good copy.
    const stale = await cache.match(cacheKey);
    if (stale) {
      const staleBody = await stale.text();
      const t = staleBody.trimStart();
      const looksXml = t.startsWith('<?xml') || t.startsWith('<urlset') || t.startsWith('<sitemapindex');
      if (looksXml || file === 'robots.txt') {
        return new Response(staleBody, {
          status: 200,
          headers: {
            ...(file === 'robots.txt'
              ? { 'content-type': 'text/plain; charset=utf-8' }
              : XML_HEADERS),
            'x-served-stale': '1',
            'cache-control': 'public, max-age=600, s-maxage=3600',
          },
        });
      }
    }

    if (file === 'robots.txt') {
      return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${HUB}sitemap-index.xml\n`, {
        status: 200,
        headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' },
      });
    }
    return xmlUnavailable(site, resp ? resp.status : 'fetch-error');
  },
};
// trigger 2026-11-22T15:52:00Z
