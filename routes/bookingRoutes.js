/**
 * routes/bookings.js
 * ------------------
 * Route order matters in Express — specific paths must come before :id wildcards.
 *
 * Public routes:   /availability, /guest
 * Admin routes:    /admin/all
 * Auth routes:     /, /:id, /:id/status, /:id/cancel
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
  getAllBookings,
} = require('../controllers/bookingController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ---------------------------------------------------------------------------
// PUBLIC ROUTES (no auth)
// ---------------------------------------------------------------------------
router.get('/availability', getAvailability);
router.post('/guest', createGuestBooking);

// ---------------------------------------------------------------------------
// ADMIN ROUTES (must be before /:id to avoid route conflicts)
// ---------------------------------------------------------------------------
router.get('/admin/all', protect, authorize('admin', 'manager', 'staff'), getAllBookings);

// ---------------------------------------------------------------------------
// AUTHENTICATED USER ROUTES
// ---------------------------------------------------------------------------
router.route('/')
  .get(protect, getBookings)
  .post(protect, createBooking);

// PUT before GET /:id to avoid conflicts
router.put('/:id/status', protect, authorize('admin', 'manager', 'staff'), updateBookingStatus);
router.put('/:id/cancel', protect, cancelBooking);
router.get('/:id', protect, getBooking);

module.exports = router;