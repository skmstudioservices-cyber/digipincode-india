const SunCalc = require('suncalc');
const fs = require('fs');
const path = require('path');

const SITE = 'https://karvachauth.pages.dev';
const DATE_STR = 'Thursday, 29 October 2026';
const DATE_ISO = '2026-10-29';

// Ads: set AD_CLIENT to your AdSense publisher ID (e.g. 'ca-pub-XXXXXXXXXXXXXXXX')
// to enable ad slots. While empty, NO ad containers are rendered at all.
const AD_CLIENT = '';

const adSlot = () => AD_CLIENT ? `<div class="ad-slot"></div>` : '';

const cities = [
  ['New Delhi','new-delhi',28.6139,77.2090,'Delhi'],
  ['Mumbai','mumbai',19.0760,72.8777,'Maharashtra'],
  ['Kolkata','kolkata',22.5726,88.3639,'West Bengal'],
  ['Chennai','chennai',13.0827,80.2707,'Tamil Nadu'],
  ['Bengaluru','bengaluru',12.9716,77.5946,'Karnataka'],
  ['Hyderabad','hyderabad',17.3850,78.4867,'Telangana'],
  ['Pune','pune',18.5204,73.8567,'Maharashtra'],
  ['Ahmedabad','ahmedabad',23.0225,72.5714,'Gujarat'],
  ['Jaipur','jaipur',26.9124,75.7873,'Rajasthan'],
  ['Lucknow','lucknow',26.8467,80.9462,'Uttar Pradesh'],
  ['Chandigarh','chandigarh',30.7333,76.7794,'Chandigarh'],
  ['Patna','patna',25.5941,85.1376,'Bihar'],
  ['Bhopal','bhopal',23.2599,77.4126,'Madhya Pradesh'],
  ['Indore','indore',22.7196,75.8577,'Madhya Pradesh'],
  ['Kanpur','kanpur',26.4499,80.3319,'Uttar Pradesh'],
  ['Amritsar','amritsar',31.6340,74.8723,'Punjab'],
  ['Ludhiana','ludhiana',30.9010,75.8573,'Punjab'],
  ['Surat','surat',21.1702,72.8311,'Gujarat'],
  ['Varanasi','varanasi',25.3176,82.9739,'Uttar Pradesh'],
  ['Guwahati','guwahati',26.1445,91.7362,'Assam'],
  ['Nagpur','nagpur',21.1458,79.0882,'Maharashtra'],
  ['Raipur','raipur',21.2514,81.6296,'Chhattisgarh'],
  ['Dehradun','dehradun',30.3165,78.0322,'Uttarakhand'],
  ['Jammu','jammu',32.7266,74.8570,'Jammu & Kashmir'],
  ['Shimla','shimla',31.1048,77.1734,'Himachal Pradesh'],
  ['Jodhpur','jodhpur',26.2389,73.0243,'Rajasthan'],
  ['Udaipur','udaipur',24.5854,73.7125,'Rajasthan'],
  ['Agra','agra',27.1767,78.0081,'Uttar Pradesh'],
  ['Noida','noida',28.5355,77.3910,'Uttar Pradesh'],
  ['Gurugram','gurugram',28.4595,77.0266,'Haryana'],
  ['Faridabad','faridabad',28.4089,77.3178,'Haryana'],
  ['Ghaziabad','ghaziabad',28.6692,77.4538,'Uttar Pradesh'],
  ['Nashik','nashik',19.9975,73.7898,'Maharashtra'],
  ['Vadodara','vadodara',22.3072,73.1812,'Gujarat'],
  ['Rajkot','rajkot',22.3039,70.8022,'Gujarat'],
  ['Kochi','kochi',9.9312,76.2673,'Kerala'],
  ['Thiruvananthapuram','thiruvananthapuram',8.5241,76.9366,'Kerala'],
  ['Coimbatore','coimbatore',11.0168,76.9558,'Tamil Nadu'],
  ['Madurai','madurai',9.9252,78.1198,'Tamil Nadu'],
  ['Visakhapatnam','visakhapatnam',17.6868,83.2185,'Andhra Pradesh'],
  ['Vijayawada','vijayawada',16.5062,80.6480,'Andhra Pradesh'],
  ['Mysuru','mysuru',12.2958,76.6394,'Karnataka'],
  ['Bhubaneswar','bhubaneswar',20.2961,85.8245,'Odisha'],
  ['Ranchi','ranchi',23.3441,85.3096,'Jharkhand'],
  ['Jamshedpur','jamshedpur',22.8046,86.2029,'Jharkhand'],
  ['Prayagraj','prayagraj',25.4358,81.8463,'Uttar Pradesh'],
  ['Gorakhpur','gorakhpur',26.7606,83.3732,'Uttar Pradesh'],
  ['Jabalpur','jabalpur',23.1815,79.9864,'Madhya Pradesh'],
  ['Gwalior','gwalior',26.2183,78.1828,'Madhya Pradesh'],
  ['Aurangabad','aurangabad',19.8762,75.3433,'Maharashtra'],
  ['Srinagar','srinagar',34.0837,74.7973,'Jammu & Kashmir'],
];

