const express = require('express');
const router = express.Router();
const Camera = require('../models/Camera');

// GET /api/cameras - Fetch all cameras
router.get('/', async (req, res) => {
  try {
    const cameras = await Camera.find().lean();
    res.json(cameras);
  } catch (error) {
    console.error('Error fetching cameras:', error);
    res.status(500).json({ success: false, message: 'Server error fetching cameras' });
  }
});

module.exports = router;
