const Traffic = require('../models/Traffic');

const INDIAN_CITIES = [
  { city: 'Hyderabad', latitude: 17.385, longitude: 78.4867 },
  { city: 'Bangalore', latitude: 12.9716, longitude: 77.5946 },
  { city: 'Chennai', latitude: 13.0827, longitude: 80.2707 },
  { city: 'Mumbai', latitude: 19.076, longitude: 72.8777 },
  { city: 'Delhi', latitude: 28.7041, longitude: 77.1025 },
  { city: 'Kolkata', latitude: 22.5726, longitude: 88.3639 },
  { city: 'Pune', latitude: 18.5204, longitude: 73.8567 },
  { city: 'Visakhapatnam', latitude: 17.6868, longitude: 83.2185 },
  { city: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714 },
  { city: 'Jaipur', latitude: 26.9124, longitude: 75.7873 },
];

function getStatus(level) {
  if (level <= 40) return 'Smooth';
  if (level <= 70) return 'Moderate';
  return 'Heavy';
}

async function seedIfEmpty() {
  const count = await Traffic.countDocuments();
  if (count > 0) return false;
  for (const c of INDIAN_CITIES) {
    const congestionLevel = Math.round(Math.random() * 100 * 10) / 10;
    await Traffic.create({
      city: c.city,
      location: { type: 'Point', coordinates: [c.longitude, c.latitude] },
      latitude: c.latitude,
      longitude: c.longitude,
      congestionLevel,
      status: getStatus(congestionLevel),
    });
  }
  console.log('Auto-seeded', INDIAN_CITIES.length, 'cities');
  return true;
}

module.exports = { seedIfEmpty };
