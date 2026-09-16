// TODO(Antigravity): implement per seo/PLAN-antigravity-brief.md — WS4
// POST /api/nearest-pincode  body: { lat: number, lng: number } -> { results: [...] }
// Returns the 5 nearest pincode rows by lat/long distance (read schema.sql for the
// exact columns; use a bounding-box WHERE on lat/lng first, then rank in JS — a
// full-table scan on every request is NOT acceptable).
// Used by the homepage "Find pincode of my location" card. 400 on invalid input.
export const POST: PagesFunction = async ({ request, env }) => {
  // TODO(Antigravity)
  return new Response(JSON.stringify({ error: 'not implemented' }), { status: 501 });
};
