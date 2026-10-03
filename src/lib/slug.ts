// src/lib/slug.ts — BLOCK:URL-SLUG-SCHEME
// Flat, keyword-first, disambiguated slugs. One segment carries state -> village
// names so duplicate place names (e.g. Sonawali in HP & UP) stay unique.
export function slugify(s: string): string {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
export const flatStateUrl    = (s: string) => `/${slugify(s)}-pin-codes`;
export const flatDistrictUrl = (d: string, s: string) => `/${slugify(d)}-district-pin-codes-${slugify(s)}`;
export const flatSubUrl      = (sd: string, d: string, s: string) => `/${slugify(sd)}-subdistrict-pin-codes-${slugify(d)}-${slugify(s)}`;
export const flatVillageUrl  = (v: string, p: string | number, d: string, s: string) => `/${slugify(v)}-village-pin-code-${p}-${slugify(d)}-${slugify(s)}`;
export const flatPincodeUrl  = (p: string | number, locality: string, d: string, s: string) => `/pin-code-${p}-${slugify(locality)}-${slugify(d)}-${slugify(s)}`;
