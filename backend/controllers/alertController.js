const Alert = require('../models/Alert');

const getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find({}).populate('city_id', 'city_name').sort({ timestamp: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const addAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    // Optionally emit socket event here
    res.status(201).json(alert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

module.exports = { getAlerts, addAlert };
