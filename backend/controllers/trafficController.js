const Traffic = require('../models/Traffic');
const { getStatusFromLevel } = require('../services/trafficSimulator');

/**
 * GET /api/traffic - Return all city traffic data
 */
const getAllTraffic = async (req, res, next) => {
  try {
    const data = await Traffic.find().sort({ city: 1 }).lean();
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/traffic/:city - Return specific city traffic (city name, case-insensitive)
 */
const getTrafficByCity = async (req, res, next) => {
  try {
    const city = req.params.city?.trim();
    if (!city) {
      return res.status(400).json({ success: false, message: 'City name is required' });
    }
    const doc = await Traffic.findOne({ city: new RegExp(`^${city}$`, 'i') }).lean();
    if (!doc) {
      return res.status(404).json({ success: false, message: `No traffic data for city: ${city}` });
    }
    res.json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/traffic/update - Update congestion manually
 * Body: { city: string, congestionLevel?: number (0-100) }
 */
const updateTraffic = async (req, res, next) => {
  try {
    const { city, congestionLevel } = req.body;
    if (!city || typeof city !== 'string') {
      return res.status(400).json({ success: false, message: 'City name is required' });
    }
    const level = congestionLevel != null ? Number(congestionLevel) : null;
    if (level != null && (isNaN(level) || level < 0 || level > 100)) {
      return res.status(400).json({ success: false, message: 'congestionLevel must be between 0 and 100' });
    }

    const update = {};
    if (level != null) {
      update.congestionLevel = Math.max(0, Math.min(100, level));
      update.status = getStatusFromLevel(update.congestionLevel);
      update.updatedAt = new Date();
    }

    const doc = await Traffic.findOneAndUpdate(
      { city: new RegExp(`^${city}$`, 'i') },
      update,
      { new: true }
    ).lean();

    if (!doc) {
      return res.status(404).json({ success: false, message: `City not found: ${city}` });
    }

    res.json({ success: true, data: doc });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllTraffic,
  getTrafficByCity,
  updateTraffic,
};
