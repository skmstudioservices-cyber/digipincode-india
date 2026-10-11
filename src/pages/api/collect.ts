// /api/collect — first-party, anonymous analytics (B8).
// Stores one row per event in D1 `events`. No cookies, no PII, no precise location.
// D1 WRITES ONLY (never read here) so it can't burn the read budget.
export const prerender = false;

export async function POST({ request, locals }: any) {
  try {
    const b = await request.json().catch(() => ({}));
    const db = locals?.runtime?.env?.DB;
    if (!db?.prepare) return new Response('ok');
    const path = String(b.path || '').slice(0, 200);
    const ref = String(b.ref || '').slice(0, 200);
    const event = String(b.event || 'view').slice(0, 40);
    const dwell = Math.min(3600, Math.max(0, Number(b.dwell) || 0));
    if (!path) return new Response('ok');
    await db
      .prepare('INSERT INTO events (ts, path, ref, event, dwell) VALUES (?, ?, ?, ?, ?)')
      .bind(new Date().toISOString(), path, ref, event, dwell)
      .run();
  } catch {
    /* analytics must never break anything */
  }
  return new Response('ok', { headers: { 'content-type': 'text/plain', 'cache-control': 'no-store' } });
}
