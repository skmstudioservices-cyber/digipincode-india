// lib/db.ts — D1 query helpers
import type { D1Database } from '@cloudflare/workers-types';

type DB = D1Database;

// ---------------------------------------------------------------------------
// withRetry: transient D1 read errors (intermittent HTTP 500s observed on
// SSR pages since 21 Sep 2026) recover on a second attempt — re-fetches of
// failing URLs succeed moments later. We retry twice with a short backoff,
// then rethrow so real errors still surface.
// Exported: sitemap.xml.ts and other endpoints wrap their queries in it too.
// ---------------------------------------------------------------------------
export async function withRetry<T>(op: () => Promise<T>, tries = 3): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < tries; i++) {
    try {
      return await op();
    } catch (e) {
      lastErr = e;
      if (i < tries - 1) {
        await new Promise((r) => setTimeout(r, 150 * (i + 1) * (i + 1)));
      }
    }
  }
  throw lastErr;
}

export async function getStates(db: DB) {
  const { results } = await withRetry(() => db.prepare('SELECT * FROM states ORDER BY name').all());
  return results;
}

export async function getStateBySlug(db: DB, slug: string) {
  return withRetry(() => db.prepare('SELECT * FROM states WHERE slug = ?').bind(slug).first());
}

export async function getDistrictsByState(db: DB, stateId: number) {
  const { results } = await withRetry(() =>
    db.prepare('SELECT * FROM districts WHERE state_id = ? ORDER BY name').bind(stateId).all()
  );
  return results;
}

export async function getDistrictBySlug(db: DB, stateId: number, slug: string) {
  return withRetry(() =>
    db.prepare('SELECT * FROM districts WHERE state_id = ? AND slug = ?').bind(stateId, slug).first()
  );
}

export async function getSubDistricts(db: DB, districtId: number) {
  const { results } = await withRetry(() =>
    db.prepare('SELECT * FROM sub_districts WHERE district_id = ? ORDER BY name').bind(districtId).all()
  );
  return results;
}

export async function getSubDistrictBySlug(db: DB, districtId: number, slug: string) {
  return withRetry(() =>
    db.prepare('SELECT * FROM sub_districts WHERE district_id = ? AND slug = ?').bind(districtId, slug).first()
  );
}

export async function getVillages(db: DB, subDistrictId: number) {
  const { results } = await withRetry(() =>
    db.prepare('SELECT * FROM villages WHERE sub_district_id = ? ORDER BY name').bind(subDistrictId).all()
  );
  return results;
}

export async function getPincode(db: DB, pincode: string) {
  return withRetry(() =>
    db.prepare(`
    SELECT p.*, s.name AS state_name, s.slug AS state_slug,
           d.name AS district_name, d.slug AS district_slug
    FROM pincodes p
    JOIN states s ON s.id = p.state_id
    JOIN districts d ON d.id = p.district_id
    WHERE p.pincode = ?
  `).bind(pincode).first()
  );
}

export async function getVillagesByPincode(db: DB, pincode: string) {
  const { results } = await withRetry(() =>
    db.prepare('SELECT * FROM villages WHERE pincode = ? ORDER BY name').bind(pincode).all()
  );
  return results;
}

export async function getPanchayatsByPincode(db: DB, pincode: string) {
  const { results } = await withRetry(() =>
    db.prepare(`
    SELECT DISTINCT l.* FROM lgd_panchayats l
    JOIN villages v ON v.lgd_code = l.lgd_code
    WHERE v.pincode = ?
  `).bind(pincode).all()
  );
  return results;
}

export async function getVillageBySlug(db: DB, slug: string) {
  return withRetry(() =>
    db.prepare(`
    SELECT v.*, s.name AS state_name, s.slug AS state_slug,
           d.name AS district_name, d.slug AS district_slug,
           sd.name AS sub_district_name, sd.slug AS sub_district_slug
    FROM villages v
    LEFT JOIN sub_districts sd ON sd.id = v.sub_district_id
    LEFT JOIN districts d ON d.id = sd.district_id
    LEFT JOIN states s ON s.id = d.state_id
    WHERE v.slug = ?
  `).bind(slug).first()
  );
}

export async function getPanchayatByVillage(db: DB, lgdCode: string) {
  if (!lgdCode) return null;
  return withRetry(() => db.prepare('SELECT * FROM lgd_panchayats WHERE lgd_code = ?').bind(lgdCode).first());
}

export async function getPanchayatByCode(db: DB, lgdCode: string) {
  return withRetry(() => db.prepare('SELECT * FROM lgd_panchayats WHERE lgd_code = ?').bind(lgdCode).first());
}

export async function getVillagesByPanchayat(db: DB, lgdCode: string) {
  const { results } = await withRetry(() =>
    db.prepare('SELECT * FROM villages WHERE lgd_code = ? ORDER BY name').bind(lgdCode).all()
  );
  return results;
}

