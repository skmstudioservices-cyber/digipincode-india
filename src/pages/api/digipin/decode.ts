// TODO(Antigravity): implement per seo/PLAN-antigravity-brief.md — WS2
// POST /api/digipin/decode  body: { digipin: string } -> { lat: number, lng: number }
// Validate the 10-char DigiPIN; 400 on invalid input. Use decodeDigipin() from src/lib/digipin.ts.
export const POST: PagesFunction = async ({ request }) => {
  // TODO(Antigravity)
  return new Response(JSON.stringify({ error: 'not implemented' }), { status: 501 });
};
