// lib/db.ts — D1 query helpers
import type { D1Database } from '@cloudflare/workers-types';

type DB = D1Database;

export async function getStates(db: DB) {
  const { results } = await db.prepare('SELECT * FROM states ORDER BY name').all();
  return results;
}

export async function getStateBySlug(db: DB, slug: string) {
  return db.prepare('SELECT * FROM states WHERE slug = ?').bind(slug).first();
}

export async function getDistrictsByState(db: DB, stateId: number) {
  const { results } = await db.prepare('SELECT * FROM districts WHERE state_id = ? ORDER BY name').bind(stateId).all();
  return results;
}

export async function getDistrictBySlug(db: DB, stateId: number, slug: string) {
  return db.prepare('SELECT * FROM districts WHERE state_id = ? AND slug = ?').bind(stateId, slug).first();
}

export async function getSubDistricts(db: DB, districtId: number) {
  const { results } = await db.prepare('SELECT * FROM sub_districts WHERE district_id = ? ORDER BY name').bind(districtId).all();
  return results;
}

export async function getSubDistrictBySlug(db: DB, districtId: number, slug: string) {
  return db.prepare('SELECT * FROM sub_districts WHERE district_id = ? AND slug = ?').bind(districtId, slug).first();
}

export async function getVillages(db: DB, subDistrictId: number) {
  const { results } = await db.prepare('SELECT * FROM villages WHERE sub_district_id = ? ORDER BY name').bind(subDistrictId).all();
  return results;
}

export async function getPincode(db: DB, pincode: string) {
  return db.prepare(`
    SELECT p.*, s.name AS state_name, s.slug AS state_slug,
           d.name AS district_name, d.slug AS district_slug
    FROM pincodes p
    JOIN states s ON s.id = p.state_id
    JOIN districts d ON d.id = p.district_id
    WHERE p.pincode = ?
  `).bind(pincode).first();
}

export async function getVillagesByPincode(db: DB, pincode: string) {
  const { results } = await db.prepare('SELECT * FROM villages WHERE pincode = ? ORDER BY name').bind(pincode).all();
  return results;
}

export async function getPanchayatsByPincode(db: DB, pincode: string) {
  const { results } = await db.prepare(`
    SELECT DISTINCT l.* FROM lgd_panchayats l
    JOIN villages v ON v.lgd_code = l.lgd_code
    WHERE v.pincode = ?
  `).bind(pincode).all();
  return results;
}

export async function getVillageBySlug(db: DB, slug: string) {
  return db.prepare('SELECT * FROM villages WHERE slug = ?').bind(slug).first();
}

export async function getPanchayatByVillage(db: DB, lgdCode: string) {
  if (!lgdCode) return null;
  return db.prepare('SELECT * FROM lgd_panchayats WHERE lgd_code = ?').bind(lgdCode).first();
}

export async function getPanchayatByCode(db: DB, lgdCode: string) {
  return db.prepare('SELECT * FROM lgd_panchayats WHERE lgd_code = ?').bind(lgdCode).first();
}

export async function getVillagesByPanchayat(db: DB, lgdCode: string) {
  const { results } = await db.prepare('SELECT * FROM villages WHERE lgd_code = ? ORDER BY name').bind(lgdCode).all();
  return results;
}

export async function searchAll(db: DB, q: string) {
  const like = `%${q}%`;
  const pincodes = await db.prepare(`
    SELECT pincode AS title, '/pincode/' || pincode AS url FROM pincodes
    WHERE pincode LIKE ? OR office_name LIKE ? LIMIT 20
  `).bind(like, like).all();

  const villages = await db.prepare(`
    SELECT name AS title, '/village/' || slug AS url FROM villages
    WHERE name LIKE ? LIMIT 20
  `).bind(like).all();

  const panchayats = await db.prepare(`
    SELECT local_body_name AS title, '/panchayat/' || lgd_code AS url FROM lgd_panchayats
    WHERE local_body_name LIKE ? LIMIT 20
  `).bind(like).all();

  return [...pincodes.results, ...villages.results, ...panchayats.results].slice(0, 50);
}