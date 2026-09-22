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

INSERT OR IGNORE INTO emergency_kw_location (keyword, intent, volume, difficulty, priority, target_url, status, notes) VALUES
('blood bank near me open now','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('24-hour blood bank near me','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('government blood bank near me','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('hospitals with blood banks near me','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)'),
('red cross blood donation center near me','transactional',NULL,NULL,NULL,NULL,'planned','Notion: Blood Bank & Emergency Directory Niche Research (21 Sep 2026)');
