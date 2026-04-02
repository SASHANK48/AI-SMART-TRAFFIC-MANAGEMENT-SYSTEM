const express = require('express');
const router = express.Router();
const { getCities, addCity } = require('../controllers/cityController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(getCities).post(protect, admin, addCity);

module.exports = router;