const fmt = (d) => d.toLocaleTimeString('en-IN', {hour:'numeric', minute:'2-digit', hour12:true, timeZone:'Asia/Kolkata'});
const minusMin = (d, mins) => new Date(d.getTime() - mins*60000);
const plusMin = (d, mins) => new Date(d.getTime() + mins*60000);

const data = cities.map(([name, slug, lat, lon, state]) => {
  const day = new Date(`${DATE_ISO}T12:00:00+05:30`);
  const sun = SunCalc.getTimes(day, lat, lon);
  const moon = SunCalc.getMoonTimes(day, lat, lon);
  const sunrise = sun.sunrise, sunset = sun.sunset, moonrise = moon.rise;
  const fastMs = moonrise - sunrise;
  const h = Math.floor(fastMs/3600000), m = Math.round((fastMs%3600000)/60000);
  return { name, slug, lat, lon, state, sunrise, sunset, moonrise,
    sunriseStr: fmt(sunrise), sunsetStr: fmt(sunset), moonriseStr: fmt(moonrise),
    muhurat: `${fmt(minusMin(sunset,10))} – ${fmt(plusMin(sunset,55))} (approx)`,
    fastLen: `${h}h ${m}m` };
});

function nearest(slug, n=6) {
  const a = data.find(c=>c.slug===slug);
  return data.filter(c=>c.slug!==slug)
    .map(c => ({c, d: Math.hypot(c.lat-a.lat, (c.lon-a.lon)*Math.cos(a.lat*Math.PI/180))}))
    .sort((x,y)=>x.d-y.d).slice(0,n).map(x=>x.c);
}

const esc = s => s.replace(/&/g,'&');

