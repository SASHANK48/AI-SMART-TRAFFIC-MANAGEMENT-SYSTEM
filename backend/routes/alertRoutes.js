const express = require('express');
const router = express.Router();
const { getAlerts, addAlert } = require('../controllers/alertController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getAlerts).post(protect, addAlert);

module.exports = router;
