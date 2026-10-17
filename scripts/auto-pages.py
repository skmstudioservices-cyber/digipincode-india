#!/usr/bin/env python3
"""
auto-pages.py — SKM Network auto-page engine.

For ANY site (pages.dev, workers.dev, digipincode), when a search query crosses
THRESHOLD impressions, generate a THICK flat page (answer-first + blocks + FAQ +
schema + network cards + long-tail blocks) and commit it.

Design rules (user, 17 Oct 2026):
- FLAT URLs only (e.g. /rest-area-near-me-patna) — no folder hierarchy.
- Hierarchy is expressed via labels/tags + BreadcrumbList schema, not folders.
- Rate-limited (MAX_PER_RUN) so the sitemap grows slowly (no shadow-ban).
- Idempotent: never overwrite an existing page.
- Works for every site in sites.json.

Inputs: a JSON list of {site, slug_prefix, query, impressions, city, niche}.
Output: writes generated HTML files under /scratch/work/auto/out/<site>/<slug>.html
        and prints a JSON manifest for the caller (the cron agent) to commit.
"""
import json, os, re, html, sys

THRESHOLD = 10          # impressions needed before a page is created
MAX_PER_RUN = 8         # per site per run (slow growth)
OUT = "/scratch/work/auto/out"

NET = [("Rest areas near me","https://restareanearme.pages.dev/"),
       ("Toilets near me","https://toiletsnearme.pages.dev/"),
       ("CNG pumps near me","https://cngpumpsnearme.pages.dev/"),
       ("EV chargers near me","https://evchargersnearme.pages.dev/"),
       ("Petrol pumps near me","https://petrolpumpsnearme.pages.dev/"),
       ("Hospitals near me","https://hospitalsnearme.pages.dev/"),
       ("ATMs near me","https://atmsnearme.pages.dev/"),
       ("Hotels near me","https://hotelnearme.pages.dev/"),
       ("Pincode & DIGIPIN","https://digipincode.india-in.workers.dev/")]

LONGTAIL = ["open now","open 24 hours","24 hour","with washroom","with parking",
            "near me now","fast","cheap","best","nearest"]

def slugify(q):
    s = re.sub(r"[^a-z0-9]+", "-", q.lower()).strip("-")
    return re.sub(r"-+", "-", s)

