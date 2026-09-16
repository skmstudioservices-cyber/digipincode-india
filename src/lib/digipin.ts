// TODO(Antigravity): implement per seo/PLAN-antigravity-brief.md — WS2 DigiPIN tools
// Pure-TS implementation of India Post / DoT DIGIPIN (10-character digital address, ~4m grid).
// CRITICAL: implement from the official spec — search "India Post DIGIPIN technical documentation"
// (India Post circular with IIT Hyderabad, May 2024) for the exact grid, bounds and test vectors.
// Known parameters to verify against the spec before coding:
//   - Grid bounds: lat 2.5..38.5, lng 63.5..99.5 (10 levels of 4x4 subdivisions)
//   - 10 levels -> precision ~3.8m; digit characters L/G/2/3/4/5/6/7/8/9 mapped per quadrant
//   - This is quadrant-recursive: each level halves lat/lng into 4x4 and appends one character.
// Exports needed:
//   export function encodeDigipin(lat: number, lng: number): string
//   export function decodeDigipin(digipin: string): { lat: number; lng: number }
//   export function assertValidDigipin(digipin: string): boolean
// Unit tests live in scripts/test-digipin.mjs — run `node scripts/test-digipin.mjs` after implementing.
export function encodeDigipin(_lat: number, _lng: number): string {
  // TODO(Antigravity)
  throw new Error('not implemented');
}
export function decodeDigipin(_digipin: string): { lat: number; lng: number } {
  // TODO(Antigravity)
  throw new Error('not implemented');
}
