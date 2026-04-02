const City = require('../models/City');
const TrafficRecord = require('../models/TrafficRecord');
const Alert = require('../models/Alert');
const mongoose = require('mongoose');

function getLevelAndScore(score) {
  const clamped = Math.max(0, Math.min(100, Math.round(score)));
  if (clamped <= 30) return 'Free';
  if (clamped <= 60) return 'Moderate';
  if (clamped <= 85) return 'Heavy';
  return 'Severe';
}

async function runSimulationTick(io) {
  // Rather than simulate all 40,000+ cities at once, sample a small batch to keep the server alive
  // and prevent flooding the websocket clients.
  const sampleSize = 100;
  // Use aggregation to get random sample
  const cities = await City.aggregate([{ $sample: { size: sampleSize } }]);
  if (cities.length === 0) return [];

  const updates = [];
  const newRecordsData = [];
  const newAlertsData = [];

  for (let city of cities) {
    // get previous record
    const lastRecord = await TrafficRecord.findOne({ city_id: city._id }).sort({ timestamp: -1 }).lean();
    let currentScore = lastRecord ? (lastRecord.congestion_score || 50) : 50;

    // Simulate traffic fluctuation
    let variation = (Math.random() - 0.5) * 15;
    let nextScore = Math.max(0, Math.min(100, currentScore + variation));
    let level = getLevelAndScore(nextScore);

    const vehicleCount = Math.floor(nextScore * 2 + Math.random() * 20);
    const averageSpeed = Math.floor(100 - nextScore * 0.8);
    const timestamp = new Date();
    
    // Instead of creating one-by-one, store in array for bulk insert
    const recordId = new mongoose.Types.ObjectId();
    newRecordsData.push({
      _id: recordId,
      city_id: city._id,
      road_name: 'Main Highway',
      traffic_level: level,
      source: 'Internal Simulation',
      congestion_score: nextScore,
      vehicle_count: vehicleCount,
      average_speed: averageSpeed,
      timestamp: timestamp
    });

    updates.push({
      _id: recordId,
      city_id: city._id,
      traffic_level: level,
      congestion_score: nextScore,
      vehicle_count: vehicleCount,
      average_speed: averageSpeed,
      timestamp: timestamp
    });

    // Auto-generate alerts for Severe traffic
    if (level === 'Severe') {
      const recentAlert = await Alert.findOne({ city_id: city._id, severity: 'Critical' }).sort({ timestamp: -1 });
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      
      // Prevent alert spam
      if (!recentAlert || recentAlert.timestamp < fiveMinsAgo) {
        newAlertsData.push({
          city_id: city._id,
          severity: 'Critical',
          message: `Severe traffic congestion detected in ${city.city_name}.`
        });
      }
    }
  }

  // Bulk operations
  if (newRecordsData.length > 0) {
    await TrafficRecord.insertMany(newRecordsData);
  }
  
  if (newAlertsData.length > 0) {
    const insertedAlerts = await Alert.insertMany(newAlertsData);
    if (io) {
      insertedAlerts.forEach(alert => io.emit('newAlert', alert));
    }
  }

  if (io && updates.length > 0) {
    io.emit('trafficUpdate', updates);
  }

  return updates;
}

function startSimulation(io, intervalMs = 5000) {
  const interval = setInterval(async () => {
    try {
      await runSimulationTick(io);
    } catch (err) {
      console.error('Traffic simulation error:', err);
    }
  }, intervalMs);
  return () => clearInterval(interval);
}

module.exports = { runSimulationTick, startSimulation };
