// SKM Sitemap Hub — one reliable fetch path for every site.
// GET /                      -> HTML index of every sitemap
// GET /<site>/sitemap.xml    -> that site's sitemap, proxied from origin with edge cache
// GET /<site>/robots.txt     -> that site's robots.txt, proxied
//
// Why this exists: every *.pages.dev sitemap endpoint flaps between 200, 204 and
// 504 at the edge. Workers do not. This gives Google one host that answers.

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
  'isrotracker', 'issspotter', 'bharatlive', 'asiangamesmedaltally2026',
  'subhammaddheshiya', 'skmstudio',
];

const ORIGIN = (site) => `https://${site}.pages.dev`;
const XML_HEADERS = {
  'content-type': 'application/xml; charset=utf-8',
  'x-content-type-options': 'nosniff',
  'cache-control': 'public, max-age=3600, s-maxage=86400',
};

function html(body, status = 200) {
  return new Response(body, { status, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);

    if (parts.length === 0) {
      const rows = SITES.map(
        (s) => `<li><a href="/${s}/sitemap.xml">${s}</a> · <a href="/${s}/robots.txt">robots</a></li>`
      ).join('');
      return html(`<!doctype html><html lang="en"><head><meta charset="utf-8">
<title>SKM Sitemap Hub</title><meta name="robots" content="noindex">
<meta name="google-site-verification" content="Y_eKs_NNxezM-xRutg7oqy5Ga7qwl1W_ZbIPLGmn3pI">
<style>body{font:15px/1.6 system-ui,sans-serif;max-width:44rem;margin:2rem auto;padding:0 1rem}
a{color:#0b7285}li{margin:.25rem 0}</style></head><body>
<h1>SKM Sitemap Hub</h1>
<p>${SITES.length} sitemaps. One host. Fetched from each site's origin with edge caching.</p>
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
    let resp;
    try {
      resp = await fetch(target, {
        cf: { cacheTtl: 3600, cacheEverything: true },
        headers: { 'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
      });
    } catch (err) {
      return html(`<h1>502</h1><p>Upstream fetch failed for ${site}.</p>`, 502);
    }

    if (!resp.ok) {
      return html(`<h1>${resp.status}</h1><p>Upstream ${site}/${file} returned ${resp.status}.</p>`, 502);
    }

    const body = await resp.text();
    // A 204 or empty body upstream must never be passed through as success.
    if (!body || !body.trim() || body.trimStart().startsWith('<')) {
      if (!body.trimStart().startsWith('<?xml') && !body.trimStart().startsWith('<urlset') && !body.trimStart().startsWith('<sitemapindex')) {
        return html(`<h1>502</h1><p>Upstream ${site}/${file} returned an empty or non-XML body.</p>`, 502);
      }
    }

    if (file === 'robots.txt') {
      return new Response(body, { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'public, max-age=3600, s-maxage=86400' } });
    }
    return new Response(body, { status: 200, headers: XML_HEADERS });
  },
};
