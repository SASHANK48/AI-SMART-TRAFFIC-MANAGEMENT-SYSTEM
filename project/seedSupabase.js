import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in environment.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const NEW_CITIES = [
  { city: 'Surat', latitude: 21.1702, longitude: 72.8311 },
  { city: 'Lucknow', latitude: 26.8467, longitude: 80.9462 },
  { city: 'Kanpur', latitude: 26.4499, longitude: 80.3319 },
  { city: 'Nagpur', latitude: 21.1458, longitude: 79.0882 },
  { city: 'Indore', latitude: 22.7196, longitude: 75.8577 },
  { city: 'Thane', latitude: 19.2183, longitude: 72.9781 },
  { city: 'Bhopal', latitude: 23.2599, longitude: 77.4126 },
  { city: 'Pimpri-Chinchwad', latitude: 18.6298, longitude: 73.7997 },
  { city: 'Patna', latitude: 25.5941, longitude: 85.1376 },
  { city: 'Vadodara', latitude: 22.3072, longitude: 73.1812 },
  { city: 'Ghaziabad', latitude: 28.6692, longitude: 77.4538 },
  { city: 'Ludhiana', latitude: 30.9010, longitude: 75.8573 },
  { city: 'Agra', latitude: 27.1767, longitude: 78.0081 },
  { city: 'Nashik', latitude: 19.9975, longitude: 73.7898 },
  { city: 'Faridabad', latitude: 28.4089, longitude: 77.3178 },
  { city: 'Meerut', latitude: 28.9845, longitude: 77.7064 },
  { city: 'Rajkot', latitude: 22.3039, longitude: 70.8022 },
  { city: 'Kalyan-Dombivli', latitude: 19.2403, longitude: 73.1305 },
  { city: 'Vasai-Virar', latitude: 19.3919, longitude: 72.8397 },
  { city: 'Varanasi', latitude: 25.3176, longitude: 82.9739 }
];

async function seedSupabaseCameras() {
  console.log('Connecting to Supabase...');

  for (const c of NEW_CITIES) {
    const { data, error } = await supabase
      .from('traffic_cameras')
      .insert([
        {
          name: `${c.city} Junction`,
          location: `${c.city} Main Intersection`,
          latitude: c.latitude,
          longitude: c.longitude,
          status: 'online'
        }
      ]);

    if (error) {
      console.error(`Error inserting ${c.city}:`, error.message);
    } else {
      console.log(`Successfully added ${c.city}`);
    }
  }

  console.log('Finished seeding Supabase.');
  process.exit(0);
}

seedSupabaseCameras();
