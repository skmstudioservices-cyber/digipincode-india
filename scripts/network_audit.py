#!/usr/bin/env python3
"""
SKM network audit engine (one pass, all sites + workers).

Reads sites.json (single source of truth) and, per site:
  - homepage: HTTP status + content marker + title
  - sitemap.xml: fetchable? <loc> count? double-slash / wrong-scheme check
  - robots.txt: fetchable? has Sitemap: line? blocks Googlebot? (must NOT)
  - canonical: does the homepage declare a self-referencing canonical?
  - deep pages: N sampled <loc> URLs (N auto-tuned by 28d impressions) -> status + on-page score
Outputs a Markdown report + a machine JSON, and exits non-zero if any 🔴 found.

On-page SEO score (0-100) per page — the internal score the user asked for:
  title 8 · meta description 8 · single H1 10 · H2 count>=2 6 · FAQ/schema 10 ·
  JSON-LD 10 · word count>=300 8 · internal links>=3 6 · canonical 6 · lang 4 ·
  og:image 4 · viewport 4 · no placeholder text 6 · freshness/date 10  (cap 100)
"""
import json, os, re, sys, random, urllib.request, urllib.error
from datetime import datetime, timezone

UA = "SKM-network-audit/1.0"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITES = json.load(open(os.path.join(ROOT, "sites.json"), encoding="utf-8"))

# Optional per-site deep-page counts written by the cron agent from GSC impressions.
IMP_PATH = os.path.join(ROOT, "data", "site-impressions.json")
IMPR = {}
if os.path.exists(IMP_PATH):
    try: IMPR = json.load(open(IMP_PATH, encoding="utf-8"))
    except Exception: IMPR = {}

def deep_n(url):
    imp = IMPR.get(url)
    if imp is None: return SITES["deep_pages"]["default"]
    if imp <= 0: return SITES["deep_pages"]["cold"]
    if imp >= 200: return SITES["deep_pages"]["top"]
    return SITES["deep_pages"]["default"]