function head(title, desc, extra='', canon) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="google-site-verification" content="Y_eKs_NNxezM-xRutg7oqy5Ga7qwl1W_ZbIPLGmn3pI">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canon || SITE + '/'}">
<style>body{font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;margin:0;background:#fdf8f2;color:#2b1a12;line-height:1.6}
header{background:#7a1f2b;color:#fff;padding:1rem;text-align:center}
header a{color:#f5d68a;text-decoration:none;font-weight:600}
nav.menu{background:#5e1721;display:flex;flex-wrap:wrap;justify-content:center;gap:.15rem;padding:.4rem .5rem;position:sticky;top:0;z-index:5}
nav.menu a{color:#f5d68a;text-decoration:none;font-size:clamp(.82rem,2.5vw,.95rem);padding:.35rem .7rem;border-radius:6px;white-space:nowrap}
nav.menu a:hover{background:#7a1f2b}
main{max-width:860px;margin:0 auto;padding:1rem}
h1{color:#7a1f2b;font-size:clamp(1.4rem,4vw,2rem);line-height:1.25}
h2{color:#a34a2e;font-size:clamp(1.15rem,3vw,1.5rem);margin-top:1.8rem}
.moon{font-size:clamp(2rem,7vw,3.2rem)}
.timebox{background:#fff;border:2px solid #e8c07a;border-radius:12px;padding:1rem 1.25rem;margin:1rem 0;display:flex;flex-wrap:wrap;gap:1rem;justify-content:space-between}
.timebox div{text-align:center;flex:1;min-width:130px}
.timebox .lbl{font-size:.78rem;text-transform:uppercase;letter-spacing:.05em;color:#8a6d3b}
.timebox .val{font-size:clamp(1.3rem,4.5vw,1.9rem);font-weight:700;color:#7a1f2b}
nav.crumbs{font-size:.85rem;color:#8a6d3b;margin:.25rem 0 1rem}
nav.crumbs a{color:#a34a2e}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.6rem}
.card{background:#fff;border:1px solid #f0dcc0;border-radius:10px;padding:.8rem .9rem}
.card a{color:#7a1f2b;font-weight:600;text-decoration:none}
.card .t{font-size:1.25rem;font-weight:700;color:#7a1f2b}
table{width:100%;border-collapse:collapse;background:#fff;font-size:.95rem}
th,td{padding:.5rem .6rem;border:1px solid #eedfc8;text-align:left}
th{background:#f7ead5;color:#7a1f2b}
footer{background:#7a1f2b;color:#f5d68a;padding:1.25rem;text-align:center;font-size:.85rem;margin-top:2rem}
footer a{color:#fff}
.ad-slot{margin:1.25rem 0;text-align:center;min-height:90px}
.note{background:#fff7e6;border-left:4px solid #e8c07a;padding:.7rem .9rem;font-size:.88rem;border-radius:0 8px 8px 0}
a.btn{display:inline-block;background:#7a1f2b;color:#fff;padding:.55rem 1.1rem;border-radius:8px;text-decoration:none;font-weight:600}
input[type=search]{width:100%;max-width:420px;padding:.6rem .8rem;border:2px solid #e8c07a;border-radius:10px;font-size:1rem;margin:.5rem 0 1rem}
ul.links{columns:2;gap:1.5rem;padding-left:1.2rem}
ul.links li{margin:.3rem 0}
@media(max-width:520px){ul.links{columns:1}}</style>
${extra}
</head>
<body>
<header><a href="/">🌕 Karva Chauth 2026</a><br><small>${DATE_STR} · City-wise moonrise times</small></header>
<nav class="menu" aria-label="Main menu">
<a href="/">Home</a>
<a href="/katha.html">Vrat Katha</a>
<a href="/sargi.html">Sargi</a>
<a href="/vidhi.html">Puja Vidhi</a>
<a href="/mehendi.html">Mehendi</a>
<a href="/songs.html">Songs</a>
<a href="/about.html">About</a>
</nav>
<main>`;
}

function foot() {
  return `</main>
<footer>
<p><a href="/">Home</a> · <a href="/katha.html">Vrat Katha</a> · <a href="/sargi.html">Sargi</a> · <a href="/vidhi.html">Puja Vidhi</a> · <a href="/mehendi.html">Mehendi</a> · <a href="/songs.html">Songs</a> · <a href="/about.html">About</a></p>
<p>Moonrise times are computed for each city centre and can vary by a few minutes with location and horizon. Always confirm with your local panchang.</p>
<p>&copy; 2026 karvachauth · <a href="/privacy.html">Privacy</a></p>
</footer>
</body>
</html>`;
}

const outDir = path.join(__dirname, 'dist');
fs.rmSync(outDir, {recursive:true, force:true});
fs.mkdirSync(path.join(outDir,'cities'), {recursive:true});

// ---------- CITY PAGES ----------
for (const c of data) {
  const near = nearest(c.slug);
  const title = `Karva Chauth 2026 Moonrise Time in ${c.name} — ${c.moonriseStr} IST`;
  const desc = `Karva Chauth 2026 moonrise time in ${c.name}: ${c.moonriseStr} IST on ${DATE_STR}. Fast opening & ending times, sargi time, puja muhurat and vrat guide for ${c.name}.`;
  const faq = [
    [`What is the moonrise time on Karva Chauth 2026 in ${c.name}?`, `In ${c.name}, the moon rises at approximately ${c.moonriseStr} IST on Karva Chauth, ${DATE_STR}. The fast is broken after sighting the moon.`],
    [`What time does the Karva Chauth fast start and end in ${c.name}?`, `In ${c.name} the nirjala fast begins with sargi before sunrise (${c.sunriseStr} IST) and ends at moonrise (${c.moonriseStr} IST) — about ${c.fastLen} without food or water.`],
    [`When is the Karva Chauth puja muhurat in ${c.name}?`, `The evening puja muhurat in ${c.name} is approximately ${c.muhurat.split(' (')[0]} IST, roughly the window after sunset and before moonrise. Confirm with your local panchang.`]
  ];
  const faqLd = JSON.stringify({'@context':'https://schema.org','@type':'FAQPage','mainEntity':faq.map(([q,a])=>({'@type':'Question','name':q,'acceptedAnswer':{'@type':'Answer','text':a}}))}, null, 0);
  const bcLd = JSON.stringify({'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[
    {'@type':'ListItem','position':1,'name':'Home','item':SITE+'/'},
    {'@type':'ListItem','position':2,'name':c.name,'item':`${SITE}/cities/${c.slug}.html`}]});
  const html = head(title, desc, `<script type="application/ld+json">${faqLd}</script>\n<script type="application/ld+json">${bcLd}</script>`, `${SITE}/cities/${c.slug}.html`)
  + `<nav class="crumbs"><a href="/">Home</a> › ${c.name}</nav>
<h1>🌙 Karva Chauth 2026 Moonrise Time — ${c.name}</h1>
<p><strong>${DATE_STR}</strong> · ${c.state} · Fast ends at moonrise below.</p>
<div class="timebox">
  <div><div class="lbl">Sunrise (sargi ends)</div><div class="val">${c.sunriseStr}</div></div>
  <div><div class="lbl">Puja muhurat (approx)</div><div class="val">${c.muhurat}</div></div>
  <div><div class="lbl">Moonrise — fast ends</div><div class="val">${c.moonriseStr}</div></div>
</div>
<p class="moon">🌕</p>
<p>The Karva Chauth nirjala fast in <strong>${c.name}</strong> runs from sunrise (<strong>${c.sunriseStr} IST</strong>) until moonrise (<strong>${c.moonriseStr} IST</strong>) — about <strong>${c.fastLen}</strong> without food or water. Women break the fast after sighting the moon through a sieve and offering arghya.</p>
${adSlot()}
<h2>Plan for the day in ${c.name}</h2>
<table>
<tr><th>Time (IST)</th><th>What happens</th></tr>
<tr><td>Before ${c.sunriseStr}</td><td>Eat <a href="/sargi.html">sargi</a>; fast begins</td></tr>
<tr><td>Daytime</td><td>Nirjala fast — no food or water</td></tr>
<tr><td>${c.muhurat}</td><td>Evening <a href="/vidhi.html">puja</a> — Karva Mata, Gauri, Ganesh ji</td></tr>
<tr><td>${c.moonriseStr}</td><td>Moon sighted — arghya, then break fast</td></tr>
</table>
<h2>Moonrise in cities near ${c.name}</h2>
<div class="grid">${near.map(n=>`<div class="card"><a href="/cities/${n.slug}.html">${n.name}</a><div class="t">${n.moonriseStr}</div><small>IST</small></div>`).join('\n')}</div>
<h2>Frequently asked questions — ${c.name}</h2>
${faq.map(([q,a])=>`<h3>${q}</h3><p>${a}</p>`).join('\n')}
<div class="note">Times are computed for the centre of ${c.name}. Your exact location, buildings and the horizon can shift the moment you actually see the moon by a few minutes. Step out early and confirm with your family panchang.</div>
<p><a class="btn" href="/">All cities →</a></p>`
  + foot();
  fs.writeFileSync(path.join(outDir,'cities',c.slug+'.html'), html);
}

// ---------- HOME ----------
const rows = data.map(c=>`<tr><td><a href="/cities/${c.slug}.html">${c.name}</a></td><td>${c.state}</td><td>${c.sunriseStr}</td><td><strong>${c.moonriseStr}</strong></td><td>${c.fastLen}</td></tr>`).join('\n');
const home = head('Karva Chauth 2026 — Moonrise Time by City (29 October)', 'Karva Chauth 2026 date: Thursday 29 October. City-wise moonrise times, fast opening and ending timings, sargi, puja muhurat, vrat katha and guide.')
+ `<h1>🌕 Karva Chauth 2026 — City-wise Moonrise Times</h1>
<p><strong>${DATE_STR}</strong> (India). The nirjala fast begins before sunrise with sargi and is broken only after sighting the moon. The moon rises up to 98 minutes apart across India — check <em>your</em> city, not a forwarded time.</p>
<p>Fast in North America is observed on <strong>28 October 2026</strong> (the tithi falls a day earlier there).</p>
<input type="search" id="q" placeholder="Search your city… e.g. Delhi, Jaipur, Indore" oninput="filter(this.value)">
${adSlot()}
<div class="grid" id="cards">${data.map(c=>`<div class="card" data-s="${(c.name+' '+c.state).toLowerCase()}"><a href="/cities/${c.slug}.html">${c.name}</a><div class="t">${c.moonriseStr}</div><small>moonrise IST</small></div>`).join('\n')}</div>
<h2>All cities — full table</h2>
<table id="tbl"><tr><th>City</th><th>State</th><th>Sunrise</th><th>Moonrise</th><th>Fast length</th></tr>${rows}</table>
<h2>Karva Chauth guide</h2>
<ul class="links">
<li><a href="/katha.html">Vrat Katha — story of Veeravati</a></li>
<li><a href="/sargi.html">Sargi — what to eat before sunrise</a></li>
<li><a href="/vidhi.html">Puja Vidhi — step by step</a></li>
<li><a href="/mehendi.html">Mehendi designs guide</a></li>
<li><a href="/songs.html">Karva Chauth songs list</a></li>
</ul>
<div class="note">All times computed for city centres (IST). Verify with your local panchang on the day.</div>
<script>function filter(v){v=v.toLowerCase();document.querySelectorAll('#cards .card').forEach(c=>{c.style.display=c.dataset.s.includes(v)?'':'none'})}</script>`
+ foot();
fs.writeFileSync(path.join(outDir,'index.html'), home);

// ---------- STATIC CONTENT PAGES ----------
function page(file, title, desc, body) {
  fs.writeFileSync(path.join(outDir,file), head(title, desc, '', `${SITE}/${file}`) + body + foot());
}

page('katha.html','Karva Chauth Vrat Katha 2026 — Story of Veeravati','Karva Chauth vrat katha: the story of Veeravati, why the katha is read during the evening puja, and its meaning.',
`<h1>Karva Chauth Vrat Katha</h1>
<p>Every Karva Chauth evening, women gather after the puja and listen to the katha before the moon rises. The most told story is that of <strong>Veeravati</strong>.</p>
<h2>The story of Veeravati</h2>
<p>Veeravati was the only sister of seven devoted brothers. On her first Karva Chauth after marriage she visited her parents' home and kept the strict nirjala fast. By evening her hunger and thirst troubled the brothers, who could not bear to see her suffer.</p>
<p>Unable to convince her to eat, the brothers placed a mirror in a peepal tree so it glinted like the moon. Veeravati, believing the moon had risen, broke her fast. The moment she did, word arrived that her husband had fallen gravely ill.</p>
<p>Heartbroken, she rushed to her husband's kingdom and found him dying. She prayed, observed the fast again with complete devotion, and kept vigil. Pleased by her penance — and by the power of her faith — the gods restored her husband to health.</p>
<h2>Why the katha is read</h2>
<p>The katha reminds everyone keeping the fast what the day is about: patience, love and care for each other, not just ritual. Listening to it together is also how the community of fasting women has always passed the long hours until moonrise.</p>
<h2>How it is told today</h2>
<p>An elder woman of the family usually reads the katha while the others sit around the thali, holding karvas filled with water. Small local variations exist — but the story of the devoted wife and the mistaken moon remains the same everywhere.</p>
${adSlot()}
<p><a class="btn" href="/vidhi.html">See the full puja vidhi →</a></p>`);

page('sargi.html','Karva Chauth Sargi 2026 — Timing, Items & Meaning','Sargi 2026: what to eat before sunrise on Karva Chauth, traditional sargi items from the mother-in-law, and light modern ideas.',
`<h1>Sargi — the pre-dawn meal</h1>
<p><strong>Sargi</strong> is the meal eaten before sunrise on Karva Chauth. Traditionally sent by the mother-in-law, it gives the fasting woman strength for the long day ahead. It must be finished before sunrise — see your city's sunrise time on the <a href="/">home page</a>.</p>
<h2>Traditional sargi items</h2>
<table>
<tr><th>Type</th><th>Typical items</th></tr>
<tr><td>Fresh</td><td>Feni, coconut water, fruits, curd</td></tr>
<tr><td>Savoury</td><td>Mathri, paratha, dry sabzi, namkeen</td></tr>
<tr><td>Sweet</td><td>Phirni, meethi mathri, dry fruits, mithai</td></tr>
<tr><td>For the day</td><td>Plenty of water, milk or juice with the meal</td></tr>
</table>
<h2>Simple modern ideas</h2>
<p>Whole-wheat paratha with paneer, a bowl of curd, a banana, a handful of soaked almonds and 2–3 glasses of water covers most of what you need. Eat slowly, keep it light, and avoid very salty items — they increase thirst through the day.</p>
${adSlot()}
<p><a class="btn" href="/cities/new-delhi.html">Check sunrise time in your city →</a></p>`);

page('vidhi.html','Karva Chauth Puja Vidhi 2026 — Step by Step','Karva Chauth 2026 puja vidhi: step-by-step method from sargi to moonrise, puja samagri list, and how to break the fast.',
`<h1>Karva Chauth Puja Vidhi — step by step</h1>
<h2>Through the day</h2>
<p><strong>1.</strong> Finish sargi before sunrise. <strong>2.</strong> Begin the nirjala fast — no food or water. <strong>3.</strong> Spend the day resting; heavy work and sun exposure make the fast harder.</p>
<h2>Evening puja (in the muhurat window)</h2>
<p><strong>4.</strong> Dress in festive clothes (solah shringar if you observe it). <strong>5.</strong> Prepare the thali with karva, water, diya, roli, rice, mehendi, sugar and fruits. <strong>6.</strong> Sit with other women (or your family) and listen to the <a href="/katha.html">vrat katha</a>. <strong>7.</strong> Offer prayers to Karva Mata, Goddess Gauri and Lord Ganesh.</p>
<h2>Puja samagri list</h2>
<table><tr><th>Item</th><th>Use</th></tr>
<tr><td>Karva (earthen pot)</td><td>Filled with water for arghya</td></tr>
<tr><td>Diya, matchbox, ghee</td><td>Light during puja</td></tr>
<tr><td>Roli, rice, sandalwood</td><td>Tilak and offerings</td></tr>
<tr><td>Sieve (chalni)</td><td>Viewing the moon and husband</td></tr>
<tr><td>Fruits, mithai</td><td>Bhog after moonrise</td></tr>
<tr><td>Mehendi, bangles</td><td>Shringar</td></tr>
</table>
<h2>At moonrise</h2>
<p><strong>8.</strong> Once the moon is sighted (check your <a href="/">city moonrise time</a>), offer arghya to the moon through the sieve. <strong>9.</strong> Then look at your husband through the same sieve. <strong>10.</strong> Break the fast with water and sweets — eat gently after the long day.</p>
${adSlot()}
<div class="note">Family traditions vary. Follow the customs of your household and elders.</div>`);

page('mehendi.html','Karva Chauth Mehendi 2026 — Design Guide','Karva Chauth mehendi guide: traditional, minimal and Arabic design ideas, application timing, and aftercare for dark colour.',
`<h1>Karva Chauth Mehendi Guide</h1>
<p>Mehendi is part of the shringar of Karva Chauth — applied a day or two before so the colour deepens by the festival.</p>
<h2>Design ideas</h2>
<table><tr><th>Style</th><th>Best for</th><th>Typical motifs</th></tr>
<tr><td>Traditional full-hand</td><td>Festive look</td><td>Peacocks, doli, bride-groom, lotus</td></tr>
<tr><td>Minimal</td><td>Office-goers</td><td>Finger cuffs, moon and stars, single mandala</td></tr>
<tr><td>Arabic</td><td>Bold, quick</td><td>Diagonal floral trails, shaded leaves</td></tr>
<tr><td>Back-hand focus</td><td>Modern</td><td>Half mandala, chand motif</td></tr>
</table>
<h2>Timing</h2>
<p>Apply mehendi 1–2 days before ${DATE_STR} so it darkens fully for the puja.</p>
<h2>Aftercare for dark colour</h2>
<p>Let the paste dry and fall off on its own — do not wash it off. Avoid soap for a few hours after, seal with a lemon-sugar dab while it dries, and keep hands warm. Colour deepens over 24–48 hours.</p>
${adSlot()}`);

page('songs.html','Karva Chauth Songs — Popular Bollywood Playlist','Popular Karva Chauth songs from Bollywood films for the evening puja and moonrise.',
`<h1>Karva Chauth Songs</h1>
<p>Music sets the mood for the evening. These Bollywood songs are played most during Karva Chauth pujas and while waiting for the moon:</p>
<table><tr><th>Song</th><th>Film</th></tr>
<tr><td>Bole Chudiyan</td><td>Kabhi Khushi Kabhie Gham</td></tr>
<tr><td>Chand Chhupa Badal Mein</td><td>Hum Dil De Chuke Sanam</td></tr>
<tr><td>Ghar More Pardesiya</td><td>Kalank</td></tr>
<tr><td>Babul Ki Duayein Leti Ja</td><td>Ek Rishtaa</td></tr>
<tr><td>Mera Chand Mujhe Aaya Hai Nazar</td><td>Chaudhvin Ka Chand</td></tr>
<tr><td>Chanda Re Chanda Re</td><td>Sapne Saajan Ke</td></tr>
<tr><td>Yeh Chand Sa Roshan Chehra</td><td>Kashmir Ki Kali</td></tr>
<tr><td>Aaj Se Pehle Aaj Se Zyada</td><td>Chitchor</td></tr>
</table>
<h2>Traditional</h2>
<p>Local Karva Chauth geet — sung by women while rotating the thali around the katha — vary by region. Ask an elder in the family; that is also the sweetest part of the evening.</p>
${adSlot()}`);

page('about.html','About karvachauth','About this Karva Chauth 2026 moonrise time guide.',
`<h1>About</h1>
<p>This guide gives city-wise moonrise, sunrise and fasting times for Karva Chauth ${DATE_STR}, along with the vrat katha, sargi, vidhi and mehendi guides — everything a fasting household needs on one simple site.</p>
<p class="note">We are an independent information site, not affiliated with any religious body. Times are astronomically computed for each city centre and should be confirmed with your local panchang.</p>`);

page('privacy.html','Privacy Policy — karvachauth','Privacy policy for the karvachauth pages.dev site.',
`<h1>Privacy Policy</h1>
<p>This site does not require accounts and does not ask for personal information. It may use privacy-friendly, aggregate analytics and advertising partners that may set their own cookies; you can control cookies in your browser settings.</p>
<p>For any questions, use the contact given on the About page.</p>`);

fs.writeFileSync(path.join(outDir,'404.html'), head('Page not found','Page not found') + `<h1>404</h1><p>The page you were looking for is not here. <a href="/">Go to the home page</a> for city-wise moonrise times.</p>` + foot());

fs.writeFileSync(path.join(outDir,'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
fs.writeFileSync(path.join(outDir,'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
<url><loc>${SITE}/</loc><lastmod>2026-09-21</lastmod><priority>1.0</priority></url>
${['katha','sargi','vidhi','mehendi','songs','about'].map(p=>`<url><loc>${SITE}/${p}.html</loc><lastmod>2026-09-21</lastmod><priority>0.8</priority></url>`).join('\n')}
${data.map(c=>`<url><loc>${SITE}/cities/${c.slug}.html</loc><lastmod>2026-09-21</lastmod><priority>0.9</priority></url>`).join('\n')}
</urlset>`);

console.log('DONE.');
console.log('cities:', fs.readdirSync(path.join(outDir,'cities')).length);
console.log('Delhi:', data.find(c=>c.slug==='new-delhi').moonriseStr, '| ad slots rendered:', AD_CLIENT ? 'YES' : 'NO (hidden until ads connected)');
