const express = require('express');
const { getProfile, updateProfile, getHistory } = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/history', getHistory);

module.exports = router;
