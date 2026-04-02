const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
require('dotenv').config();
const City = require('../models/City');

async function importSqlData(filePath) {
  try {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let currentCities = [];
    const seenNames = new Set();
    console.log(`Reading SQL file: ${filePath}`);

    for await (const line of rl) {
      // Look for the value tuples: ('Name', 'Zone', lat, lng, 'status')
      const match = line.match(/\('([^']+)',\s*'([^']+)',\s*([0-9.]+),\s*([0-9.-]+),\s*'([^']+)'\)/);
      if (match) {
        const name = match[1];
        if (!seenNames.has(name)) {
          seenNames.add(name);
          currentCities.push({
            city_name: name,
            latitude: parseFloat(match[3]),
            longitude: parseFloat(match[4])
          });
        }
      }
    }

    if (currentCities.length > 0) {
      console.log(`Found ${currentCities.length} unique locations. Inserting into MongoDB...`);
      // We'll clear existing cities first to prevent massive duplicates if they ran this multiple times
      await City.deleteMany({});
      await City.insertMany(currentCities);
      console.log('Successfully imported data to MongoDB.');
    } else {
      console.log('No valid data rows found in SQL.');
    }

  } catch (error) {
    console.error('Error parsing SQL to MongoDB:', error);
  }
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traffic_management_system');
    
    // The user provided two files that appear to have identical schemas. 
    // We will load the supabase-insert.sql file as requested.
    const file = path.join(__dirname, '../../project/supabase-insert.sql');
    await importSqlData(file);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
