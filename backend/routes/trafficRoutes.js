const express = require('express');
const router = express.Router();
const {
  getAllTraffic,
  getTrafficByCity,
  updateTraffic,
} = require('../controllers/trafficController');

router.get('/', getAllTraffic);
router.get('/:city', getTrafficByCity);
router.post('/update', updateTraffic);

module.exports = router;
