const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService,
  seedServices
} = require('../controllers/serviceController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getServices);
router.get('/:id', getService);

// Admin only
router.post('/seed', protect, authorize('admin'), seedServices);
router.post('/', protect, authorize('admin'), createService);
router.put('/:id', protect, authorize('admin'), updateService);
router.delete('/:id', protect, authorize('admin'), deleteService);

module.exports = router;