def breadcrumb(base, label, slug):
    items = [{"@type":"ListItem","position":1,"name":"Home","item":base+"/"},
             {"@type":"ListItem","position":2,"name":label,"item":base+"/"}]
    return {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":items}

def faq(q, label, city):
    Q = [
      (f"How do I find {label.lower()} in {city}?",
       f"Use the live map on this page to see {label.lower()} in {city}, or search '{q}' on Google Maps. Filter by distance and check opening hours."),
      (f"Are {label.lower()} in {city} open 24 hours?",
       f"Some are — 24-hour options are common near highways, petrol pumps and airports. The list above marks late/night options where known."),
      (f"What is the nearest {label.lower()} to me in {city}?",
       f"Tap 'Find near me' to use your location; the map shows the closest options in {city} with distance and directions."),
      (f"Are there free {label.lower()} in {city}?",
       "Many are free or low-cost. Pay-and-use facilities are usually cleaner; petrol-pump and mall facilities are reliable defaults."),
    ]
    return Q

def build_page(site, base, label, query, city, niche):
    slug = slugify(f"{niche} near me {city}") if city else slugify(query)
    title = f"{label} in {city} — Map, Hours & Directions ({2026})" if city else f"{label} — Map, Hours & Directions"
    desc = f"Find {label.lower()} in {city or 'India'} — live map, opening hours, directions and tips. Free, no signup."
    ans = (f"The nearest {label.lower()} in {city or 'your area'} are shown on the live map below — "
           f"tap 'Find near me' or type your area. Most run daytime hours; highway and petrol-pump options are likeliest open 24×7.")
    Q = faq(query, label, city or "your city")
    ld_faq = {"@context":"https://schema.org","@type":"FAQPage",
              "mainEntity":[{"@type":"Question","name":a,"acceptedAnswer":{"@type":"Answer","text":b}} for a,b in Q]}
    ld_bc = breadcrumb(base, label, slug)
    ld_item = {"@context":"https://schema.org","@type":"ItemList","name":label,
               "itemListElement":[{"@type":"ListItem","position":i+1,"name":n,"url":u} for i,(n,u) in enumerate(NET)]}
    cards = "".join(f'<a href="{u}">{html.escape(n)}</a>' for n,u in NET)
    ltail = "".join(f'<li>{html.escape(label)} {html.escape(t)} in {html.escape(city or "India")}</li>' for t in LONGTAIL[:6])
    faq_html = "".join(f'<details><summary>{html.escape(a)}</summary><p>{html.escape(b)}</p></details>' for a,b in Q)
    schemas = "\n".join('<script type="application/ld+json">%s</script>'%json.dumps(x) for x in (ld_faq, ld_bc, ld_item))
    return slug, f"""<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title><meta name="description" content="{html.escape(desc)}">
<link rel="canonical" href="{base}/{slug}">
<meta name="robots" content="index,follow"><meta name="theme-color" content="#2563eb">
{schemas}
<style>
*{{box-sizing:border-box}}body{{margin:0;font-family:ui-sans-serif,system-ui,'Segoe UI',Roboto,Arial,sans-serif;background:#f7f8fa;color:#0f172a;line-height:1.65}}
.wrap{{max-width:860px;margin:0 auto;padding:20px}}
h1{{font-size:1.5rem}}h2{{font-size:1.1rem;margin:1.2rem 0 .5rem}}
.answer-first{{background:#fff7ed;color:#7c2d12;border-left:4px solid #ea580c;padding:.7rem .9rem;border-radius:8px;margin:1rem 0;font-weight:500}}
.card{{background:#fff;border:1px solid #e7ebf0;border-radius:12px;padding:14px;margin:12px 0}}
details{{margin:.4rem 0}}summary{{font-weight:600;cursor:pointer}}
.nnet-grid{{display:grid;gap:.5rem;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));margin-top:.4rem}}
.nnet-grid a{{display:block;padding:.5rem .6rem;border:1px solid #e2e8f0;border-radius:10px;text-decoration:none;font-size:.86rem;color:#0f172a;background:#fff}}
.foot{{color:#5b6b80;font-size:.8rem;margin-top:20px;border-top:1px solid #e7ebf0;padding-top:12px}}
</style></head><body>
<div class="wrap">
<h1>{html.escape(label)}{(' in '+html.escape(city)) if city else ''}</h1>
<p class="answer-first"><b>Quick answer:</b> {html.escape(ans)}</p>
<div class="card"><h2>Map &amp; nearest options</h2>
<p><a href="https://www.google.com/maps/search/{html.escape(query.replace(' ','+'))}" target="_blank" rel="noopener">📍 Open {html.escape(label.lower())} near me in Google Maps</a></p></div>
<div class="card"><h2>What to look for</h2><ul>{ltail}</ul></div>
<div class="card"><h2>Frequently asked questions</h2>{faq_html}</div>
<div class="card"><h2>More near-me finders</h2><div class="nnet-grid">{cards}</div></div>
<p class="foot">Auto-generated page · {base} · Data © OpenStreetMap contributors.</p>
</div></body></html>
"""

def main():
    src = json.load(open(sys.argv[1])) if len(sys.argv)>1 else []
    manifest=[]
    for site in src:
        made=0
        for row in site.get("queries",[]):
            if made>=MAX_PER_RUN: break
            if row.get("impressions",0) < THRESHOLD: continue
            if row.get("existing"): continue
            slug, htm = build_page(site["name"], site["base"], site["label"], row["query"], row.get("city",""), site.get("niche",site["label"]))
            d=os.path.join(OUT, site["name"]); os.makedirs(d, exist_ok=True)
            p=os.path.join(d, slug+".html")
            if os.path.exists(p): continue
            open(p,"w",encoding="utf-8").write(htm)
            manifest.append({"site":site["name"],"repo":site.get("repo"),"path":f"{slug}.html","slug":slug,"query":row["query"],"impressions":row["impressions"]})
            made+=1
        print(f"{site['name']}: generated {made} pages (cap {MAX_PER_RUN})", file=sys.stderr)
    print(json.dumps(manifest))

if __name__=="__main__":
    main()
