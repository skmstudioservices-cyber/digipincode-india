#!/usr/bin/env python3
"""SPOC dashboard data assembler. Reads collector fragments from /tmp, writes dashboard/data.json.
Quota-safe by design: no full-table reads anywhere. D1 = catalog (table names) only.
Supabase = last-known snapshot (refreshed on request, not by cron)."""
import json, subprocess, datetime, collections

def load(p, default=None):
    try:
        with open(p) as f:
            return json.load(f)
    except Exception:
        return default

out = {"generated_at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")}

# --- Cloudflare quota (today, by script+hour) ---
quota = {"limit": 100000, "today_total": 0, "yesterday_total": 0, "hourly": [], "by_script": [], "projected_exhaust_utc": None}
by_script = collections.Counter()
by_hour = collections.Counter()
for r in (load("/tmp/cf_today.json", []) or []):
    d = r.get("dimensions", {}) or {}
    n = (r.get("sum", {}) or {}).get("requests", 0)
    quota["today_total"] += n
    by_script[d.get("scriptName", "?")] += n
    by_hour[(d.get("datetimeHour", "") or "?")[11:13]] += n
for r in (load("/tmp/cf_yesterday.json", []) or []):
    quota["yesterday_total"] += (r.get("sum", {}) or {}).get("requests", 0)
quota["hourly"] = [{"hour": h, "requests": by_hour[h]} for h in sorted(by_hour)]
mx = max(by_script.values()) if by_script else 1
quota["by_script"] = [{"script": k, "requests": v, "max": mx} for k, v in sorted(by_script.items(), key=lambda x: -x[1])]

# projection: avg of last 4 complete hours
now_h = datetime.datetime.now(datetime.timezone.utc).hour
comp = [by_hour.get(f"{h:02d}", 0) for h in range(max(0, now_h - 4), now_h)]
if comp and quota["today_total"] < quota["limit"]:
    rate = sum(comp) / len(comp)
    if rate > 200:  # only project on meaningful traffic
        hours_left = (quota["limit"] - quota["today_total"]) / rate
        eta = datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=hours_left)
        quota["projected_exhaust_utc"] = eta.strftime("%H:%M")
        quota["projected_exhaust_ist"] = eta.strftime("%H:%M")
out["quota"] = quota

# --- Sites (line format: name|url|code time_total) ---
sites = []
for line in subprocess.run(["cat", "/tmp/sites.txt"], capture_output=True, text=True).stdout.strip().splitlines():
    parts = line.split("|")
    if len(parts) >= 3:
        name, url = parts[0], parts[1]
        bits = parts[2].split()
        code = bits[0] if bits else "000"
        ms = float(bits[1]) if len(bits) > 1 else 0.0
        sites.append({"name": name, "url": url, "http": int(code) if code.isdigit() else 0, "ms": int(ms * 1000)})
out["sites"] = sites

# --- D1 catalog only (table names; no row scans) ---
d1r = load("/tmp/d1.json", {}) or {}
results = (d1r.get("result") or [{}])[0].get("results", [])
tables = [x.get("name") for x in results if isinstance(x, dict) and x.get("name")]
out["datastores"] = {
    "d1": {"db": "pincode-india-db", "tables": tables[:15],
           "note": "row counts not scanned to protect read quota"},
    "supabase_mapsnearme": {"businesses": 238, "cities": 34, "categories": 16, "markets": 63,
                            "as_of": "22 Sep 2026", "note": "refresh on request only"},
}

# --- GitHub workflow runs (digipincode repo; own-repo token) ---
wf = []
seen = set()
for r in (load("/tmp/gh_runs.json", {}) or []):
    n = r.get("name", "?")
    if n in seen or not n:
        continue
    seen.add(n)
    wf.append({"name": n, "status": r.get("status"), "conclusion": r.get("conclusion"),
               "at": r.get("created_at"), "url": r.get("html_url", "")})
    if len(wf) >= 10:
        break
out["workflows"] = wf

with open("dashboard/data.json", "w") as f:
    json.dump(out, f, indent=1)
print("data.json written:", quota["today_total"], "requests today;",
      len(sites), "sites;", len(tables), "d1 tables;", len(wf), "workflows")
