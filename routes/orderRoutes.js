const express = require('express');
const router = express.Router();

const {
  createOrder, getOrders, getOrder, updateOrderStatus,
  cancelOrder, getAllOrders, getMyOrders, getMyOrder, addPaymentReference
} = require('../controllers/orderController');

const {
  getAllOrdersAdmin, getOrderDetailsAdmin, acceptOrder, 
  declineOrder, markOrderDelivered, getOrderHistory
} = require('../controllers/adminOrderController');

const { initializePayment, confirmBankTransferPayment } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

/* =================================
   1. ADMIN ROUTES (SPECIFIC)
================================= */
router.get('/admin', protect, authorize('admin'), getAllOrdersAdmin);
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.get('/admin/:id/history', protect, authorize('admin'), getOrderHistory);
router.patch('/admin/:id/accept', protect, authorize('admin'), acceptOrder);
router.patch('/admin/:id/decline', protect, authorize('admin'), declineOrder);
router.patch('/admin/:id/deliver', protect, authorize('admin'), markOrderDelivered);
router.get('/admin/:id', protect, authorize('admin'), getOrderDetailsAdmin);

/* =================================
   2. USER/PAYMENT ROUTES (SPECIFIC)
================================= */
router.get('/my', protect, getMyOrders);
router.post('/checkout', protect, createOrder);
router.post('/payment/initialize', protect, initializePayment);

// These need specific paths
router.get('/my/:id', protect, getMyOrder);
router.patch('/my/:id/payment-reference', protect, addPaymentReference);
router.put('/payment/confirm/:orderId', protect, authorize('admin'), confirmBankTransferPayment);

/* =================================
   3. GENERIC / DYNAMIC ROUTES (LAST)
================================= */
// Order root
router.route('/')
  .post(protect, createOrder)
  .get(protect, getOrders);

// Dynamic ID routes
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.patch('/:id/confirm-payment', protect, authorize('admin'), confirmBankTransferPayment);
router.get('/:id', protect, getOrder);

module.exports = router;