/**
 * routes/bookings.js
 */

const express = require('express');
const {
  createBooking,
  createGuestBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getAvailability,
  submitPaymentReference,
  getAllBookings,
  requestReschedule,
  respondToReschedule,
  trackBooking,
} = require('../controllers/bookingController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ---------------------------------------------------------------------------
// PUBLIC ROUTES (no auth)
// ---------------------------------------------------------------------------
router.get('/availability', getAvailability);
router.post('/guest', createGuestBooking);
router.get('/track', trackBooking);                          // guest booking lookup
router.patch('/:id/payment-reference', submitPaymentReference);
router.post('/:id/reschedule', requestReschedule);           // customer reschedule request

// ---------------------------------------------------------------------------
// ADMIN ROUTES (must be before /:id to avoid route conflicts)
// ---------------------------------------------------------------------------
router.get('/admin/all', protect, authorize('admin', 'manager', 'staff'), getAllBookings);
router.put('/:id/reschedule/respond', protect, authorize('admin', 'manager', 'staff'), respondToReschedule);

// ---------------------------------------------------------------------------
// AUTHENTICATED USER ROUTES
// ---------------------------------------------------------------------------
router.route('/')
  .get(protect, getBookings)
  .post(protect, createBooking);

router.put('/:id/status', protect, authorize('admin', 'manager', 'staff'), updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);
router.get('/:id', protect, getBooking);

module.exports = router;