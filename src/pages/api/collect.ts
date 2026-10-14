// /api/collect — first-party, anonymous analytics (B8).
// One row per event in D1 `events`. No cookies, no PII, no precise location.
// D1 WRITES ONLY (never read here) so it can't burn the read budget.
// Accepts both a JSON Blob and a plain-text sendBeacon string. CORS open so our
// own sites (e.g. *.pages.dev near-me family) can beacon to this central collector.
// The `host` field is folded into `path` so events attribute to the right site
// without any schema change.
export const prerender = false;

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
  'cache-control': 'no-store',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST({ request, locals }: any) {
  try {
    const raw = await request.text().catch(() => '');
    let b: any = {};
    try { b = JSON.parse(raw); } catch { b = {}; }
    const db = locals?.runtime?.env?.DB;
    if (!db?.prepare) return new Response('ok', { headers: CORS });

    const host = String(b.host || '').slice(0, 100);
    let path = String(b.path || '').slice(0, 180);
    if (host && path.indexOf(host) !== 0) path = host + path;
    const ref = String(b.ref || '').slice(0, 200);
    const event = String(b.event || 'view').slice(0, 40);
    const dwell = Math.min(3600, Math.max(0, Number(b.dwell) || 0));
    if (!path) return new Response('ok', { headers: CORS });

    await db
      .prepare('INSERT INTO events (ts, path, ref, event, dwell) VALUES (?, ?, ?, ?, ?)')
      .bind(new Date().toISOString(), path, ref, event, dwell)
      .run();
  } catch {
    /* analytics must never break anything */
  }
  return new Response('ok', { headers: CORS });
}
