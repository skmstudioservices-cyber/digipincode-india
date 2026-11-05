#!/usr/bin/env node
/**
 * bing-submit.mjs — submit a sitemap + a batch of URLs to Bing Webmaster.
 *
 * Uses the same BING_WEBMASTER_API_KEY as bing-pull.yml.
 *   1. GetUserSites      — confirm the site is verified
 *   2. GetUrlSubmissionQuota — how many URLs we may submit today
 *   3. SubmitFeed        — hand Bing the sitemap
 *   4. SubmitUrlBatch    — push up to the remaining quota of URLs
 *
 * Usage: node scripts/bing-submit.mjs https://site/ [maxUrls]
 */
const KEY = process.env.BING_WEBMASTER_API_KEY;
const API = 'https://ssl.bing.com/webmaster/api.svc/json';
const SITE = process.argv[2];
const MAX = Number(process.argv[3] || 200);

if (!KEY) { console.error('BING_WEBMASTER_API_KEY missing'); process.exit(1); }
if (!SITE) { console.error('usage: bing-submit.mjs https://site/ [maxUrls]'); process.exit(1); }

const q = (path, params = {}) =>
  fetch(`${API}/${path}?apikey=${KEY}&${new URLSearchParams(params)}`).then(async (r) => {
    const text = await r.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return { status: r.status, json, text };
  });

const post = (path, body) =>
  fetch(`${API}/${path}?apikey=${KEY}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }).then(async (r) => {
    const text = await r.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}
    return { status: r.status, json, text };
  });

async function collectUrls() {
  const seen = new Set();
  const out = [];
  const queue = [`${SITE}sitemap.xml`];
  while (queue.length && out.length < MAX) {
    const url = queue.shift();
    if (seen.has(url)) continue;
    seen.add(url);
    const r = await fetch(url).catch(() => null);
    if (!r || !r.ok) continue;
    const body = await r.text();
    const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
    if (/<sitemapindex/.test(body)) queue.push(...locs);   // follow every child
    else out.push(...locs);                                 // collect pages
  }
  return out;
}

(async () => {
  const sites = await q('GetUserSites');
  const list = (sites.json?.d || []).map((s) => s.Url);
  console.log(`verified sites in Bing: ${list.length}`);
  if (!list.includes(SITE)) {
    console.log(`NOT VERIFIED: ${SITE} is not in this Bing account`);
    console.log('closest:', list.filter((u) => u.includes(new URL(SITE).hostname)));
    process.exit(2);
  }

  const quota = await q('GetUrlSubmissionQuota', { siteUrl: SITE });
  console.log('quota:', JSON.stringify(quota.json?.d ?? quota.text).slice(0, 200));

  const feed = await post('SubmitFeed', { siteUrl: SITE, feedUrl: `${SITE}sitemap.xml` });
  console.log('SubmitFeed:', feed.status, (feed.json?.d ?? feed.text).toString().slice(0, 160));

  const urls = await collectUrls();
  console.log(`sitemap yielded ${urls.length} URLs`);

  const daily = quota.json?.d?.DailyQuota ?? 0;
  const used = quota.json?.d?.DailyQuotaRemaining ?? daily;
  const budget = Math.min(urls.length, MAX, used || MAX);
  if (!budget) { console.log('no quota left today'); return; }

  const batch = urls.slice(0, budget);
  const res = await post('SubmitUrlBatch', { siteUrl: SITE, urlList: batch });
  console.log(`SubmitUrlBatch: ${res.status} ${(res.json?.d ?? res.text).toString().slice(0, 200)}`);
  console.log(`submitted ${batch.length} URLs`);
  console.log('sample:', batch.slice(0, 5).join('\n  '));
})().catch((e) => { console.error(e); process.exit(1); });
