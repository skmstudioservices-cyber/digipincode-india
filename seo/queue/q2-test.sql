-- gsc_digipincode_blogger — GSC search analytics import (digitalpincode.blogspot.com)
-- Source: GSC API, sc-domain:digitalpincode.blogspot.com, window 2025-05-22 to 2026-09-19 (full ~16-month retention).
-- Re-pullable from GSC (16-month retention). INSERT OR IGNORE = idempotent re-run.
CREATE TABLE IF NOT EXISTS gsc_digipincode_blogger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  ctr REAL,
  position REAL,
  window_start TEXT NOT NULL,
  window_end TEXT NOT NULL,
  pulled_at TEXT DEFAULT (datetime('now')),
  UNIQUE(query)
);

INSERT OR IGNORE INTO gsc_digipincode_blogger (query, clicks, impressions, ctr, position, window_start, window_end) VALUES
('faridabad pin code',0,22,0.000000,77.68,'2025-05-22','2026-09-19'),
('rtc x roads pincode',0,17,0.000000,11.53,'2025-05-22','2026-09-19'),
('noida pin code sector 18',0,13,0.000000,10.31,'2025-05-22','2026-09-19'),
('kanpur pin code',0,11,0.000000,74.36,'2025-05-22','2026-09-19'),
('t nagar which taluk',0,10,0.000000,8.60,'2025-05-22','2026-09-19');
