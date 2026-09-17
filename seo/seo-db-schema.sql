-- seo-keywords-db — cross-site SEO intelligence database (all sites)
-- One DB, multiple tables. D1 free tier = 10 DBs max, so consolidate here.

-- Master keyword registry for every site
CREATE TABLE IF NOT EXISTS keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site TEXT NOT NULL,                -- digipincode | mapsnearme | examstatus | ...
  keyword TEXT NOT NULL,
  intent TEXT,                      -- info | commercial | transactional | navigational
  volume INTEGER,                    -- est monthly searches
  difficulty REAL,                  -- 0-100
  priority REAL,                    -- computed priority score (volume/difficulty/etc)
  cluster TEXT,                     -- topic cluster
  target_url TEXT,
  status TEXT DEFAULT 'planned',    -- planned | created | indexing | ranking | won | dropped
  position REAL,                    -- current avg GSC position
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  notes TEXT,
  updated_at TEXT DEFAULT (datetime('now')),
  UNIQUE(site, keyword)
);

-- Daily GSC snapshots (queries + pages, per site)
CREATE TABLE IF NOT EXISTS gsc_daily (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  site TEXT NOT NULL,
  dimension TEXT NOT NULL,          -- 'query' | 'page'
  key TEXT NOT NULL,                 -- the query text or page URL
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  position REAL,
  UNIQUE(date, site, dimension, key)
);

-- Negative / blocked keywords (wrong intent, waste, spam)
CREATE TABLE IF NOT EXISTS negative_keywords (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site TEXT NOT NULL,
  keyword TEXT NOT NULL,
  reason TEXT,
  added_on TEXT DEFAULT (date('now')),
  UNIQUE(site, keyword)
);

-- On-site internal search log (what users actually search = keyword gold)
CREATE TABLE IF NOT EXISTS internal_search (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site TEXT NOT NULL,
  term TEXT NOT NULL,
  results INTEGER,
  searched_at TEXT DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_internal_search_term ON internal_search(site, term);

-- Ideas / experiments backlog
CREATE TABLE IF NOT EXISTS backlog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  site TEXT,
  item TEXT NOT NULL,
  type TEXT,                        -- page | tool | experiment | fix
  status TEXT DEFAULT 'open',
  created_at TEXT DEFAULT (datetime('now'))
);
