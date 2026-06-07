const express = require('express');
const { startSession, endSession, getSessions } = require('../controllers/sessionController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/start', protect, startSession);
router.post('/end', protect, endSession);
router.get('/', protect, getSessions);

module.exports = router;
