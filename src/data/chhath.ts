// Chhath Puja 2026 — ghat & site directory (20 cities)
// Researched 18 Sep 2026 from district administration advisories + news reports
// (2024-25 seasons). Municipal ghat lists change yearly — reverify before Nov 2026.

export const chhathDates2026 = [
  { day: 1, ritual: 'Nahay Khay', date: 'Friday, 13 November 2026' },
  { day: 2, ritual: 'Kharna (Lohanda)', date: 'Saturday, 14 November 2026' },
  { day: 3, ritual: 'Sandhya Arghya (main day — setting sun)', date: 'Sunday, 15 November 2026' },
  { day: 4, ritual: 'Usha Arghya / Parana (rising sun)', date: 'Monday, 16 November 2026' },
];

export interface ChhathCity {
  slug: string;
  name: string;
  state: string;
  water: string;
  ghats: string[];
  notes: string;
}

export const chhathCities: ChhathCity[] = [
  {
    slug: 'patna', name: 'Patna', state: 'Bihar', water: 'Ganga',
    ghats: ['Patliputra Ghat (Digha)', 'Collectorate Ghat', 'Gandhi Ghat', 'Didarganj Ghat', 'Nasariganj Ghat (Danapur)', 'Kangan Ghat', 'Kali Ghat', 'NIT Ghat', 'Minar Ghat', 'Shiva Ghat', 'Patipul Ghat', 'Kadam Ghat', 'Kila Ghat', 'Panchmukhi Mahavir Ghat'],
    notes: '~550 ghats district-wide (~102 on the Ganga, 45 parks, 63 ponds). Every year the administration bans arghya at dangerous ghats — check the latest district advisory. Facilities: 400+ changing rooms, 552 toilets, 171 watchtowers.',
  },
  {
    slug: 'bhagalpur', name: 'Bhagalpur', state: 'Bihar', water: 'Ganga',
    ghats: ['Budhanath (Jogsar) Ghat', 'Manik Sarkar Ghat', 'Adampur Ghat', 'Barari Pul Ghat', 'Barari Sidhi Ghat', 'Khirni Ghat', 'Musahri Ghat', 'Nilkanth Ghat', 'Maya Ghat (Mayaganj)', 'Water Works Ghat', 'Dipnagar Ghat', 'Hanuman Ghat'],
    notes: '~60 municipal ghats. 30,000+ devotees take Ganga snan at Barari Pul Ghat, drawing families from across Seemanchal. Dangerous ghats are barricaded with red cloth.',
  },
  {
    slug: 'munger', name: 'Munger', state: 'Bihar', water: 'Ganga',
    ghats: ['Kashtaharni Ghat', 'Babua Ghat', 'Jail Ghat', 'Sojhi Ghat', 'Jahaj Ghat', 'Lal Darwaja Ganganagar Ghat', 'Belan Bazar Bengali Tola Ghat', 'Kankad Ghat', 'Sati Chauda Ghat', 'Belwa Ghat', 'Herudiyara Ghat', 'Sherpur Ghat'],
    notes: '19 ghats (2025). SDRF teams, divers and watchtowers at major ghats; sandbags laid on muddy steps. Kashtaharni Ghat is the most famous.',
  },
  {
    slug: 'delhi', name: 'Delhi', state: 'Delhi', water: 'Yamuna',
    ghats: ['ITO Ghat (Hathi Ghat)', 'Vasudev Ghat (Kashmiri Gate)', 'Sonia Vihar Ghat', 'Kalindi Kunj', 'Old Railway Bridge Ghat', 'DND Flyover Ghat', 'Yamuna Bank / Chilla Gaon', 'Palla Ghat', 'Mangolpuri sites', 'Janakpuri ward ghats'],
    notes: '17 model ghats from Palla to Kalindi Kunj + 1,000-1,500 citywide sites. After NGT restrictions (2015-2024, artificial ponds only), Yamuna worship was re-allowed in 2025 — immersions barred. Check the latest DDMA advisory.',
  },
  {
    slug: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', water: 'Ganga',
    ghats: ['Assi Ghat', 'Dashashwamedh Ghat', 'Rajghat', 'Kedar Ghat', 'Harishchandra Ghat', 'Rajendra Prasad Ghat', 'Panchganga Ghat', 'Shitala Ghat', 'Adi Keshav Ghat', 'Tulsi Ghat', 'Ramnagar sandbank'],
    notes: '3 lakh+ devotees across the two arghya days. Old-city approaches (Godowlia, Lanka-Assi, Rajghat) are closed to vehicles on arghya evenings — go early.',
  },
  {
    slug: 'prayagraj', name: 'Prayagraj', state: 'Uttar Pradesh', water: 'Sangam (Ganga-Yamuna-Saraswati)',
    ghats: ['Sangam / Triveni Ghat', 'Kila Ghat', 'Ram Ghat', 'Arail Ghat', 'Dashashwamedh Ghat (Daraganj)', 'Saraswati Ghat', 'Chandrashekhar Azad (Rasulabad) Ghat', 'Balua Ghat', 'Gau Ghat', 'Shankar Ghat', 'Nagvasuki Ghat'],
    notes: 'Ghat area varies with river level — 2025 high water shrank usable ghats ~30%. Administration lays chequered plates, sandbags and barricading as needed.',
  },
  {
    slug: 'kanpur', name: 'Kanpur', state: 'Uttar Pradesh', water: 'Ganga + canal network',
    ghats: ['Sarsaiya Ghat', 'Atal Ghat', 'Gola Ghat', 'Maskar Ghat', 'Siddhnath Ghat', 'Parmat Ghat', 'Bithoor (Sanjay Dutt) Ghat', 'Panki Nahar', 'Armapur Nahar', 'Shastri Nagar (Central Park) canal ghat'],
    notes: '~7 lakh Purvanchali residents; ~30,000 puja platforms. Integrated Command Centres at major ghats since the 2022 Bithoor crowd incident; heavy police + medical deployment at Bithoor.',
  },
  {
    slug: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', water: 'Gomti',
    ghats: ['Lakshman Mela Park Ghat', 'Jhulelal Park / Vatika Ghat', 'Kudiaghat', 'Hanuman Setu', 'Khatushyam Ghat', 'Picnic Spot Ghat (Kukrail bund)', 'Saanjhia Ghat', 'Manikameshwar Aarti Ghat', 'Mehndi Ghat', 'Gauri Chhath Sthal'],
    notes: '88+ designated sites with artificial ponds; 10 lakh+ devotees expected over four days. Zero-waste ghat plan, 300+ CCTV, water police and divers.',
  },
  {
    slug: 'ranchi', name: 'Ranchi', state: 'Jharkhand', water: 'Ponds, tanks and dams',
    ghats: ['Kanke Dam', 'Dhurwa Dam', 'Bada Talab (Ranchi Lake)', 'Hatnia Talab', 'Chadri Talab', 'Jail Talab / Line Tank', 'Karamtoli Talab', 'Argora Talab', 'Jumar River ghat', 'Madhukam Talab', 'Sarovar Nagar Dam', 'Joda Talab Bariyatu'],
    notes: '74 surveyed ghats (ponds dominate). Every year some are declared high-risk after the monsoon and barricaded — RMC cleans 70+ ponds and installs lighting; NDRF at major ponds.',
  },
  {
    slug: 'bokaro', name: 'Bokaro', state: 'Jharkhand', water: 'Garga river, dams and ponds',
    ghats: ['Garga river ghats (Dam-Chira Chas stretch)', 'Garga Bridge ghat', 'Surya Sarovar', 'Surya Mandir pond (Sector 4F)', 'Jagannath Temple sarovar (Sector 4D)', 'Two Tank Chhath Ghat', 'City Park ghats', 'Tiranga Park ghat (Sector 1)', 'Rani Pokhar', 'Cooling Pond (Vaishali More)'],
    notes: '2 lakh+ Chhathvratis. Bokaro Steel Plant town administration runs cleaning, lighting and medical camps; Tiranga Park ghat is the most decorated.',
  },
  {
    slug: 'kolkata', name: 'Kolkata', state: 'West Bengal', water: 'Hooghly',
    ghats: ['Babughat (Baje Kadamtala)', 'Doighat', 'Taktaghat', 'Prinsep Ghat', 'Outram Ghat', 'Millennium Park ghat', 'Judges Ghat', 'Biswarjan Ghat (New Town)', 'Kasba / Patuli / Jodhpur Park water bodies'],
    notes: '27 Hooghly ghats open + ~140 citywide sites; Howrah has 51. Rabindra Sarobar and Subhas Sarobar are CLOSED to Chhath rituals by court order.',
  },
  {
    slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra', water: 'Arabian Sea, Powai Lake, Banganga',
    ghats: ['Juhu Beach', 'Dadar Chowpatty', 'Girgaon Chowpatty', 'Versova Beach', 'Aksa Beach', 'Gorai Beach', 'Powai Lake', 'Banganga Tank (Walkeshwar)', 'Kopri Pond'],
    notes: 'BMC arranged 67 locations in 2025 (148 artificial ponds, 403 changing rooms). Juhu is the epicentre; special trains run from Bihar/UP before the festival.',
  },
  {
    slug: 'pune', name: 'Pune', state: 'Maharashtra', water: 'Mula-Mutha rivers, canals, lakes',
    ghats: ['Sangam Ghat (Bund Garden)', 'Mula riverbank (Hinjawadi)', 'Pimpri-Chinchwad riverbank (Kalewadi Bridge)', 'Pawneshwar Ghat (Pimpri)', 'Ganesh Talav (Pradhikaran)', 'Ramhari Talav (Aundh-Baner)', 'Maling Ghat (Aundh)', 'Khadakwasla Lake', 'Jambhulwadi Lake (Katraj)', 'Ghorpadi canal ghat'],
    notes: '40+ locations across Pune-PCMC (Bihar Foundation lists). Jambhulwadi draws 10,000+; many societies build artificial ponds.',
  },
  {
    slug: 'surat', name: 'Surat', state: 'Gujarat', water: 'Tapi',
    ghats: ['Chhath ghat near Indira Bridge', 'Jahangirpura Ghat', 'Navdi Ovra Ghat', 'Kurukshetra Ghat (Ovra)', 'Causeway (Weir) ghat', 'Dindoli Lake', 'Parvat Patiya Lake', 'Mora Tekra', 'Singanpore community venues', 'Godadara community venues'],
    notes: '25 SMC locations (10 natural + 15 artificial). Jahangirpura expects 80,000+. Special trains run from Udhna to Bihar/UP.',
  },
  {
    slug: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', water: 'Sabarmati',
    ghats: ['Chhath Ghat near Indira Bridge (purpose-built, main venue)', 'Narayan (Naran) Ghat (Subhash Bridge riverfront)', 'Atal Ghat (Ellis-Nehru bridge stretch)', 'Godrej Garden City kund', 'Bapunagar community setups', 'Khodiyarnagar community setups'],
    notes: 'The 300-m purpose-built ghat near Indira Bridge (opened 2018) is the main venue with 5,000+ devotees; AMC releases Sabarmati water and sets up domes and changing rooms.',
  },
  {
    slug: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', water: 'Lakes and tanks',
    ghats: ['Ulsoor Lake', 'Hebbal Lake', 'Sankey Tank', 'Hesaraghatta Lake', 'Rayasandra Lake (Hosa Road)', 'Agara Kalyani (Hulimavu)', 'Austin Town Ground (artificial pond)', 'Narayanpura Park (ORR)', 'Art of Living center pond (Kanakapura Road)'],
    notes: '4,000+ north-Indian families participate; artificial ponds are standard where lake access is restricted. Ulsoor Lake is the most popular venue.',
  },
  {
    slug: 'hyderabad', name: 'Hyderabad', state: 'Telangana', water: 'Hussainsagar + city lakes',
    ghats: ['Bathukamma Ghat / Children\'s Park (Tank Bund)', 'Necklace Road (Jala Vihar)', 'Sunnam Cheruvu (Borabanda)', 'Fox Sagar (Jeedimetla)', 'Uppal pond', 'Kukatpally ponds', 'Miyapur temporary ghat'],
    notes: '29-50 permitted sites across the twin cities, coordinated by Jan Seva Sangh and Bihar Association; ~50,000 expected at Tank Bund alone.',
  },
  {
    slug: 'ludhiana', name: 'Ludhiana', state: 'Punjab', water: 'Sidhwan Canal, Sutlej',
    ghats: ['Sidhwan Canal ghats (Pakhowal Road bridge)', 'Sutlej river banks', 'Giaspura community ghats', 'Sherpur Chowk sites', 'Ishar Nagar', 'Dhandhari', 'Jassian', 'Lalton', 'Doraha canal banks'],
    notes: '~5 lakh participants. Celebrations depend on the irrigation department releasing canal water — sometimes delayed; makeshift ghats appear in parks.',
  },
  {
    slug: 'jalandhar', name: 'Jalandhar', state: 'Punjab', water: 'Bist Doab canal',
    ghats: ['Bist Doab canal banks (city stretch)', 'Phagwara canal ghats', 'Goraya canal ghats', 'Banga canal ghats', 'Nakodar canal ghats'],
    notes: 'No heritage river ghats — devotees use canal banks. The administration releases water / fills canals just before the festival; Phagwara alone sees 45,000+ devotees.',
  },
  {
    slug: 'chennai', name: 'Chennai', state: 'Tamil Nadu', water: 'Bay of Bengal (beaches)',
    ghats: ['Marina Beach', "Besant Nagar / Elliot's Beach"],
    notes: 'No river-ghat tradition (Cooum/Adyar too polluted) — sea beaches are the venue. Small community celebrations coordinated by Bihari groups like Bihar Chaupal Chennai.',
  },
];
