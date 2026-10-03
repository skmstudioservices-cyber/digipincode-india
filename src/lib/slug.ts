// src/lib/slug.ts — BLOCK:URL-SLUG-SCHEME (LOCKED, SINGLE SEGMENT)
// One flat segment:  /india-IN-state-{s}-district-{d}-subdistrict-{sd}-tehsil-{t}-block-{b}-city-{c}-village-{v}-pincode-{p}-locality-{l}/
// Missing levels are skipped. LGD codes are NOT in URLs (they live in the data).
export const PREFIX = 'india-IN';
export function slugify(s: string): string {
  return String(s ?? '').toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
type Parts = { state?: string; district?: string; subdistrict?: string; tehsil?: string; block?: string; city?: string; village?: string; pincode?: string | number; locality?: string };
export function slugParts(p: Parts): string {
  const seg: string[] = [];
  if (p.state) seg.push(`state-${slugify(p.state)}`);
  if (p.district) seg.push(`district-${slugify(p.district)}`);
  const sub = p.subdistrict || p.tehsil;
  if (sub) seg.push(`subdistrict-${slugify(sub)}`, `tehsil-${slugify(p.tehsil || sub)}`);
  if (p.block) seg.push(`block-${slugify(p.block)}`);
  if (p.city) seg.push(`city-${slugify(p.city)}`);
  if (p.village) seg.push(`village-${slugify(p.village)}`);
  if (p.pincode) seg.push(`pincode-${p.pincode}`);
  if (p.locality) seg.push(`locality-${slugify(p.locality)}`);
  return `${PREFIX}-${seg.join('-')}`;   // bare slug, no slashes
}
export const flatPath = (p: Parts): string => `/${slugParts(p)}/`;   // for display/canonical
export const flatState = (s: string) => flatPath({ state: s });
export const flatDistrict = (d: string, s: string) => flatPath({ state: s, district: d });
export const flatSub = (sd: string, d: string, s: string) => flatPath({ state: s, district: d, subdistrict: sd });
export const flatVillage = (v: string, p: string | number, sd: string, d: string, s: string) => flatPath({ state: s, district: d, subdistrict: sd, village: v, pincode: p });
export const flatPincode = (p: string | number, loc: string, d: string, s: string) => flatPath({ state: s, district: d, city: loc, pincode: p });
