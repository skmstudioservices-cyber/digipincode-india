// Diwali 2026 — verified facts (researched 20 Sep 2026; sources: Drik Panchang, AstroSage,
// Prokerala, DekhoPanchang, Vidhata et al — see Live Links research entry).
export const diwaliDays2026 = [
  { day: 'Govatsa Dwadashi / Vasu Baras', date: 'Thursday, 5 November 2026', note: 'Festivities begin; Maharashtra starts here.' },
  { day: 'Dhanteras (Trayodashi)', date: 'Friday, 6 November 2026', note: 'Puja muhurat 6:03 PM – 7:59 PM (AstroSage, New Delhi). Trayodashi 10:31 AM (6 Nov) → 10:48 AM (7 Nov).' },
  { day: 'Choti Diwali / Narak Chaturdashi', date: 'Sunday, 8 November 2026', note: '2026 oddity: the Chaturdashi tithi collapses into 8 Nov — Choti Diwali falls on the same day as Diwali at most places.' },
  { day: 'Diwali — Lakshmi Puja (Amavasya)', date: 'Sunday, 8 November 2026', note: 'Amavasya 11:27 AM (8 Nov) → 12:31 PM (9 Nov). Delhi muhurat 5:54 PM – 7:50 PM (Drik Panchang). Yama Deepam evening of 7 Nov.' },
  { day: 'Govardhan Puja', date: 'Tuesday, 10 November 2026', note: '2026 oddity: Pratipada is not available at sunrise on 9 Nov, so Govardhan Puja is pushed to 10 Nov (one-day gap).' },
  { day: 'Bhai Dooj', date: 'Wednesday, 11 November 2026', note: 'Dwitiya 2:00 PM (10 Nov) → 3:53 PM (11 Nov); tika in the Aparahna window.' },
];

export const diwaliFacts2026 = {
  lakshmiMuhuratDelhi: '5:54 PM – 7:50 PM IST (Drik Panchang, New Delhi; Pradosh Kaal 5:31 PM – 8:09 PM)',
  dhanterasMuhuratDelhi: '6:03 PM – 7:59 PM IST (AstroSage, New Delhi)',
  adhikMaasNote: '2026 carries an extra lunar month (Adhik Jyeshtha, 17 May – 15 June), making it a 13-month Hindu year — which is why Diwali 2026 (8 November) lands 19 days later on the Gregorian calendar than Diwali 2025 (20 October).',
  samagri: ['Lakshmi-Ganesh idols or photos', 'Clay diyas & ghee/wicks', 'Kumkum, haldi, rice, flowers', 'Sweets & prasad', 'Kalash & coconut', 'Panchamrit (milk, curd, ghee, honey, sugar)', 'Camphor & incense', 'Lotus (Lakshmi\'s flower) & garlands', 'New account books (if doing Chopda Pujan)', 'Silver coin (traditional Dhanteras buy)'],
  vidhi: [
    'Sweep and light up the house; draw a rangoli (lotus and footprint motifs welcome Lakshmi in).',
    'Do Ganesh puja first, then invoke Lakshmi in the Pradosh Kaal / Vrishabha Lagna muhurat window.',
    'Offer shodashopachara puja — 16 traditional offerings including flowers, incense, lamp and naivedya.',
    'Place the kalash, recite Lakshmi mantras (Om Shreem Mahalakshmyai Namah) and Sri Suktam if you can.',
    'Light diyas at the main door, tulsi and every dark corner of the house.',
    'Close with the Lakshmi aarti ("Om Jai Lakshmi Mata") and distribute prasad.',
  ],
};

// City-specific celebration notes — ONLY where verified research exists (20 Sep 2026).
// Cities without a note get the computed muhurat page without an invented section.
export const diwaliCityNotes: Record<string, string> = {
  delhi: 'Diwali shopping centres on every list: Sadar Bazaar (wholesale diyas and LED lights), Chandni Chowk — Bhagirath Palace for lights and Kinari Bazaar for torans, Lajpat Nagar and Karol Bagh. Dilli Haat runs a Diwali mela; India Gate and Connaught Place put up major illuminations.',
  mumbai: 'Crawford Market and the Mohammed Ali Road lanes are the mithai-and-decoraction epicentre; the city is famous for its kandeels (paper lanterns) strung across streets.',
  jaipur: 'Johari Bazaar, Bapu Bazaar and MI Road — shopkeepers compete on light displays ("The Strip"). Watch the whole lit city from Nahargarh Fort after sunset; Amber Fort is illuminated too.',
  varanasi: 'Diyas and candles on the ghats with an elaborate Ganga Aarti on Diwali night — and Dev Deepawali on 24 November, when all 88 ghats are lit with more than a million diyas.',
  amritsar: 'The Golden Temple celebrates Bandi Chhor Divas — the sarovar is ringed with diyas and fireworks; one of India\'s most spectacular Diwali scenes.',
  ayodhya: 'Deepotsav at Ram Ki Paidi and the Saryu ghats — drone and laser shows, mass aarti and Ramleela performances around the main day.',
  kolkata: 'In Bengal, Diwali night is Kali Puja — the city fills with Kali Puja pandals alongside the diyas.',
  guwahati: 'Kali Puja with tantric rituals, most famously at the Kamakhya Temple.',
};
