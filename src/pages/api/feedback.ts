// POST /api/feedback — stores feature requests & update reports in D1
export const prerender = false;

export async function POST({ request, locals }) {
  const db = locals.runtime.env.DB;
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
  }

  const type = body.type === 'update' ? 'update' : 'feature';
  const message = String(body.message || '').trim().slice(0, 2000);
  const email = String(body.email || '').trim().slice(0, 200);
  const url = String(body.url || '').slice(0, 500);

  if (!message) {
    return new Response(JSON.stringify({ error: 'Message required' }), { status: 400 });
  }

  await db.prepare(`
    INSERT INTO feedback (type, message, email, url, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `).bind(type, message, email || null, url).run();

  return new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
}