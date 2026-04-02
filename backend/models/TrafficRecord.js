const mongoose = require('mongoose');

const trafficSchema = new mongoose.Schema({
  city_id: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  road_name: { type: String, required: true },
  traffic_level: { type: String, enum: ['Free', 'Moderate', 'Heavy', 'Severe'], required: true },
  vehicle_count: { type: Number, default: 0 },
  average_speed: { type: Number, default: 0 },
  congestion_score: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now },
  source: { type: String, default: 'Internal Simulation' }
});

module.exports = mongoose.model('TrafficRecord', trafficSchema);
