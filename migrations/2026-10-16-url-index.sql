-- 16 Oct 2026: url_index keyset reads (sitemap parts) — ensure url_path is indexed.
-- Fixes the 24.7M-row/day OFFSET scans (94% of pincode-india-db reads).
CREATE INDEX IF NOT EXISTS idx_url_index_path ON url_index(url_path);
CREATE INDEX IF NOT EXISTS idx_meta_k ON meta(k);
