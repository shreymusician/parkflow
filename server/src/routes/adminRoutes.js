const express = require('express');
const { getAnalytics } = require('../controllers/adminController');
const { protect, authorize } = require('../middlewares/auth');
const { ROLES } = require('../constants/enums');

const router = express.Router();

// All routes require authentication and admin privileges
router.use(protect);
router.use(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN));

router.get('/analytics', getAnalytics);

module.exports = router;
