const express = require('express');
const { getLocations, getHeatmap } = require('../controllers/locationController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.get('/heatmap', protect, getHeatmap);
router.get('/', protect, getLocations);

module.exports = router;
