-- Per-site keyword tables copy (22 Sep 2026 queue)
-- Copies of the master `keywords` table, one table per site, inside seo-keywords-db
-- (one-DB consolidation rule). Purpose: per-site lookups without a site= filter.
-- Idempotent: CREATE IF NOT EXISTS + INSERT OR IGNORE (UNIQUE(keyword) does the work).

CREATE TABLE IF NOT EXISTS kw_digipincode (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  intent TEXT,
  volume INTEGER,
  difficulty REAL,
  priority REAL,
  cluster TEXT,
  target_url TEXT,
  status TEXT,
  position REAL,
  impressions INTEGER,
  clicks INTEGER,
  notes TEXT,
  updated_at TEXT,
  UNIQUE(keyword)
);
INSERT OR IGNORE INTO kw_digipincode (keyword, intent, volume, difficulty, priority, cluster, target_url, status, position, impressions, clicks, notes, updated_at)
SELECT keyword, intent, volume, difficulty, priority, cluster, target_url, status, position, impressions, clicks, notes, updated_at
FROM keywords WHERE site='digipincode';

CREATE TABLE IF NOT EXISTS kw_mapsnearme (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  intent TEXT,
  volume INTEGER,
  difficulty REAL,
  priority REAL,
  cluster TEXT,
  target_url TEXT,
  status TEXT,
  position REAL,
  impressions INTEGER,
  clicks INTEGER,
  notes TEXT,
  updated_at TEXT,
  UNIQUE(keyword)
);
INSERT OR IGNORE INTO kw_mapsnearme (keyword, intent, volume, difficulty, priority, cluster, target_url, status, position, impressions, clicks, notes, updated_at)
SELECT keyword, intent, volume, difficulty, priority, cluster, target_url, status, position, impressions, clicks, notes, updated_at
FROM keywords WHERE site='mapsnearme';
