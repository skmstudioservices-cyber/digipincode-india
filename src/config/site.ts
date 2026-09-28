// Central site config — single source of truth.
// Custom domain link hote hi sirf SITE_URL change karo, baaki sab auto-switch.
export const SITE = {
  name: 'Digipincode',
  url: 'https://digipincode.india-in.workers.dev',
  email: 'skmstudio.services@gmail.com',
  title: 'India Pincode Directory',
  tagline: 'Every pincode, village, and panchayat in India — searchable.',
  sitemapPath: '/sitemap.xml',
};

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/search', label: 'Search' },
  { href: '/states', label: 'States' },
  { href: '/digipin/', label: 'DIGIPIN' },
  { href: '/chhath/', label: 'Chhath 2026' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

export const FOOTER_LINKS = [
  { href: '/about', label: 'About Us' },
  { href: '/contact', label: 'Contact Us' },
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Use' },
  { href: '/disclaimer', label: 'Disclaimer' },
];

// Freshness dates — REAL dates only, from git history. Update ONLY when the
// thing actually changes (fake freshness = spam signal for crawlers).
// firstPublished: repo + directory first built (repo created 14 Sep 2026)
// dataVerified:   last sql/ data commit (India Post / LGD refresh)
// codeUpdated:    last src/ commit (site code + pages)
export const FRESHNESS = {
  firstPublished: '2026-09-14',
  dataVerified: '2026-09-22',
  codeUpdated: '2026-09-29',
};

// "14 September 2026" style formatter for visible <time> elements.
export function fmtDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
}
