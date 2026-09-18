// Chhath Puja 2026 — ghat & site directory (39 cities)
// Batch 1+2 researched 18 Sep 2026 from district administration advisories + news
// reports (2024-25 seasons). Municipal ghat lists change yearly — reverify before Nov 2026.

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
  lat: number;
  lon: number;
  ghats: string[];
  notes: string;
}

export const chhathCities: ChhathCity[] = [
  {
    slug: 'patna', name: 'Patna', state: 'Bihar', water: 'Ganga', lat: 25.59, lon: 85.14,
    ghats: ['Patliputra Ghat (Digha)', 'Collectorate Ghat', 'Gandhi Ghat', 'Didarganj Ghat', 'Nasariganj Ghat (Danapur)', 'Kangan Ghat', 'Kali Ghat', 'NIT Ghat', 'Minar Ghat', 'Shiva Ghat', 'Patipul Ghat', 'Kadam Ghat', 'Kila Ghat', 'Panchmukhi Mahavir Ghat'],
    notes: '~550 ghats district-wide (~102 on the Ganga, 45 parks, 63 ponds). Every year the administration bans arghya at dangerous ghats — check the latest district advisory. Facilities: 400+ changing rooms, 552 toilets, 171 watchtowers.',
  },
  {
    slug: 'bhagalpur', name: 'Bhagalpur', state: 'Bihar', water: 'Ganga', lat: 25.25, lon: 87.0,
    ghats: ['Budhanath (Jogsar) Ghat', 'Manik Sarkar Ghat', 'Adampur Ghat', 'Barari Pul Ghat', 'Barari Sidhi Ghat', 'Khirni Ghat', 'Musahri Ghat', 'Nilkanth Ghat', 'Maya Ghat (Mayaganj)', 'Water Works Ghat', 'Dipnagar Ghat', 'Hanuman Ghat'],
    notes: '~60 municipal ghats. 30,000+ devotees take Ganga snan at Barari Pul Ghat, drawing families from across Seemanchal. Dangerous ghats are barricaded with red cloth.',
  },
  {
    slug: 'munger', name: 'Munger', state: 'Bihar', water: 'Ganga', lat: 25.38, lon: 86.47,
    ghats: ['Kashtaharni Ghat', 'Babua Ghat', 'Jail Ghat', 'Sojhi Ghat', 'Jahaj Ghat', 'Lal Darwaja Ganganagar Ghat', 'Belan Bazar Bengali Tola Ghat', 'Kankad Ghat', 'Sati Chauda Ghat', 'Belwa Ghat', 'Herudiyara Ghat', 'Sherpur Ghat'],
    notes: '19 ghats (2025). SDRF teams, divers and watchtowers at major ghats; sandbags laid on muddy steps. Kashtaharni Ghat is the most famous.',
  },
  {
    slug: 'muzaffarpur', name: 'Muzaffarpur', state: 'Bihar', water: 'Budhi Gandak + city ponds', lat: 26.12, lon: 85.39,
    ghats: ['Sidhi Ghat', 'Akhadaghat', 'Ashram Ghat', 'Sikandarpur Marine Drive Ghat', 'Lakdahighat', 'Balughat (Madhya Ghat)', 'Namami Gange Ghat', 'Surya Mandir Ghat', 'Sahu Pokhar', 'Padav Pokhar', 'Ramdayalu Pokhar'],
    notes: '~160 artificial ward-level ghats plus river ghats; ban on private boats/fireworks; NDRF and divers at main ghats. Sahu Pokhar draws the biggest pond crowd.',
  },
  {
    slug: 'purnia', name: 'Purnia', state: 'Bihar', water: 'Saura river + ponds', lat: 25.78, lon: 87.47,
    ghats: ['Saura River City Ghat (Kali Bari)', 'Pakki Talab Ghat', 'Damka Canal Ghat', 'City Kali Mandir Ghat (Milanpara)', 'Tatama Toli Chhath Pokhar', 'Gulabbag Ghat', 'Ram Bagh Chhoti Pulia'],
    notes: '~60,000 devotees across 12 designated ghats; NDRF + 100+ divers, watch towers, steel-piling barricade at Saura City Ghat (~20,000 vratis).',
  },
  {
    slug: 'katihar', name: 'Katihar', state: 'Bihar', water: 'Ganga, Kosi, Mahananda', lat: 25.54, lon: 87.58,
    ghats: ['Manihari Uttarbahini Ganga Ghat', 'Kadhagola Ganga Ghat', 'Kursela Ghat', 'Ganga-Kosi Sangam', 'Kari Kosi Ghat (Hasanganj)', 'Gupta Pokhar (Falka)', 'Nishundra Ghat (Falka)'],
    notes: 'Manihari Ganga Ghat sees ~5 lakh on Nahay-Khay (incl. Nepal/Bhutan visitors), Kadhagola ~3 lakh. SDRF boat patrols and divers at Ganga ghats; 22 ghats in Falka block alone.',
  },
  {
    slug: 'gaya', name: 'Gaya', state: 'Bihar', water: 'Falgu river', lat: 24.79, lon: 85.0,
    ghats: ['Pitamaheshwar Ghat', 'Surya Kund', 'Kendui Ghat', 'Brahmani Ghat', 'Jharkhandeshwar Ghat', 'Sidhiya (Seerhiya) Ghat', 'Bindeshwari Ghat', 'Ram Kund', 'Ramshila Ghat', 'Dev Ghat'],
    notes: 'The Falgu runs dry at Chhath — the corporation builds ~15 temporary kunds across 19 ghats; 41 changing rooms, 13 watch towers. Pitamaheshwar draws the largest crowd.',
  },
  {
    slug: 'darbhanga', name: 'Darbhanga', state: 'Bihar', water: 'Bagmati river + ponds', lat: 26.15, lon: 85.9,
    ghats: ['Pradhan Ghat', 'Kabra Ghat', 'Radhakrishna Mandir Ghat', 'Badrinarayan Ghat', 'Kilaghat', 'Harahi Pokhar', 'Ganga Sagar Pokhar', 'Kanhaiya Mishr Pokhar', 'Mirza Khan Talab'],
    notes: 'Harahi Pokhar is the busiest (~10,000 devotees) with boulder-strewn banks requiring extra care. NDRF/SDRF at sensitive ghats; regular DM/SSP inspections.',
  },
  {
    slug: 'begusarai', name: 'Begusarai', state: 'Bihar', water: 'Ganga river', lat: 25.42, lon: 86.13,
    ghats: ['Simaria Ghat', 'Naulakha Temple ghats (Bishanpur)', 'Ganga Barrage riverbanks', 'Mahant Baba Siyaram Das Sarovar'],
    notes: '17 municipal ghats; Simaria (near Rajendra Setu) is the district main site and also hosts Kartik Kalpavas mela. The Siyaram Das Sarovar has permanent barricading — called the safest.',
  },
  {
    slug: 'siwan', name: 'Siwan', state: 'Bihar', water: 'Daha & Saryu rivers + ponds', lat: 26.22, lon: 84.36,
    ghats: ['Pulwa Ghat (Daha)', 'Shivvrat Sah Ghat', 'Agrawal Ghat', 'Panchmandira Ghat', 'Gola Ghat (Saryu)', 'Mishr Ghat (Saryu)', 'Gyaspur Ghat (Saryu)', 'Kachnar Surya Mandir Ghat', 'Maharajganj Collectori Pokhra'],
    notes: 'CCTV + drone surveillance, divers and NDRF/SDRF patrols; some Saryu ghats flagged dangerous. Kachnar\'s Sun Temple ghat draws crowds from across blocks.',
  },
  {
    slug: 'buxar', name: 'Buxar', state: 'Bihar', water: 'Ganga (Uttarayani)', lat: 25.56, lon: 83.98,
    ghats: ['Ramrekha Ghat', 'Nathcheda Ghat', 'Chhotka Raj Ghat', 'Naya Bhojpur Ghat', 'Katka Muhan Ghat'],
    notes: 'Ramrekha Ghat is the main site — devotees arrive from Nepal, USA and Mauritius. 200+ magistrates, 500+ security personnel, 35 diver boats and drones deployed.',
  },
  {
    slug: 'hajipur', name: 'Hajipur', state: 'Bihar', water: 'Ganga-Gandak confluence', lat: 25.69, lon: 85.21,
    ghats: ['Kaunhara (Konhara) Ghat', 'Namami Gange Ghat', 'Gandak Pul Ghat'],
    notes: 'Kaunhara Ghat at the Ganga-Gandak sangam draws lakhs of vratis. SDRF patrols both rivers (~200 personnel with magistrates); ghat decorated every year.',
  },
  {
    slug: 'delhi', name: 'Delhi', state: 'Delhi', water: 'Yamuna', lat: 28.61, lon: 77.21,
    ghats: ['ITO Ghat (Hathi Ghat)', 'Vasudev Ghat (Kashmiri Gate)', 'Sonia Vihar Ghat', 'Kalindi Kunj', 'Old Railway Bridge Ghat', 'DND Flyover Ghat', 'Yamuna Bank / Chilla Gaon', 'Palla Ghat', 'Mangolpuri sites', 'Janakpuri ward ghats'],
    notes: '17 model ghats from Palla to Kalindi Kunj + 1,000-1,500 citywide sites. After NGT restrictions (2015-2024, artificial ponds only), Yamuna worship was re-allowed in 2025 — immersions barred. Check the latest DDMA advisory.',
  },
  {
    slug: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', water: 'Ganga', lat: 25.32, lon: 83.0,
    ghats: ['Assi Ghat', 'Dashashwamedh Ghat', 'Rajghat', 'Kedar Ghat', 'Harishchandra Ghat', 'Rajendra Prasad Ghat', 'Panchganga Ghat', 'Shitala Ghat', 'Adi Keshav Ghat', 'Tulsi Ghat', 'Ramnagar sandbank'],
    notes: '3 lakh+ devotees across the two arghya days. Old-city approaches (Godowlia, Lanka-Assi, Rajghat) are closed to vehicles on arghya evenings — go early.',
  },
  {
    slug: 'prayagraj', name: 'Prayagraj', state: 'Uttar Pradesh', water: 'Sangam (Ganga-Yamuna-Saraswati)', lat: 25.44, lon: 81.85,
    ghats: ['Sangam / Triveni Ghat', 'Kila Ghat', 'Ram Ghat', 'Arail Ghat', 'Dashashwamedh Ghat (Daraganj)', 'Saraswati Ghat', 'Chandrashekhar Azad (Rasulabad) Ghat', 'Balua Ghat', 'Gau Ghat', 'Shankar Ghat', 'Nagvasuki Ghat'],
    notes: 'Ghat area varies with river level — 2025 high water shrank usable ghats ~30%. Administration lays chequered plates, sandbags and barricading as needed.',
  },
  {
    slug: 'kanpur', name: 'Kanpur', state: 'Uttar Pradesh', water: 'Ganga + canal network', lat: 26.45, lon: 80.33,
    ghats: ['Sarsaiya Ghat', 'Atal Ghat', 'Gola Ghat', 'Maskar Ghat', 'Siddhnath Ghat', 'Parmat Ghat', 'Bithoor (Sanjay Dutt) Ghat', 'Panki Nahar', 'Armapur Nahar', 'Shastri Nagar (Central Park) canal ghat'],
    notes: '~7 lakh Purvanchali residents; ~30,000 puja platforms. Integrated Command Centres at major ghats since the 2022 Bithoor crowd incident; heavy police + medical deployment at Bithoor.',
  },
  {
    slug: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', water: 'Gomti', lat: 26.85, lon: 80.95,
    ghats: ['Lakshman Mela Park Ghat', 'Jhulelal Park / Vatika Ghat', 'Kudiaghat', 'Hanuman Setu', 'Khatushyam Ghat', 'Picnic Spot Ghat (Kukrail bund)', 'Saanjhia Ghat', 'Manikameshwar Aarti Ghat', 'Mehndi Ghat', 'Gauri Chhath Sthal'],
    notes: '88+ designated sites with artificial ponds; 10 lakh+ devotees expected over four days. Zero-waste ghat plan, 300+ CCTV, water police and divers.',
  },
  {
    slug: 'ranchi', name: 'Ranchi', state: 'Jharkhand', water: 'Ponds, tanks and dams', lat: 23.34, lon: 85.31,
    ghats: ['Kanke Dam', 'Dhurwa Dam', 'Bada Talab (Ranchi Lake)', 'Hatnia Talab', 'Chadri Talab', 'Jail Talab / Line Tank', 'Karamtoli Talab', 'Argora Talab', 'Jumar River ghat', 'Madhukam Talab', 'Sarovar Nagar Dam', 'Joda Talab Bariyatu'],
    notes: '74 surveyed ghats (ponds dominate). Every year some are declared high-risk after the monsoon and barricaded — RMC cleans 70+ ponds and installs lighting; NDRF at major ponds.',
  },
  {
    slug: 'bokaro', name: 'Bokaro', state: 'Jharkhand', water: 'Garga river, dams and ponds', lat: 23.67, lon: 86.15,
    ghats: ['Garga river ghats (Dam-Chira Chas stretch)', 'Garga Bridge ghat', 'Surya Sarovar', 'Surya Mandir pond (Sector 4F)', 'Jagannath Temple sarovar (Sector 4D)', 'Two Tank Chhath Ghat', 'City Park ghats', 'Tiranga Park ghat (Sector 1)', 'Rani Pokhar', 'Cooling Pond (Vaishali More)'],
    notes: '2 lakh+ Chhathvratis. Bokaro Steel Plant town administration runs cleaning, lighting and medical camps; Tiranga Park ghat is the most decorated.',
  },
  {
    slug: 'kolkata', name: 'Kolkata', state: 'West Bengal', water: 'Hooghly', lat: 22.57, lon: 88.36,
    ghats: ['Babughat (Baje Kadamtala)', 'Doighat', 'Taktaghat', 'Prinsep Ghat', 'Outram Ghat', 'Millennium Park ghat', 'Judges Ghat', 'Biswarjan Ghat (New Town)', 'Kasba / Patuli / Jodhpur Park water bodies'],
    notes: '27 Hooghly ghats open + ~140 citywide sites; Howrah has 51. Rabindra Sarobar and Subhas Sarobar are CLOSED to Chhath rituals by court order.',
  },
  {
    slug: 'dehradun', name: 'Dehradun', state: 'Uttarakhand', water: 'Tons, Rispana, Asan, Song rivers', lat: 30.32, lon: 78.03,
    ghats: ['Tapkeshwar Mahadev Ghat', 'Chandrabadni Ghat (Sevlakalan)', 'Prem Nagar Ghat (Tons)', 'Maldevta Ghat', 'Raipur Ghat', 'Kesarwala Ghat', 'Gullarghati Ghat', 'Brahmpuri Ghat', 'Nanda Ki Chowki (Asan)', 'Doiwala Song river bank'],
    notes: '22-23 designated ghats, run largely by the Bihari Mahasabha. DJs and fireworks banned; mobile toilets, changing rooms and a dedicated traffic plan.',
  },
  {
    slug: 'haridwar', name: 'Haridwar', state: 'Uttarakhand', water: 'Ganga', lat: 29.95, lon: 78.16,
    ghats: ['Har Ki Pauri', 'Maharaja Agrasen Ghat (Kankhal)', 'Rajghat (Kankhal)', 'Bahadarabad Ganga Ghat', 'Prem Nagar Ashram Ghat'],
    notes: 'Large Purvanchal-community turnout at the Ganga ghats; the administration handles cleaning, security and lighting.',
  },
  {
    slug: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', water: 'Upper Lake (Bhojtal) + dams', lat: 23.26, lon: 77.41,
    ghats: ['Sheetaldas Ki Bagiya (Kamla Park)', 'Khatlapura Ghat', 'Kali Mandir Ghat', 'Saraswati Ghat (Barkheda)', 'Prempura Ghat', 'Vardhman Park (Sunset Point)', 'Hathai Kheda Dam', 'Ghoda Pachhad Dam'],
    notes: '52 ghats across the city, mostly on the Upper Lake. Lakhs expected; mobile toilets, changing rooms, plastic ban; platform pre-booking at Saraswati Ghat (~2,000 platforms).',
  },
  {
    slug: 'indore', name: 'Indore', state: 'Madhya Pradesh', water: 'Lakes, ponds and artificial kunds', lat: 22.72, lon: 75.86,
    ghats: ['Vijay Nagar ghat', 'Banganga', 'Pipliyahana Lake', 'Pipliyapala Lake', 'Sirpur Lake', 'Tigria Badshah', 'Khajrana ghat', 'Surya Mandir (CAT Road)', 'Man Kameshwar Mahadev Garden'],
    notes: '150-200 venues citywide; 2.5-3 lakh devotees. 3 new dedicated Chhath ponds sanctioned (Annapurna, Pipliyahana, Chhota Bangarda); the CM attended the Man Kameshwar venue in 2025.',
  },
  {
    slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra', water: 'Arabian Sea, Powai Lake, Banganga', lat: 19.08, lon: 72.88,
    ghats: ['Juhu Beach', 'Dadar Chowpatty', 'Girgaon Chowpatty', 'Versova Beach', 'Aksa Beach', 'Gorai Beach', 'Powai Lake', 'Banganga Tank (Walkeshwar)', 'Kopri Pond'],
    notes: 'BMC arranged 67 locations in 2025 (148 artificial ponds, 403 changing rooms). Juhu is the epicentre; special trains run from Bihar/UP before the festival.',
  },
  {
    slug: 'pune', name: 'Pune', state: 'Maharashtra', water: 'Mula-Mutha rivers, canals, lakes', lat: 18.52, lon: 73.86,
    ghats: ['Sangam Ghat (Bund Garden)', 'Mula riverbank (Hinjawadi)', 'Pimpri-Chinchwad riverbank (Kalewadi Bridge)', 'Pawneshwar Ghat (Pimpri)', 'Ganesh Talav (Pradhikaran)', 'Ramhari Talav (Aundh-Baner)', 'Maling Ghat (Aundh)', 'Khadakwasla Lake', 'Jambhulwadi Lake (Katraj)', 'Ghorpadi canal ghat'],
    notes: '40+ locations across Pune-PCMC (Bihar Foundation lists). Jambhulwadi draws 10,000+; many societies build artificial ponds.',
  },
  {
    slug: 'nagpur', name: 'Nagpur', state: 'Maharashtra', water: 'Lakes + Kanhan/Vena rivers', lat: 21.15, lon: 79.09,
    ghats: ['Ambazari Lake', 'Futala Lake', 'Police Line Takli', 'Gorewada Lake', 'Kanhan river bank (below bridge)', 'Vena river ghat (Mouza Rangapar/Butibori)', 'Isasani Ghat', 'Khaparkheda Ghat'],
    notes: 'Ambazari Lake is the main venue (~50,000), run by the Uttar Bhartiya Sabha. NMC handles cleaning and wooden railings; air-filled safety tubes placed in the water.',
  },
  {
    slug: 'jaipur', name: 'Jaipur', state: 'Rajasthan', water: 'Galta ji kunds + artificial ponds', lat: 26.91, lon: 75.79,
    ghats: ['Galta Tirth / Galta Ji Kund', 'Maavtha Sagar (Amer)', 'Dehlawas Balaji Mandir (Pratap Nagar)', 'Housing Board Ground (Sanganer)', 'Vatika (Tonk Road)', 'Jagatpura sites', 'Kishanbag (Swarna Jayanti Garden)', 'Murlipura sites'],
    notes: 'Galta Ji Kund is the main venue (lakhs) with full district-administration setup — control room, medical teams, divers at the kunds. Many colony-level artificial ponds across the city.',
  },
  {
    slug: 'chandigarh', name: 'Chandigarh', state: 'Chandigarh', water: 'Sector 42 New Lake + MC sites', lat: 30.73, lon: 76.78,
    ghats: ['Sector 42 New Lake', 'Sector 49C site', 'Sector 47 site', 'Sunder Nagar MC site', 'Mauli Jagran MC site', 'New Indra Colony (Manimajra)'],
    notes: 'Sector 42 New Lake is the designated main venue — Sukhna Lake is banned for rituals by the administration. Lakhs gather; CCTV, 24x7 control room, repaired bridge and parking arrangements.',
  },
  {
    slug: 'guwahati', name: 'Guwahati', state: 'Assam', water: 'Brahmaputra', lat: 26.14, lon: 91.74,
    ghats: ['Uzan Bazar Ghat', 'Kachari Ghat', 'Fancy Bazar Ghat', 'Pandu Ghat', 'Lachit Ghat', 'Bhootnath Ghat', 'Soonsali Ghat', 'Narengi Ghat'],
    notes: 'Brahmaputra ghats along MG Road (Bhootnath to Uzan Bazar) with barricading, cleaning and illumination; organised by Bihari community bodies. The CM joined Usha Arghya at Pandu Ghat.',
  },
  {
    slug: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha', water: 'Kuakhai river', lat: 20.3, lon: 85.82,
    ghats: ['Kuakhai river ghat (Pandra/Mancheswar)', 'Bali Yatra ground (Mancheswar)', 'BMC-cleared water bodies citywide'],
    notes: 'The Kuakhai ghat at Pandra is the main venue, organised by the Bihar association "Biswas"; the Odisha CM performed rituals there in 2025. BMC permits mass bathing and cleans the banks.',
  },
  {
    slug: 'surat', name: 'Surat', state: 'Gujarat', water: 'Tapi', lat: 21.17, lon: 72.83,
    ghats: ['Chhath ghat near Indira Bridge', 'Jahangirpura Ghat', 'Navdi Ovra Ghat', 'Kurukshetra Ghat (Ovra)', 'Causeway (Weir) ghat', 'Dindoli Lake', 'Parvat Patiya Lake', 'Mora Tekra', 'Singanpore community venues', 'Godadara community venues'],
    notes: '25 SMC locations (10 natural + 15 artificial). Jahangirpura expects 80,000+. Special trains run from Udhna to Bihar/UP.',
  },
  {
    slug: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', water: 'Sabarmati', lat: 23.02, lon: 72.57,
    ghats: ['Chhath Ghat near Indira Bridge (purpose-built, main venue)', 'Narayan (Naran) Ghat (Subhash Bridge riverfront)', 'Atal Ghat (Ellis-Nehru bridge stretch)', 'Godrej Garden City kund', 'Bapunagar community setups', 'Khodiyarnagar community setups'],
    notes: 'The 300-m purpose-built ghat near Indira Bridge (opened 2018) is the main venue with 5,000+ devotees; AMC releases Sabarmati water and sets up domes and changing rooms.',
  },
  {
    slug: 'vadodara', name: 'Vadodara', state: 'Gujarat', water: 'Mahisagar river + city lakes', lat: 22.31, lon: 73.19,
    ghats: ['Mahisagar river bank (Vasad)', 'Fazalpur ghat', 'Kotna beach', 'Kapurai Lake', 'Bapod Lake', 'Harni Lake'],
    notes: 'Organised by Bihar Sanskrutik Mandal and Hindi Vikas Manch (20+ years); ~1 lakh devotees citywide, ~40,000 at Fazalpur. Special kunds, boats and swimmers, police coordination.',
  },
  {
    slug: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', water: 'Lakes and tanks', lat: 12.97, lon: 77.59,
    ghats: ['Ulsoor Lake', 'Hebbal Lake', 'Sankey Tank', 'Hesaraghatta Lake', 'Rayasandra Lake (Hosa Road)', 'Agara Kalyani (Hulimavu)', 'Austin Town Ground (artificial pond)', 'Narayanpura Park (ORR)', 'Art of Living center pond (Kanakapura Road)'],
    notes: '4,000+ north-Indian families participate; artificial ponds are standard where lake access is restricted. Ulsoor Lake is the most popular venue.',
  },
  {
    slug: 'hyderabad', name: 'Hyderabad', state: 'Telangana', water: 'Hussainsagar + city lakes', lat: 17.39, lon: 78.49,
    ghats: ['Bathukamma Ghat / Children\'s Park (Tank Bund)', 'Necklace Road (Jala Vihar)', 'Sunnam Cheruvu (Borabanda)', 'Fox Sagar (Jeedimetla)', 'Uppal pond', 'Kukatpally ponds', 'Miyapur temporary ghat'],
    notes: '29-50 permitted sites across the twin cities, coordinated by Jan Seva Sangh and Bihar Association; ~50,000 expected at Tank Bund alone.',
  },
  {
    slug: 'ludhiana', name: 'Ludhiana', state: 'Punjab', water: 'Sidhwan Canal, Sutlej', lat: 30.9, lon: 75.85,
    ghats: ['Sidhwan Canal ghats (Pakhowal Road bridge)', 'Sutlej river banks', 'Giaspura community ghats', 'Sherpur Chowk sites', 'Ishar Nagar', 'Dhandhari', 'Jassian', 'Lalton', 'Doraha canal banks'],
    notes: '~5 lakh participants. Celebrations depend on the irrigation department releasing canal water — sometimes delayed; makeshift ghats appear in parks.',
  },
  {
    slug: 'jalandhar', name: 'Jalandhar', state: 'Punjab', water: 'Bist Doab canal', lat: 31.33, lon: 75.58,
    ghats: ['Bist Doab canal banks (city stretch)', 'Phagwara canal ghats', 'Goraya canal ghats', 'Banga canal ghats', 'Nakodar canal ghats'],
    notes: 'No heritage river ghats — devotees use canal banks. The administration releases water / fills canals just before the festival; Phagwara alone sees 45,000+ devotees.',
  },
  {
    slug: 'chennai', name: 'Chennai', state: 'Tamil Nadu', water: 'Bay of Bengal (beaches)', lat: 13.08, lon: 80.27,
    ghats: ['Marina Beach', "Besant Nagar / Elliot's Beach"],
    notes: 'No river-ghat tradition (Cooum/Adyar too polluted) — sea beaches are the venue. Small community celebrations coordinated by Bihari groups like Bihar Chaupal Chennai.',
  },
];
