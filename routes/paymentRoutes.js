const express = require('express');
const {
  initializePayment,
  verifyPayment,
  paystackWebhook,
  initiateRefund
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Initialize payment
router.post('/initialize', protect, initializePayment);

// Verify payment
router.get('/verify/:reference', verifyPayment);

// Paystack webhook (for automatic payment notifications)
router.post('/webhook', paystackWebhook);

// Initiate refund (Admin only)
router.post('/refund', protect, authorize('admin'), initiateRefund);

module.exports = router;