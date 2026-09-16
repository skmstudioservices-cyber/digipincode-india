// TODO(Antigravity): implement per seo/PLAN-antigravity-brief.md — WS2
// POST /api/digipin/encode  body: { lat: number, lng: number } -> { digipin: string }
// Validate lat 2.5..38.5, lng 63.5..99.5 (India bounds); 400 on invalid input.
// Use encodeDigipin() from src/lib/digipin.ts.
export const POST: PagesFunction = async ({ request }) => {
  // TODO(Antigravity)
  return new Response(JSON.stringify({ error: 'not implemented' }), { status: 501 });
};
