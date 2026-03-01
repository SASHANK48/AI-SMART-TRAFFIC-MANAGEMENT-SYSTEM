const mongoose = require('mongoose');

const trafficSchema = new mongoose.Schema({
  city: {
    type: String,
    required: true,
    trim: true,
    unique: true,
    index: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude] for GeoJSON
      required: true,
    },
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  congestionLevel: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Smooth', 'Moderate', 'Heavy'],
    default: 'Smooth',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
  toJSON: { virtuals: false },
  toObject: { virtuals: false },
});

// Ensure 2dsphere index for geospatial queries (optional)
trafficSchema.index({ location: '2dsphere' });

trafficSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Traffic', trafficSchema);
