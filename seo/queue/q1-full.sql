-- Emergency / blood-bank directory keyword tables (22 Sep 2026 queue)
-- Source: Notion page 'Blood Bank & Emergency Directory — Niche Research' (verified 21 Sep).
-- 27 keywords, 6 category tables. INSERT OR IGNORE + IF NOT EXISTS = idempotent.


CREATE TABLE IF NOT EXISTS emergency_kw_location (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  intent TEXT,
  volume INTEGER,
  difficulty REAL,
  priority REAL,
  target_url TEXT,
  status TEXT DEFAULT 'planned',
  notes TEXT,
  added_on TEXT DEFAULT (date('now')),
  UNIQUE(keyword)
);

CREATE TABLE IF NOT EXISTS emergency_kw_blood_stock (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  intent TEXT,
  volume INTEGER,
  difficulty REAL,
  priority REAL,
  target_url TEXT,
  status TEXT DEFAULT 'planned',
  notes TEXT,
  added_on TEXT DEFAULT (date('now')),
  UNIQUE(keyword)
);

CREATE TABLE IF NOT EXISTS emergency_kw_donors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  intent TEXT,
  volume INTEGER,
  difficulty REAL,
  priority REAL,
  target_url TEXT,
  status TEXT DEFAULT 'planned',
  notes TEXT,
  added_on TEXT DEFAULT (date('now')),
  UNIQUE(keyword)
);

CREATE TABLE IF NOT EXISTS emergency_kw_eligibility (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  intent TEXT,
  volume INTEGER,
  difficulty REAL,
  priority REAL,
  target_url TEXT,
  status TEXT DEFAULT 'planned',
  notes TEXT,
  added_on TEXT DEFAULT (date('now')),
  UNIQUE(keyword)
);

CREATE TABLE IF NOT EXISTS emergency_kw_medical_terms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  intent TEXT,
  volume INTEGER,
  difficulty REAL,
  priority REAL,
  target_url TEXT,
  status TEXT DEFAULT 'planned',
  notes TEXT,
  added_on TEXT DEFAULT (date('now')),
  UNIQUE(keyword)
);

CREATE TABLE IF NOT EXISTS emergency_kw_icu_beds (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  keyword TEXT NOT NULL,
  intent TEXT,
  volume INTEGER,
  difficulty REAL,
  priority REAL,
  target_url TEXT,
  status TEXT DEFAULT 'planned',
  notes TEXT,
  added_on TEXT DEFAULT (date('now')),
  UNIQUE(keyword)
);


INSERT OR IGNORE INTO emergency_kw_location (keyword, intent, volume, difficulty, priority, target_url, status, notes) VALUES
('blood bank near me open now','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('24-hour blood bank near me','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('government blood bank near me','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('hospitals with blood banks near me','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('red cross blood donation center near me','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)');


INSERT OR IGNORE INTO emergency_kw_blood_stock (keyword, intent, volume, difficulty, priority, target_url, status, notes) VALUES
('eRaktKosh blood availability','navigational',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('O negative blood bank near me','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('how to check live blood stock online','info',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('platelet donor search near me','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('plasma bank near me','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)');


INSERT OR IGNORE INTO emergency_kw_donors (keyword, intent, volume, difficulty, priority, target_url, status, notes) VALUES
('blood donation camp near me today','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('red cross blood drive schedule','info',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('blood bank near me to donate','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('how to register for voluntary blood donation','info',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)');


INSERT OR IGNORE INTO emergency_kw_eligibility (keyword, intent, volume, difficulty, priority, target_url, status, notes) VALUES
('blood donation age limit and weight','info',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('can I donate blood if I have a tattoo','info',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('can you donate blood after drinking alcohol','info',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('what to eat before donating blood','info',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('how often can you donate blood','info',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)');


INSERT OR IGNORE INTO emergency_kw_medical_terms (keyword, intent, volume, difficulty, priority, target_url, status, notes) VALUES
('types of blood components','info',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('apheresis meaning','info',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('crossmatching blood procedure','info',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('universal donor vs universal recipient','info',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)');


INSERT OR IGNORE INTO emergency_kw_icu_beds (keyword, intent, volume, difficulty, priority, target_url, status, notes) VALUES
('icu bed availability [city]','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('hospital bed availability near me','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('24 hour emergency hospital near me','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('ambulance number [city]','navigational',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)');
