const express = require('express');

// USER CONTROLLERS
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getMyOrders,
  getMyOrder,
  addPaymentReference
} = require('../controllers/orderController');

// ADMIN CONTROLLERS
const {
  getAllOrdersAdmin,
  getOrderDetailsAdmin,
  acceptOrder,
  declineOrder,
  markOrderDelivered,
  getOrderHistory
} = require('../controllers/adminOrderController');

// PAYMENT
const {
  initializePayment,
  confirmBankTransferPayment
} = require('../controllers/paymentController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

/* =================================
   ADMIN ROUTES FIRST (SPECIFIC PATTERNS FIRST)
================================= */

// Dashboard orders (tabs + filters)
router.get('/admin', protect, authorize('admin'), getAllOrdersAdmin);

// Order history (timeline)
router.get('/admin/:id/history', protect, authorize('admin'), getOrderHistory);

// Order details (must come AFTER the specific action routes)
router.get('/admin/:id', protect, authorize('admin'), getOrderDetailsAdmin);

// Explicit admin actions (UI buttons)
router.patch('/admin/:id/accept', protect, authorize('admin'), acceptOrder);
router.patch('/admin/:id/decline', protect, authorize('admin'), declineOrder);
router.patch('/admin/:id/deliver', protect, authorize('admin'), markOrderDelivered);

/* =================================
   USER ROUTES - SPECIFIC ROUTES FIRST
================================= */

// My orders (logged-in user)
router.get('/my', protect, getMyOrders);
router.get('/my/:id', protect, getMyOrder);
router.patch('/my/:id/payment-reference', protect, addPaymentReference);

// Create order / Get user orders (generic)
router.route('/')
  .post(protect, createOrder)
  .get(protect, getOrders);

// Legacy checkout alias for frontend compatibility
router.post('/checkout', protect, createOrder);

// Cancel order (user)
router.put('/:id/cancel', protect, cancelOrder);

// Admin confirms manual transfer payment
router.patch('/:id/confirm-payment', protect, authorize('admin'), confirmBankTransferPayment);

// Get single order (user) - GENERIC ROUTE LAST
router.get('/:id', protect, getOrder);

/* =================================
   LEGACY / COMPATIBILITY ROUTES
================================= */

// Keep existing admin routes (do NOT remove)
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);

/* =================================
   PAYMENT ROUTES
================================= */

router.post('/payment/initialize', protect, initializePayment);
router.put('/payment/confirm/:orderId', protect, authorize('admin'), confirmBankTransferPayment);

module.exports = router;
