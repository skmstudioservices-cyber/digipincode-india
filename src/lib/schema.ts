// src/lib/schema.ts — local + location schema builders (15 Oct 2026).
// Used by every location card and map pin so Google (and AI engines) understand
// each place: LocalBusiness / Place / GeoCoordinates / PostalAddress /
// OpeningHoursSpecification / AggregateRating / ItemList / FAQPage / BreadcrumbList.
// Pure functions — no side effects. Pass straight into a <script type="application/ld+json">.

type Any = Record<string, any>;

export function postalAddress(o: Any = {}): Any {
  return {
    '@type': 'PostalAddress',
    streetAddress: o.street || undefined,
    addressLocality: o.city || undefined,
    addressRegion: o.state || undefined,
    postalCode: o.pincode || undefined,
    addressCountry: o.country || 'IN',
  };
}

export function geo(lat?: number, lng?: number): Any | undefined {
  return (typeof lat === 'number' && typeof lng === 'number')
    ? { '@type': 'GeoCoordinates', latitude: lat, longitude: lng }
    : undefined;
}

export function openingHours(specs: Any[] = []): Any[] | undefined {
  // specs: [{ days: ['Mo','Tu'], opens: '06:00', closes: '22:00' }]
  if (!specs.length) return undefined;
  return specs.map((s) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: (s.days || []).map((d: string) => `https://schema.org/${d}`),
    opens: s.opens,
    closes: s.closes,
  }));
}

export function aggregateRating(rating?: number, count?: number): Any | undefined {
  return (typeof rating === 'number' && count)
    ? { '@type': 'AggregateRating', ratingValue: rating, reviewCount: count, bestRating: 5 }
    : undefined;
}

/** A single real business/place — the strongest local signal Google recognises. */
export function localBusiness(o: Any): Any {
  return {
    '@context': 'https://schema.org',
    '@type': o.type || 'LocalBusiness',
    '@id': o.url || undefined,
    name: o.name,
    description: o.description || undefined,
    url: o.url || undefined,
    image: o.image || undefined,
    telephone: o.phone || undefined,
    priceRange: o.priceRange || undefined,
    address: postalAddress(o.address || {}),
    geo: geo(o.lat, o.lng),
    openingHoursSpecification: openingHours(o.hours),
    aggregateRating: aggregateRating(o.rating, o.reviews),
    areaServed: o.areaServed || undefined,
    sameAs: o.sameAs || undefined,
  };
}

/** Lighter entity for a location that is not a business (park, ghat, station…). */
export function place(o: Any): Any {
  return {
    '@context': 'https://schema.org',
    '@type': o.type || 'Place',
    name: o.name,
    description: o.description || undefined,
    url: o.url || undefined,
    address: postalAddress(o.address || {}),
    geo: geo(o.lat, o.lng),
    containedInPlace: o.containedIn || undefined,
  };
}

/** Wrap many cards/pins into one ItemList so the whole block is machine-readable. */
export function itemListOfPlaces(name: string, items: Any[], type = 'Place'): Any {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: { '@type': type, name: it.name, url: it.url || undefined, geo: geo(it.lat, it.lng) },
    })),
  };
}

export function faqPage(faqs: [string, string][]): Any {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(([q, a]) => ({
      '@type': 'Question', name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  };
}

export function breadcrumb(items: [string, string?][]): Any {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map(([name, url], i) => ({
      '@type': 'ListItem', position: i + 1, name, item: url || undefined,
    })),
  };
}
