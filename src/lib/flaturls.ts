// src/lib/flaturls.ts — BLOCK:FLAT-LINKS
// Same signatures as lib/urls.ts, but returns the FLAT single-segment URLs.
// Swapping the import in the router turns every internal link flat -> kills the
// 301 chains and the orphan pages in one shot. (Inputs are already slugs.)
const P = 'india-IN';
export const stateUrl = (s: string) => `/${P}-state-${s}/`;
export const districtUrl = (s: string, d: string) => `/${P}-state-${s}-district-${d}/`;
export const subUrl = (s: string, d: string, t: string) => `/${P}-state-${s}-district-${d}-subdistrict-${t}-tehsil-${t}/`;
export const villageUrl = (s: string, d: string, t: string, v: string, p?: string | number) =>
  `/${P}-state-${s}-district-${d}-subdistrict-${t}-tehsil-${t}-village-${v}${p ? `-pincode-${p}` : ''}/`;
export const pincodeUrl = (s: string, d: string, p: string | number) => `/${P}-state-${s}-district-${d}-pincode-${p}/`;
