const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders
} = require('../controllers/orderController');
const {
  initializePayment,
  confirmBankTransferPayment
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get user orders & Create new order
router.route('/').get(protect, getOrders).post(protect, createOrder);

// Get all orders (Admin only)
router.get('/admin/all', protect, authorize('admin'), getAllOrders);

// Get single order
router.get('/:id', protect, getOrder);

// Update order status (Admin only)
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

// Cancel order
router.put('/:id/cancel', protect, cancelOrder);

// Add payment routes here temporarily
router.post('/payment/initialize', protect, initializePayment);
router.put('/payment/confirm/:orderId', protect, authorize('admin'), confirmBankTransferPayment);

module.exports = router;module.exports = router;