require('dotenv').config();
const mongoose = require('mongoose');
const Traffic = require('../models/Traffic');

const INDIAN_CITIES = [
  // Original 10 Cities
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
  // 20 New Cities
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

function getStatus(level) {
  if (level <= 40) return 'Smooth';
  if (level <= 70) return 'Moderate';
  return 'Heavy';
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traffic_db');
    console.log('MongoDB connected for seeding');

    for (const c of INDIAN_CITIES) {
      const congestionLevel = Math.round(Math.random() * 100 * 10) / 10;
      const status = getStatus(congestionLevel);
      await Traffic.findOneAndUpdate(
        { city: c.city },
        {
          city: c.city,
          location: {
            type: 'Point',
            coordinates: [c.longitude, c.latitude],
          },
          latitude: c.latitude,
          longitude: c.longitude,
          congestionLevel,
          status,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );
    }

    console.log('Seeded', INDIAN_CITIES.length, 'cities');
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
