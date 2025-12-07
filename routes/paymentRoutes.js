const express = require('express');
const {
  initializePayment,
  verifyPayment,
  paystackWebhook,
  initiateRefund,
  verifyPaystackPayment,
  confirmBankTransferPayment  // ← Add this
} = require('../controllers/paymentController');

const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Public routes
router.get('/verify/:reference', verifyPayment);
router.post('/webhook', paystackWebhook);

// User routes
router.post('/initialize', protect, initializePayment);
router.post('/verify-order/:id', protect, verifyPaystackPayment);  // ← For orders specifically

// Admin routes
router.post('/refund', protect, authorize('admin'), initiateRefund);
router.put('/confirm-bank-transfer/:orderId', protect, authorize('admin'), confirmBankTransferPayment);  // ← NEW

module.exports = router;