const mongoose = require('mongoose');
const City = require('../models/City');
const User = require('../models/User');

const cities = [
  { city_name: 'New York', latitude: 40.7128, longitude: -74.0060 },
  { city_name: 'Los Angeles', latitude: 34.0522, longitude: -118.2437 },
  { city_name: 'Chicago', latitude: 41.8781, longitude: -87.6298 },
  { city_name: 'Houston', latitude: 29.7604, longitude: -95.3698 },
  { city_name: 'Phoenix', latitude: 33.4484, longitude: -112.0740 }
];

async function seedIfEmpty() {
  try {
    const cityCount = await City.countDocuments();
    if (cityCount === 0) {
      await City.insertMany(cities);
      console.log('Database seeded with initial cities.');
    }

    const adminExists = await User.findOne({ email: 'admin@smarttraffic.com' });
    if (!adminExists) {
      const admin = new User({
        name: 'Super Admin',
        email: 'admin@smarttraffic.com',
        password: 'adminpassword',
        role: 'admin'
      });
      await admin.save();
      console.log('Admin user seeded. (admin@smarttraffic.com / adminpassword)');
    }

  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

module.exports = { seedIfEmpty };
