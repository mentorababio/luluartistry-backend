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
   ROOT ROUTES (Must be first to avoid shadowing)
================================= */
router.route('/')
  .post(protect, createOrder)
  .get(protect, getOrders);

/* =================================
   ADMIN ROUTES
================================= */
router.get('/admin', protect, authorize('admin'), getAllOrdersAdmin);
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.get('/admin/:id/history', protect, authorize('admin'), getOrderHistory);
router.patch('/admin/:id/accept', protect, authorize('admin'), acceptOrder);
router.patch('/admin/:id/decline', protect, authorize('admin'), declineOrder);
router.patch('/admin/:id/deliver', protect, authorize('admin'), markOrderDelivered);
router.get('/admin/:id', protect, authorize('admin'), getOrderDetailsAdmin);

/* =================================
   USER / PAYMENT ROUTES
================================= */
router.get('/my', protect, getMyOrders);
router.post('/checkout', protect, createOrder);
router.post('/payment/initialize', protect, initializePayment);
router.get('/my/:id', protect, getMyOrder);
router.patch('/my/:id/payment-reference', protect, addPaymentReference);
router.put('/payment/confirm/:orderId', protect, authorize('admin'), confirmBankTransferPayment);

/* =================================
   DYNAMIC ID ROUTES (Must be last)
================================= */
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.patch('/:id/confirm-payment', protect, authorize('admin'), confirmBankTransferPayment);
router.get('/:id', protect, getOrder);

module.exports = router;