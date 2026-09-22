-- village_amenities — one row per village, fills the Facilities section
-- (Census 2011 amenities, source: data.gov.in primary / SHRUG fallback — Q46).
-- Q47: table created EMPTY on purpose. No rows are inserted now, because
-- (a) free tier has 100k rows/day write budget we must save for the real import,
-- (b) example rows with made-up values would show on live village pages —
--     our no-fabricated-data rule. Real values arrive only with the real data.
--
-- Join key: census_code -> villages.census_code (type aligned to source file at import time).

CREATE TABLE IF NOT EXISTS village_amenities (
  census_code     TEXT PRIMARY KEY,
  road            TEXT,
  drinking_water  TEXT,
  electricity     TEXT,
  school          TEXT,
  hospital        TEXT,
  bus_stop        TEXT,
  railway_station TEXT,
  mobile_network  TEXT,
  bank_atm        TEXT,
  famous_for      TEXT,
  source          TEXT DEFAULT 'census2011',
  verified_at     TEXT
);

-- Example rows (REFERENCE ONLY — never executed; shows the format the
-- batched import will write once real census data arrives):
--
-- INSERT INTO village_amenities
--   (census_code, road, drinking_water, electricity, school, hospital, bus_stop,
--    railway_station, mobile_network, bank_atm, famous_for, source, verified_at)
-- VALUES
--   ('06004', 'Paved', 'Tap water',  'Yes', 'Primary school', 'PHC 8 km', 'Yes', 'No', 'All networks', 'No',  NULL, 'census2011', date('now')),
--   ('06005', 'Kachcha', 'Hand pump', 'Yes', 'Primary school', 'No',        'No',  'No', 'Jio, Airtel',  'No',  NULL, 'census2011', date('now'));
--
-- famous_for stays NULL unless user-reported (no-fabrication rule).
