-- Nightly rollup: raw -> daily and weekly aggregates.
-- Idempotent: INSERT OR REPLACE on the composite primary key.
-- Run for the previous UTC day (D1 quota resets at 00:00 UTC).

-- 1. page-level daily
INSERT OR REPLACE INTO agg_daily (day, site_id, path, sessions, pageviews, engaged_ms, avg_scroll_pct, clicks, bots)
SELECT
  date(pv.entered_at)                                   AS day,
  s.site_id                                             AS site_id,
  pv.path                                               AS path,
  COUNT(DISTINCT pv.session_id)                         AS sessions,
  COUNT(*)                                              AS pageviews,
  COALESCE(SUM(pv.engaged_ms), 0)                       AS engaged_ms,
  COALESCE(AVG(pv.scroll_max_pct), 0)                   AS avg_scroll_pct,
  COALESCE((SELECT COUNT(*) FROM event e
            WHERE e.path = pv.path
              AND date(e.created_at) = date(pv.entered_at)), 0) AS clicks,
  SUM(CASE WHEN s.is_bot = 1 THEN 1 ELSE 0 END)         AS bots
FROM pageview pv
JOIN session s ON s.id = pv.session_id
WHERE date(pv.entered_at) = date('now', '-1 day')
GROUP BY day, s.site_id, pv.path;

-- 2. weekly rollup from the daily rows (cheap, no raw scan)
INSERT OR REPLACE INTO agg_weekly (week_start, site_id, path, sessions, pageviews, engaged_ms, avg_scroll_pct, clicks, bots)
SELECT
  date(d.day, 'weekday 1', '-7 days')  AS week_start,
  d.site_id, d.path,
  SUM(d.sessions), SUM(d.pageviews), SUM(d.engaged_ms),
  AVG(d.avg_scroll_pct), SUM(d.clicks), SUM(d.bots)
FROM agg_daily d
WHERE d.day >= date('now', '-8 days')
GROUP BY week_start, d.site_id, d.path;

-- 3. area daily
INSERT OR REPLACE INTO agg_area_daily (day, site_id, path, area_name, views, visible_ms, clicks)
SELECT
  date(pv.entered_at), s.site_id, pv.path, a.area_name,
  COUNT(*), COALESCE(SUM(a.visible_ms), 0), COALESCE(SUM(a.clicks), 0)
FROM area a
JOIN pageview pv ON pv.id = a.pageview_id
JOIN session s ON s.id = pv.session_id
WHERE date(pv.entered_at) = date('now', '-1 day')
GROUP BY 1,2,3,4;

-- 4. geo daily (coarse geohash = locality / catchment)
INSERT OR REPLACE INTO agg_geo_daily (day, site_id, geohash_coarse, colo, sessions)
SELECT date(started_at), site_id, COALESCE(geohash_coarse, 'unknown'), COALESCE(colo, 'unknown'), COUNT(*)
FROM session
WHERE date(started_at) = date('now', '-1 day')
GROUP BY 1,2,3,4;
