// TODO(Antigravity): implement per seo/PLAN-antigravity-brief.md — WS3
// POST /api/distance  body: { from: string, to: string } (6-digit pincodes)
// -> { from: {pincode, office}, to: {...}, km: number }
// 1. D1: fetch lat/long for both pincodes (read schema.sql for exact columns)
// 2. Haversine in km; 404 if either pincode not found; 400 on bad input
export const POST: PagesFunction = async ({ request, env }) => {
  // TODO(Antigravity)
  return new Response(JSON.stringify({ error: 'not implemented' }), { status: 501 });
};
