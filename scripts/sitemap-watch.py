import json, re, urllib.request, urllib.error, concurrent.futures

SITES = [
"https://aadhaar-seva-kendra-near-me.pages.dev/",
"https://aadhaarcenternearme.pages.dev/",
"https://airqualitynearme.pages.dev/",
"https://asiangamesmedaltally2026.pages.dev/",
"https://atmsnearme.pages.dev/",
"https://autostandnearme.pages.dev/",
"https://bakerynearme.pages.dev/",
"https://banksnearme.pages.dev/",
"https://bharatlive.pages.dev/",
"https://bicyclestandnearme.pages.dev/",
"https://bikerepairsnearme.pages.dev/",
"https://bikestandnearme.pages.dev/",
"https://bloodbanksnearme.pages.dev/",
"https://busstationnearme.pages.dev/",
"https://busstopnearme.pages.dev/",
"https://cafenearme.pages.dev/",
"https://carparkingnearme.pages.dev/",
"https://carrepairsnearme.pages.dev/",
"https://churchesnearme.pages.dev/",
"https://cngpumpsnearme.pages.dev/",
"https://courtnearme.pages.dev/",
"https://demo-vmv.pages.dev/",
"https://dentistsnearme.pages.dev/",
"https://dhabanearme.pages.dev/",
"https://digipincode.india-in.workers.dev/",
"https://digipincode.pages.dev/",
"https://earthquakenearme.pages.dev/",
"https://electricityofficenearme.pages.dev/",
"https://erickshawstandnearme.pages.dev/",
"https://evchargersnearme.pages.dev/",
"https://examstatus.india-in.workers.dev/",
"https://floodsnearme.pages.dev/",
"https://gymnearme.pages.dev/",
"https://hardwareshopnearme.pages.dev/",
"https://hospitalsnearme-9cp.pages.dev/",
"https://hotelnearme.pages.dev/",
"https://isrotracker.pages.dev/",
"https://issspotter.pages.dev/",
"https://karvachauth.india-in.workers.dev/",
"https://karvachauth.pages.dev/",
"https://laundrynearme.pages.dev/",
"https://lodgenearme.pages.dev/",
"https://mapsnearme.pages.dev/",
"https://mechanicnearme.pages.dev/",
"https://medicalshopnearme.pages.dev/",
"https://mobilerepairnearme.pages.dev/",
"https://mosquesnearme.pages.dev/",
"https://paintshopnearme.pages.dev/",
"https://parksnearme.pages.dev/",
"https://petrolpumpsnearme.pages.dev/",
"https://policestationsnearme.pages.dev/",
"https://postofficenearme.pages.dev/",
"https://protestsnearme.pages.dev/",
"https://railwaystationnearme.pages.dev/",
"https://rationcardofficernearme.pages.dev/",
"https://restareanearme.pages.dev/",
"https://restaurantsnearme.pages.dev/",
"https://rtoofficenearme.pages.dev/",
"https://safealleys.pages.dev/",
"https://salonnearme.pages.dev/",
"https://skmtools.pages.dev/",
"https://sweetsshopnearme.pages.dev/",
"https://tailorshopnearme.pages.dev/",
"https://templesnearme.pages.dev/",
"https://thananearme.pages.dev/",
"https://tirenearme.pages.dev/",
"https://toiletsnearme.pages.dev/",
"https://tollplazanearme.pages.dev/",
"https://washroomsnearme.pages.dev/"
]

def fetch(u):
    try:
        req = urllib.request.Request(u, headers={"User-Agent": "Mozilla/5.0 (compatible; SKM-SitemapWatch/1.0)"})
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception:
        return 0, ""

def audit(u):
    code, body = fetch(u)
    locs = re.findall(r"<loc>\s*([^<]+?)\s*</loc>", body)
    root = "sitemapindex" if "<sitemapindex" in body else ("urlset" if "<urlset" in body else "none")
    return u, code, root, len(locs)

hub = "https://sitemaps.india-in.workers.dev/sitemap-index.xml"
c, b = fetch(hub)
hublocs = re.findall(r"<loc>\s*([^<]+?)\s*</loc>", b)
print("HUB\t%s\t%s\t%d" % (c, "sitemapindex" if "<sitemapindex" in b else "urlset", len(hublocs)))

targets = sorted(set(list(hublocs) + [s + "sitemap.xml" for s in SITES]))
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
    for u, code, root, n in ex.map(audit, targets):
        print("ROW\t%s\t%s\t%s\t%d" % (u, code, root, n))
