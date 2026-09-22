// lib/urls.ts — central URL builders for the hierarchy URL structure v2
// /{state}/district-{district}/{tehsil|taluk}-{subdistrict}/village-{village}/pincode-{p}
// /{state}/district-{district}/pincode-{xxxxxx}   (pincode office pages)
// Change BASE here for a 1-line domain switch.
export const BASE = 'https://digipincode.india-in.workers.dev';

// South & western states use the local word "taluk"; the rest use "tehsil".
const TALUK_STATES = new Set([
  'andhra-pradesh', 'telangana', 'karnataka', 'kerala', 'tamil-nadu', 'puducherry',
  'maharashtra', 'gujarat', 'goa', 'lakshadweep', 'andaman-and-nicobar-islands',
  'dadra-and-nagar-haveli', 'dadra-and-nagar-haveli-and-daman-and-diu', 'daman-and-diu',
]);
export function subWord(stateSlug: string): 'taluk' | 'tehsil' {
  return TALUK_STATES.has(stateSlug) ? 'taluk' : 'tehsil';
}
export const stateUrl = (s: string) => `/${s}`;
export const districtUrl = (s: string, d: string) => `/${s}/district-${d}`;
export const subUrl = (s: string, d: string, t: string) => `/${s}/district-${d}/${subWord(s)}-${t}`;
// Village canonical URL ends with its pincode: .../village-{v}/pincode-{p}
export const villageUrl = (s: string, d: string, t: string, v: string, p?: string | number) =>
  `/${s}/district-${d}/${subWord(s)}-${t}/village-${v}${p ? `/pincode-${p}` : ''}`;
export const pincodeUrl = (s: string, d: string, p: string | number) => `/${s}/district-${d}/pincode-${p}`;
// Accept either local word when parsing incoming paths
export function parseSubSegment(seg: string): string | null {
  if (seg.startsWith('tehsil-')) return seg.slice('tehsil-'.length);
  if (seg.startsWith('taluk-')) return seg.slice('taluk-'.length);
  return null;
}
