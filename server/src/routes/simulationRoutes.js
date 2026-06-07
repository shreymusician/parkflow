const express = require('express');
const { simulateTraffic, resetSimulation } = require('../controllers/simulationController');
const { protect, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants/enums');

const router = express.Router();

router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.post('/traffic', simulateTraffic);
router.post('/reset', resetSimulation);

module.exports = router;
