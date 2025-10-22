const express = require('express');
const {
  createBooking,
  getBookings,
  getBooking,
  updateBookingStatus,
  cancelBooking,
  getAvailability,
  getAllBookings
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Get user bookings & Create new booking
router.route('/')
  .get(protect, getBookings)
  .post(protect, createBooking);

// Check available time slots (Public - anyone can check)
router.get('/availability', getAvailability);

// Get all bookings (Admin only)
router.get('/admin/all', protect, authorize('admin'), getAllBookings);

// Get single booking
router.get('/:id', protect, getBooking);

// Update booking status (Admin only)
router.put('/:id/status', protect, authorize('admin'), updateBookingStatus);

// Cancel booking
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;