// Hierarchy helpers (thick content) — full state › district › tehsil context for a village
export async function getVillageHierarchy(db: DB, subDistrictId: number) {
  if (!subDistrictId) return null;
  return withRetry(() =>
    db.prepare(`
    SELECT sd.name AS sd_name, sd.slug AS sd_slug,
           d.id AS district_id, d.name AS district_name, d.slug AS district_slug,
           s.id AS state_id, s.name AS state_name, s.slug AS state_slug
    FROM sub_districts sd
    JOIN districts d ON d.id = sd.district_id
    JOIN states s ON s.id = d.state_id
    WHERE sd.id = ?
  `).bind(subDistrictId).first()
  );
}

export async function getSiblingVillages(db: DB, subDistrictId: number, excludeSlug: string, limit = 12) {
  const { results } = await withRetry(() =>
    db.prepare(`
    SELECT name, slug, pincode, population FROM villages
    WHERE sub_district_id = ? AND slug != ?
    ORDER BY population DESC, name LIMIT ?
  `).bind(subDistrictId, excludeSlug, limit).all()
  );
  return results;
}

export async function getSubdistrictVillageStats(db: DB, subDistrictId: number) {
  if (!subDistrictId) return null;
  return withRetry(() =>
    db.prepare(`
    SELECT COUNT(*) AS village_count, SUM(population) AS total_population
    FROM villages WHERE sub_district_id = ?
  `).bind(subDistrictId).first()
  );
}

// District-level thick content (scoped queries — safe for D1 free tier)
export async function getSubdistrictCountsByState(db: DB, stateId: number) {
  const { results } = await withRetry(() =>
    db.prepare(`
    SELECT district_id, COUNT(*) AS sd_count FROM sub_districts
    WHERE district_id IN (SELECT id FROM districts WHERE state_id = ?)
    GROUP BY district_id
  `).bind(stateId).all()
  );
  return results;
}

export async function getDistrictVillageStats(db: DB, districtId: number) {
  return withRetry(() =>
    db.prepare(`
    SELECT COUNT(*) AS village_count, SUM(v.population) AS total_population
    FROM villages v JOIN sub_districts sd ON sd.id = v.sub_district_id
    WHERE sd.district_id = ?
  `).bind(districtId).first()
  );
}

export async function getTopVillagesByDistrict(db: DB, districtId: number, limit = 12) {
  const { results } = await withRetry(() =>
    db.prepare(`
    SELECT v.name, v.slug, v.pincode, v.population, v.lgd_code, v.sub_district_id
    FROM villages v JOIN sub_districts sd ON sd.id = v.sub_district_id
    WHERE sd.district_id = ? ORDER BY v.population DESC, v.name LIMIT ?
  `).bind(districtId, limit).all()
  );
  return results;
}

export async function searchAll(db: DB, q: string) {
  const like = `%${q}%`;
  // Hierarchy URLs (URL structure v2):
  //   /{state}/district-{d}/{tehsil|taluk}-{t}/village-{v}/pincode-{p}
  //   /{state}/district-{d}/pincode-{p}
  const villages = await withRetry(() =>
    db.prepare(`
    SELECT v.name AS title,
           CASE WHEN sd.slug IS NULL OR d.slug IS NULL OR s.slug IS NULL
                THEN '/village/' || v.slug
                ELSE '/' || s.slug || '/district-' || d.slug || '/' ||
                     (CASE WHEN s.slug IN ('andhra-pradesh','telangana','karnataka','kerala','tamil-nadu','puducherry','maharashtra','gujarat','goa','lakshadweep','andaman-and-nicobar-islands','dadra-and-nagar-haveli','dadra-and-nagar-haveli-and-daman-and-diu','daman-and-diu')
                       THEN 'taluk' ELSE 'tehsil' END) || '-' || sd.slug ||
                     '/village-' || v.slug ||
                     (CASE WHEN v.pincode IS NULL THEN '' ELSE '/pincode-' || v.pincode END)
           END AS url
    FROM villages v
    LEFT JOIN sub_districts sd ON sd.id = v.sub_district_id
    LEFT JOIN districts d ON d.id = sd.district_id
    LEFT JOIN states s ON s.id = d.state_id
    WHERE v.name LIKE ? LIMIT 20
  `).bind(like).all()
  );

  const pincodes = await withRetry(() =>
    db.prepare(`
    SELECT p.pincode AS title,
           '/' || s.slug || '/district-' || d.slug || '/pincode-' || p.pincode AS url
    FROM pincodes p
    JOIN states s ON s.id = p.state_id
    JOIN districts d ON d.id = p.district_id
    WHERE p.pincode LIKE ? OR p.office_name LIKE ? LIMIT 20
  `).bind(like, like).all()
  );

  const panchayats = await withRetry(() =>
    db.prepare(`
    SELECT local_body_name AS title, '/panchayat/' || lgd_code AS url FROM lgd_panchayats
    WHERE local_body_name LIKE ? LIMIT 20
  `).bind(like).all()
  );

  return [...pincodes.results, ...villages.results, ...panchayats.results].slice(0, 50);
}
