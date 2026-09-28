// National city list (45 cities) — shared by seasonal festival pages
// (Diwali city pages, Karva Chauth moonrise table). Coordinates: city centres.
export interface FestivalCity {
  slug: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
}

export const festivalCities: FestivalCity[] = [
  { slug: 'delhi', name: 'Delhi', state: 'Delhi', lat: 28.61, lon: 77.21 },
  { slug: 'noida', name: 'Noida', state: 'Uttar Pradesh', lat: 28.54, lon: 77.39 },
  { slug: 'ghaziabad', name: 'Ghaziabad', state: 'Uttar Pradesh', lat: 28.67, lon: 77.42 },
  { slug: 'gurugram', name: 'Gurugram', state: 'Haryana', lat: 28.46, lon: 77.03 },
  { slug: 'chandigarh', name: 'Chandigarh', state: 'Chandigarh', lat: 30.73, lon: 76.78 },
  { slug: 'ludhiana', name: 'Ludhiana', state: 'Punjab', lat: 30.9, lon: 75.85 },
  { slug: 'amritsar', name: 'Amritsar', state: 'Punjab', lat: 31.63, lon: 74.87 },
  { slug: 'dehradun', name: 'Dehradun', state: 'Uttarakhand', lat: 30.32, lon: 78.03 },
  { slug: 'jammu', name: 'Jammu', state: 'Jammu & Kashmir', lat: 32.73, lon: 74.86 },
  { slug: 'srinagar', name: 'Srinagar', state: 'Jammu & Kashmir', lat: 34.08, lon: 74.8 },
  { slug: 'lucknow', name: 'Lucknow', state: 'Uttar Pradesh', lat: 26.85, lon: 80.95 },
  { slug: 'kanpur', name: 'Kanpur', state: 'Uttar Pradesh', lat: 26.45, lon: 80.33 },
  { slug: 'varanasi', name: 'Varanasi', state: 'Uttar Pradesh', lat: 25.32, lon: 83.01 },
  { slug: 'prayagraj', name: 'Prayagraj', state: 'Uttar Pradesh', lat: 25.44, lon: 81.85 },
  { slug: 'agra', name: 'Agra', state: 'Uttar Pradesh', lat: 27.18, lon: 78.01 },
  { slug: 'mathura', name: 'Mathura', state: 'Uttar Pradesh', lat: 27.49, lon: 77.67 },
  { slug: 'ayodhya', name: 'Ayodhya', state: 'Uttar Pradesh', lat: 26.8, lon: 82.2 },
  { slug: 'patna', name: 'Patna', state: 'Bihar', lat: 25.59, lon: 85.14 },
  { slug: 'ranchi', name: 'Ranchi', state: 'Jharkhand', lat: 23.34, lon: 85.31 },
  { slug: 'jaipur', name: 'Jaipur', state: 'Rajasthan', lat: 26.91, lon: 75.79 },
  { slug: 'bhopal', name: 'Bhopal', state: 'Madhya Pradesh', lat: 23.26, lon: 77.41 },
  { slug: 'indore', name: 'Indore', state: 'Madhya Pradesh', lat: 22.72, lon: 75.86 },
  { slug: 'nagpur', name: 'Nagpur', state: 'Maharashtra', lat: 21.15, lon: 79.09 },
  { slug: 'raipur', name: 'Raipur', state: 'Chhattisgarh', lat: 21.25, lon: 81.63 },
  { slug: 'ahmedabad', name: 'Ahmedabad', state: 'Gujarat', lat: 23.02, lon: 72.57 },
  { slug: 'surat', name: 'Surat', state: 'Gujarat', lat: 21.17, lon: 72.83 },
  { slug: 'vadodara', name: 'Vadodara', state: 'Gujarat', lat: 22.31, lon: 73.19 },
  { slug: 'rajkot', name: 'Rajkot', state: 'Gujarat', lat: 22.3, lon: 70.8 },
  { slug: 'mumbai', name: 'Mumbai', state: 'Maharashtra', lat: 19.08, lon: 72.88 },
  { slug: 'pune', name: 'Pune', state: 'Maharashtra', lat: 18.52, lon: 73.86 },
  { slug: 'nashik', name: 'Nashik', state: 'Maharashtra', lat: 19.99, lon: 73.79 },
  { slug: 'aurangabad', name: 'Aurangabad', state: 'Maharashtra', lat: 19.88, lon: 75.34 },
  { slug: 'bengaluru', name: 'Bengaluru', state: 'Karnataka', lat: 12.97, lon: 77.59 },
  { slug: 'mysuru', name: 'Mysuru', state: 'Karnataka', lat: 12.3, lon: 76.64 },
  { slug: 'hyderabad', name: 'Hyderabad', state: 'Telangana', lat: 17.39, lon: 78.49 },
  { slug: 'chennai', name: 'Chennai', state: 'Tamil Nadu', lat: 13.08, lon: 80.27 },
  { slug: 'coimbatore', name: 'Coimbatore', state: 'Tamil Nadu', lat: 11.02, lon: 76.96 },
  { slug: 'visakhapatnam', name: 'Visakhapatnam', state: 'Andhra Pradesh', lat: 17.69, lon: 83.22 },
  { slug: 'vijayawada', name: 'Vijayawada', state: 'Andhra Pradesh', lat: 16.51, lon: 80.65 },
  { slug: 'kochi', name: 'Kochi', state: 'Kerala', lat: 9.93, lon: 76.27 },
  { slug: 'thiruvananthapuram', name: 'Thiruvananthapuram', state: 'Kerala', lat: 8.52, lon: 76.94 },
  { slug: 'kolkata', name: 'Kolkata', state: 'West Bengal', lat: 22.57, lon: 88.36 },
  { slug: 'bhubaneswar', name: 'Bhubaneswar', state: 'Odisha', lat: 20.3, lon: 85.82 },
  { slug: 'guwahati', name: 'Guwahati', state: 'Assam', lat: 26.14, lon: 91.74 },
  { slug: 'siliguri', name: 'Siliguri', state: 'West Bengal', lat: 26.72, lon: 88.43 },
];
