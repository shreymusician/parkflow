const express = require('express');
const { requestReservation, getReservations } = require('../controllers/reservationController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/request', protect, requestReservation);
router.get('/', protect, getReservations);

module.exports = router;
