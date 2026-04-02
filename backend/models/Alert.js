const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  city_id: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true },
  severity: { type: String, enum: ['Low', 'Medium', 'High', 'Critical'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);
