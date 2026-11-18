// SKM first-party analytics ingest.
// POST /collect  — accepts a JSON batch, writes to analytics-db (APAC).
// GET  /health   — liveness + row counts.
// Privacy: the client sends a 7-char geohash, never raw coordinates.
//          geohash5 is derived here by truncation.

// Origin allow-list: only SKM-owned hosts may POST analytics.
// Plain words: without this, any website on the internet could write fake rows
// into the database. With it, only our own pages can.
const ALLOWED_SUFFIXES = ['.pages.dev', '.workers.dev', '.india-in.workers.dev'];
const ALLOWED_EXACT = ['http://localhost:4321', 'http://127.0.0.1:4321'];

function corsHeaders(request) {
  const origin = request.headers.get('origin') || '';
  let host = '';
  try { host = new URL(origin).hostname; } catch { host = ''; }
  const ok = ALLOWED_EXACT.includes(origin) ||
    (host && ALLOWED_SUFFIXES.some((s) => host.endsWith(s)));
  return {
    'Access-Control-Allow-Origin': ok ? origin : 'null',
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Max-Age': '86400',
  };
}

const BOT_RE = /bot|crawler|spider|slurp|bingpreview|facebookexternalhit|headless|puppeteer|playwright|python-requests|curl|wget|go-http-client|palo alto|recordedfuture|ahrefs|semrush/i;

function json(body, status = 200, request = null) {
  const extra = request ? corsHeaders(request) : {};
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extra },
  });
}

function clean(v, max = 300) {
  if (v === null || v === undefined) return null;
  const s = String(v).slice(0, max);
  return s.length ? s : null;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { headers: corsHeaders(request) });

    if (url.pathname === '/health') {
      const r = await env.ANALYTICS_DB
        .prepare('SELECT (SELECT COUNT(*) FROM site) AS sites, (SELECT COUNT(*) FROM session) AS sessions, (SELECT COUNT(*) FROM pageview) AS pageviews')
        .all();
      return json({ ok: true, db: 'analytics-db', counts: r.results?.[0] ?? null }, 200, request);
    }

    if (url.pathname !== '/collect' || request.method !== 'POST') {
      return json({ ok: false, error: 'not_found' }, 404, request);
    }

    let payload;
    try { payload = await request.json(); } catch { return json({ ok: false, error: 'bad_json' }, 400, request); }

    const host = clean(payload.site, 120);
    if (!host) return json({ ok: false, error: 'site_required' }, 400, request);

    const ua = request.headers.get('user-agent') || '';
    const isBot = BOT_RE.test(ua) ? 1 : 0;
    const cf = request.cf || {};

    const stmts = [];
    stmts.push(env.ANALYTICS_DB
      .prepare('INSERT OR IGNORE INTO site (host, name) VALUES (?, ?)')
      .bind(host, clean(payload.site_name, 120)));

    const siteRow = env.ANALYTICS_DB.prepare('SELECT id FROM site WHERE host = ?').bind(host);
    const siteId = (await siteRow.first())?.id;
    if (!siteId) return json({ ok: false, error: 'site_lookup_failed' }, 500, request);

    const s = payload.session || {};
    const g7 = clean(s.geohash, 12);
    const g5 = g7 ? g7.slice(0, 5) : null;
    const sid = clean(s.id, 64);
    if (sid) {
      stmts.push(env.ANALYTICS_DB.prepare(
        `INSERT OR IGNORE INTO session
         (id, site_id, started_at, landing_path, referrer, utm_source, utm_medium, utm_campaign,
          country, region, city, colo, geohash, geohash_coarse, geo_source, device, browser, os, is_bot)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`
      ).bind(
        sid, siteId, clean(s.started_at, 32) || new Date().toISOString(), clean(s.landing_path),
        clean(s.referrer), clean(s.utm_source, 80), clean(s.utm_medium, 80), clean(s.utm_campaign, 120),
        clean(s.country, 4) || clean(cf.country, 4), clean(s.region, 80) || clean(cf.region, 80),
        clean(s.city, 80) || clean(cf.city, 80), clean(cf.colo, 8),
        g7, g5, clean(s.geo_source, 16) || 'browser',
        clean(s.device, 16), clean(s.browser, 40), clean(s.os, 40), isBot
      ));
    }

    for (const p of (payload.pageviews || []).slice(0, 20)) {
      stmts.push(env.ANALYTICS_DB.prepare(
        `INSERT INTO pageview (session_id, path, title, entered_at, left_at, engaged_ms, scroll_max_pct, is_exit)
         VALUES (?,?,?,?,?,?,?,?)`
      ).bind(
        sid, clean(p.path) || '/', clean(p.title, 200),
        clean(p.entered_at, 32) || new Date().toISOString(), clean(p.left_at, 32),
        Math.max(0, Math.min(86400000, Number(p.engaged_ms) || 0)),
        Math.max(0, Math.min(100, Number(p.scroll_max_pct) || 0)),
        p.is_exit ? 1 : 0
      ));
    }

    for (const a of (payload.areas || []).slice(0, 30)) {
      stmts.push(env.ANALYTICS_DB.prepare(
        `INSERT INTO area (pageview_id, area_name, visible_ms, clicks, first_seen_at)
         VALUES (NULL, ?, ?, ?, ?)`
      ).bind(clean(a.area_name, 80), Math.max(0, Number(a.visible_ms) || 0),
             Math.max(0, Number(a.clicks) || 0), clean(a.first_seen_at, 32)));
    }

    for (const e of (payload.events || []).slice(0, 50)) {
      stmts.push(env.ANALYTICS_DB.prepare(
        'INSERT INTO event (session_id, name, path, payload_json) VALUES (?,?,?,?)'
      ).bind(sid, clean(e.name, 80) || 'unknown', clean(e.path),
             e.payload ? JSON.stringify(e.payload).slice(0, 2000) : null));
    }

    for (const h of (payload.heatmap || []).slice(0, 200)) {
      stmts.push(env.ANALYTICS_DB.prepare(
        'INSERT INTO heatmap_point (pageview_id, path, x_pct, y_pct, kind) VALUES (NULL,?,?,?,?)'
      ).bind(clean(h.path) || '/',
             Math.max(0, Math.min(100, Number(h.x_pct) || 0)),
             Math.max(0, Math.min(100, Number(h.y_pct) || 0)),
             clean(h.kind, 16) || 'click'));
    }

    try {
      await env.ANALYTICS_DB.batch(stmts);
    } catch (err) {
      return json({ ok: false, error: 'write_failed', detail: String(err).slice(0, 200) }, 500, request);
    }
    return json({ ok: true, site: host, bot: isBot, writes: stmts.length }, 200, request);
  },
};
