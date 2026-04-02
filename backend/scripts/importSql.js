const fs = require('fs');
const path = require('path');
const readline = require('readline');
const mongoose = require('mongoose');
require('dotenv').config();
const City = require('../models/City');

async function getSqlData(filePath, seenNames) {
  try {
    const fileStream = fs.createReadStream(filePath);
    const rl = readline.createInterface({
      input: fileStream,
      crlfDelay: Infinity
    });

    let currentCities = [];
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
    return currentCities;
  } catch (error) {
    console.error(`Error parsing SQL from ${filePath}:`, error);
    return [];
  }
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/traffic_management_system');
    
    const file1 = path.join(__dirname, '../../project/supabase-insert.sql');
    const file2 = path.join(__dirname, '../../project/south_india_insert.sql');
    
    const seenNames = new Set();
    const cities1 = await getSqlData(file1, seenNames);
    const cities2 = await getSqlData(file2, seenNames);
    
    const allCities = [...cities1, ...cities2];
    
    if (allCities.length > 0) {
      console.log(`Found ${allCities.length} unique locations in total. Inserting into MongoDB...`);
      await City.deleteMany({});
      await City.insertMany(allCities);
      console.log('Successfully imported combined data to MongoDB.');
    } else {
      console.log('No valid data rows found in SQL.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
