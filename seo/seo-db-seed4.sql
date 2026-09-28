-- Seed batch 4 (20 Sep 2026): Karva Chauth hub + Diwali city pages (digipincode).
-- Idempotent: INSERT OR IGNORE.

-- ===== KARVA CHAUTH (digipincode — /karva-chauth/ hub, computed city moonrise table) =====
INSERT OR IGNORE INTO keywords (site, keyword, intent, cluster, target_url, status, notes) VALUES
('digipincode','karva chauth 2026','info','seasonal','/karva-chauth/','created','Head term — hub live, 29 Oct 2026.'),
('digipincode','karva chauth 2026 date','info','seasonal','/karva-chauth/','created','29 October 2026 — quick-answer box.'),
('digipincode','karva chauth 2026 kab hai','info','seasonal','/karva-chauth/','created','Hindi phrasing — same intent.'),
('digipincode','karva chauth moonrise time 2026','info','seasonal','/karva-chauth/','created','CORE intent — computed city table.'),
('digipincode','karva chauth moonrise time today','info','seasonal','/karva-chauth/','created','Time-sensitive variant — spikes on the day.'),
('digipincode','karva chauth moonrise time delhi','info','seasonal','/karva-chauth/','created','City moonrise — table row on hub.'),
('digipincode','karva chauth moonrise time mumbai','info','seasonal','/karva-chauth/','created','City moonrise — late ~9 PM in Mumbai.'),
('digipincode','karva chauth vrat katha','info','seasonal','/karva-chauth/','created','Katha section — Queen Veeravati.'),
('digipincode','karva chauth puja samagri list','info','seasonal','/karva-chauth/','created','Samagri checklist section.'),
('digipincode','karva chauth puja muhurat 2026','info','seasonal','/karva-chauth/','created','5:38-6:56 PM Delhi — quick answer.'),
('digipincode','karva chauth sargi time','info','seasonal','/karva-chauth/','created','Sargi deadline = sunrise per city.'),
('digipincode','karva chauth vrat vidhi','info','seasonal','/karva-chauth/','created','Step-by-step vidhi section.'),
('digipincode','karva chauth fast duration','info','seasonal','/karva-chauth/','created','Computed fast hours per city.'),
('digipincode','karva chauth 2026 usa canada date','info','seasonal','/karva-chauth/','created','NRI note — 28 Oct abroad.');

-- ===== DIWALI (digipincode — /diwali/ hub + 45 city pages) =====
INSERT OR IGNORE INTO keywords (site, keyword, intent, cluster, target_url, status, notes) VALUES
('digipincode','diwali 2026','info','seasonal','/diwali/','created','Head term — hub live, 8 Nov 2026.'),
('digipincode','diwali 2026 date','info','seasonal','/diwali/','created','8 November 2026 (Sunday).'),
('digipincode','diwali kab hai 2026','info','seasonal','/diwali/','created','Hindi phrasing — same intent.'),
('digipincode','diwali 2026 calendar','info','seasonal','/diwali/','created','5-11 Nov cluster table.'),
('digipincode','lakshmi puja muhurat 2026','info','seasonal','/diwali/','created','Core intent — Delhi 5:54-7:50 PM + city pages.'),
('digipincode','lakshmi puja muhurat 2026 city wise','info','seasonal','/diwali/','created','City-wise intent — 45 city pages.'),
('digipincode','dhanteras 2026 muhurat','info','seasonal','/diwali/','created','6 Nov, 6:03-7:59 PM Delhi.'),
('digipincode','dhanteras 2026 date','info','seasonal','/diwali/','created','Friday 6 November 2026.'),
('digipincode','govardhan puja 2026 date','info','seasonal','/diwali/','created','2026 oddity — 10 Nov (gap day).'),
('digipincode','bhai dooj 2026 date','info','seasonal','/diwali/','created','Wednesday 11 November 2026.'),
('digipincode','choti diwali 2026 date','info','seasonal','/diwali/','created','Same day as Diwali in 2026 — 8 Nov.'),
('digipincode','diwali lakshmi puja samagri list','info','seasonal','/diwali/','created','Samagri checklist.'),
('digipincode','lakshmi puja vidhi diwali','info','seasonal','/diwali/','created','Step-by-step vidhi.'),
('digipincode','why diwali is late in 2026','info','seasonal','/diwali/','created','Adhik Maas explainer — differentiator.'),
('digipincode','diwali in delhi 2026','info','seasonal','/diwali/delhi','created','City page — markets + muhurat.'),
('digipincode','diwali in mumbai 2026','info','seasonal','/diwali/mumbai','created','City page — Crawford Market.'),
('digipincode','diwali in jaipur 2026','info','seasonal','/diwali/jaipur','created','City page — Johari Bazaar lights.'),
('digipincode','diwali in varanasi 2026','info','seasonal','/diwali/varanasi','created','City page — ghats + Dev Deepawali.'),
('digipincode','diwali in amritsar 2026','info','seasonal','/diwali/amritsar','created','City page — Golden Temple Bandi Chhor Divas.'),
('digipincode','diwali in ayodhya 2026 deepotsav','info','seasonal','/diwali/ayodhya','created','City page — Deepotsav Ram Ki Paidi.'),
('digipincode','kali puja 2026 kolkata','info','seasonal','/diwali/kolkata','created','Bengal variant — Kali Puja pandals.'),
('digipincode','diwali 2026 [city] muhurat','info','seasonal','','planned','PATTERN: 45 city pages live — computed muhurat each.');