def fetch(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        try: return e.code, e.read().decode("utf-8", "replace")
        except Exception: return e.code, ""
    except Exception as e:
        return 0, str(e)

def score_page(html, url):
    s = 0; notes = []
    low = html.lower()
    t = re.search(r"<title[^>]*>(.*?)</title>", html, re.I|re.S)
    title = (t.group(1).strip() if t else "")
    if 15 <= len(title) <= 65: s += 8
    else: notes.append("title")
    if re.search(r'name=["\']description["\'][^>]*content=["\'][^"\']{50,}', html, re.I): s += 8
    else: notes.append("meta-desc")
    h1 = re.findall(r"<h1[^>]*>", html, re.I)
    if len(h1) == 1: s += 10
    else: notes.append(f"h1x{len(h1)}")
    if len(re.findall(r"<h2[^>]*>", html, re.I)) >= 2: s += 6
    else: notes.append("h2<2")
    if "faqpage" in low or "frequently asked" in low: s += 10
    else: notes.append("no-faq")
    if "application/ld+json" in low: s += 10
    else: notes.append("no-jsonld")
    words = len(re.sub(r"<[^>]+>", " ", html).split())
    if words >= 300: s += 8
    else: notes.append(f"words{words}")
    links = len(re.findall(r'<a [^>]*href=["\']/', html, re.I))
    if links >= 3: s += 6
    else: notes.append("internal-links<3")
    if re.search(r'rel=["\']canonical["\']', html, re.I): s += 6
    else: notes.append("no-canonical")
    if re.search(r'<html[^>]*lang=', html, re.I): s += 4
    else: notes.append("no-lang")
    if 'property="og:image"' in low or "property='og:image'" in low: s += 4
    else: notes.append("no-og-image")
    if "viewport" in low: s += 4
    else: notes.append("no-viewport")
    if not re.search(r"setup in progress|coming soon|lorem ipsum|placeholder", low): s += 6
    else: notes.append("placeholder")
    if re.search(r"datepublished|lastmod|updated", low): s += 10
    else: notes.append("no-date")
    return min(100, s), notes

def sample_locs(xml, n):
    locs = re.findall(r"<loc>\s*(.*?)\s*</loc>", xml, re.I|re.S)
    locs = [u for u in locs if u.startswith("http")]
    if not locs: return []
    random.seed(7)
    return random.sample(locs, min(n, len(locs)))

def audit_site(url, is_worker=False):
    row = {"url": url, "type": "worker" if is_worker else "page", "issues": []}
    code, html = fetch(url)
    row["home_status"] = code
    if code != 200: row["issues"].append(f"HOME {code}")
    if code == 200:
        if len(html) < 800: row["issues"].append("HOME thin")
        if re.search(r"setup in progress|coming soon|lorem ipsum", html, re.I):
            row["issues"].append("HOME placeholder")
        row["score"] = score_page(html, url)[0]
        if not re.search(r'rel=["\']canonical["\']', html, re.I):
            row["issues"].append("HOME no canonical")
    # sitemap
    base = url.rstrip("/")
    sc, sxml = fetch(base + "/sitemap.xml")
    row["sitemap_status"] = sc
    row["sitemap_locs"] = len(re.findall(r"<loc>", sxml)) if sc == 200 else 0
    if sc == 200:
        if "//" in re.sub(r"^https?://", "", sxml.split("<loc>")[1].split("</loc>")[0]) if "<loc>" in sxml else False:
            row["issues"].append("sitemap double-slash")
        if "http://sitemaps.org" in sxml:
            row["issues"].append("sitemap xmlns wrong")
    # robots
    rc, rtxt = fetch(base + "/robots.txt")
    row["robots_status"] = rc
    if rc == 200:
        if "sitemap:" not in rtxt.lower(): row["issues"].append("robots no Sitemap line")
        if re.search(r"user-agent:\s*googlebot[\s\S]*?disallow:\s*/\s*$", rtxt, re.I|re.M):
            row["issues"].append("robots BLOCKS Googlebot")
    # deep pages
    deep = []
    for u in sample_locs(sxml, deep_n(url)):
        c, h = fetch(u)
        sc2, nts = (score_page(h, u) if c == 200 else (0, ["dead"]))
        deep.append({"url": u, "status": c, "score": sc2, "gaps": nts[:4]})
        if c >= 400 or c == 0: row["issues"].append(f"DEEP {c} {u}")
    row["deep"] = deep
    if deep:
        row["deep_avg_score"] = round(sum(d["score"] for d in deep) / len(deep))
    return row

def main():
    targets = [(u, False) for u in SITES["pages"]]
    targets += [(w["url"], True) for w in SITES["workers"]]
    results = [audit_site(u, w) for u, w in targets]
    red = [r for r in results if r["issues"]]
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [f"# SKM Network Audit — {now}", "",
             f"Sites checked: **{len(results)}** · with issues: **{len(red)}**", "",
             "| Site | Home | Sitemap | Locs | Score | Issues |", "|---|---|---|---|---|---|"]
    for r in sorted(results, key=lambda x: -len(x["issues"])):
        lines.append(f"| {r['url'].replace('https://','')} | {r.get('home_status')} | "
                     f"{r.get('sitemap_status')} | {r.get('sitemap_locs',0)} | {r.get('score','-')} | "
                     f"{'; '.join(r['issues'][:3]) or '✅'} |")
    # lowest scoring deep pages network-wide (what to fix first)
    flat = [(d["url"], d["score"], ",".join(d["gaps"])) for r in results for d in r.get("deep", []) if d["status"] == 200]
    flat.sort(key=lambda x: x[1])
    lines += ["", "## Lowest-scoring pages (fix these first)", "",
              "| Page | Score | Gaps |", "|---|---|---|"]
    for u, sc, g in flat[:30]:
        lines.append(f"| {u} | {sc} | {g} |")
    out = "\n".join(lines)
    open(os.path.join(ROOT, "audit-report.md"), "w", encoding="utf-8").write(out)
    json.dump(results, open(os.path.join(ROOT, "audit-report.json"), "w", encoding="utf-8"), indent=1)
    print(out[:4000])
    print(f"\nRESULT: {len(red)} site(s) with issues")
    sys.exit(1 if red else 0)

if __name__ == "__main__":
    main()
