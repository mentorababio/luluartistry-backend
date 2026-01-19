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
   USER ROUTES
================================= */

// Create order / Get user orders
router.route('/')
  .post(protect, createOrder)
  .get(protect, getOrders);

// Get single order (user)
router.get('/:id', protect, getOrder);

// Cancel order (user)
router.put('/:id/cancel', protect, cancelOrder);

/* =================================
   ADMIN ROUTES (NEW & CLEAN)
================================= */

// Dashboard orders (tabs + filters)
router.get('/admin', protect, authorize('admin'), getAllOrdersAdmin);

// Order details
router.get('/admin/:id', protect, authorize('admin'), getOrderDetailsAdmin);

// Order history (timeline)
router.get('/admin/:id/history', protect, authorize('admin'), getOrderHistory);

// Explicit admin actions (UI buttons)
router.patch('/admin/:id/accept', protect, authorize('admin'), acceptOrder);
router.patch('/admin/:id/decline', protect, authorize('admin'), declineOrder);
router.patch('/admin/:id/deliver', protect, authorize('admin'), markOrderDelivered);


/* =================================
   LEGACY / COMPATIBILITY ROUTES
================================= */

// Keep existing admin routes (do NOT remove)
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);



router.get('/my', protect, getMyOrders);
router.get('/my/:id', protect, getMyOrder);
router.patch('/my/:id/payment-reference', protect, addPaymentReference);

/* =================================
   PAYMENT ROUTES
================================= */

router.post('/payment/initialize', protect, initializePayment);
router.put('/payment/confirm/:orderId', protect, authorize('admin'), confirmBankTransferPayment);

module.exports = router;
