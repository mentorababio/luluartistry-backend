
const express = require('express');
const { getSettings, updateSettings, getPublicSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public — used by checkout to get bank details
router.get('/public', getPublicSettings);

// Admin only
router.get('/',    protect, authorize('admin'), getSettings);
router.put('/',    protect, authorize('admin'), updateSettings);

module.exports = router;