const TrafficCamera = require('../models/TrafficCamera');

/**
 * GET /api/cameras - Return all traffic cameras
 */
const getAllCameras = async (req, res, next) => {
  try {
    const data = await TrafficCamera.find().sort({ createdAt: 1 });
    res.json({ success: true, count: data.length, data });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCameras,
};
