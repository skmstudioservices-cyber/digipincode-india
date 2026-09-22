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
