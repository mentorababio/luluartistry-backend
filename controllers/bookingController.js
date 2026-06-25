/**
 * bookingController.js
 * --------------------
 * Thin controllers. All business logic lives in bookingService.js.
 *
 * WHY thin controllers:
 * - Controllers only handle HTTP concerns (req/res/next)
 * - Business logic is testable independently of Express
 * - Both authenticated and guest routes share identical core logic
 */

const { createBookingService } = require('../services/bookingService');
const Booking = require('../models/Booking');
const ErrorResponse = require('../utils/errorResponse');

// ---------------------------------------------------------------------------
// POST /api/bookings
// Authenticated users only
// ---------------------------------------------------------------------------
exports.createBooking = async (req, res, next) => {
  console.log('[Controller] POST /api/bookings — authenticated user:', req.user?.id);
  try {
    const { booking } = await createBookingService(req.body, req.user);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error('[Controller] createBooking error:', err.message);
    return next(new ErrorResponse(err.message, err.statusCode || 500));
  }
};

// ---------------------------------------------------------------------------
// POST /api/bookings/guest
// Public — no authentication required
// ---------------------------------------------------------------------------
exports.createGuestBooking = async (req, res, next) => {
  console.log('[Controller] POST /api/bookings/guest — guest booking');
  try {
    const { booking } = await createBookingService(req.body, null);
    res.status(201).json({ success: true, data: booking });
  } catch (err) {
    console.error('[Controller] createGuestBooking error:', err.message);
    return next(new ErrorResponse(err.message, err.statusCode || 500));
  }
};

// ---------------------------------------------------------------------------
// GET /api/bookings
// Get bookings for the logged-in customer
// ---------------------------------------------------------------------------
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('service', 'name category')
      .sort('-appointmentDate');

    res.status(200).json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/bookings/:id
// Get a single booking (owner or admin)
// ---------------------------------------------------------------------------
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'name category description');

    if (!booking) {
      return next(new ErrorResponse('Booking not found', 404));
    }

    const isOwner = booking.customer && booking.customer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/bookings/admin/all
// Admin: get all bookings with filters
// ---------------------------------------------------------------------------
exports.getAllBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.location) query.location = req.query.location;
    if (req.query.date) query.appointmentDate = new Date(req.query.date);

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('customer', 'firstName lastName email phone')
      .populate('service', 'name category')
      .sort('-appointmentDate')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({ success: true, count: bookings.length, total, data: bookings });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// PUT /api/bookings/:id/status
// Admin: update booking status
// ---------------------------------------------------------------------------
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) return next(new ErrorResponse('Booking not found', 404));

    booking.status = status;
    if (note) booking.notes.adminNotes = note;
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// PUT /api/bookings/:id/cancel
// Customer or admin: cancel a booking
// ---------------------------------------------------------------------------
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return next(new ErrorResponse('Booking not found', 404));

    const isOwner = booking.customer && booking.customer.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return next(new ErrorResponse('Not authorized', 403));
    }

    const hoursBefore = (new Date(booking.appointmentDate) - new Date()) / (1000 * 60 * 60);
    if (hoursBefore < 24 && !isAdmin) {
      return next(new ErrorResponse('Cannot cancel within 24 hours of appointment', 400));
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      isCancelled: true,
      cancelledBy: isAdmin ? 'admin' : 'customer',
      cancelledAt: new Date(),
      reason: req.body.reason || 'No reason provided',
    };

    await booking.save();
    res.status(200).json({ success: true, message: 'Booking cancelled', data: booking });
  } catch (error) {
    next(error);
  }
};

// ---------------------------------------------------------------------------
// GET /api/bookings/availability
// Public: get available time slots for a date/location/artist
// ---------------------------------------------------------------------------
exports.getAvailability = async (req, res, next) => {
  try {
    const { date, location, artistType } = req.query;

    if (!date || !location || !artistType) {
      return next(new ErrorResponse('Provide date, location, and artistType', 400));
    }

    const allSlots = [];
    for (let hour = 8; hour < 18; hour++) {
      allSlots.push({
        start: `${String(hour).padStart(2, '0')}:00`,
        end: `${String(hour + 1).padStart(2, '0')}:00`,
      });
    }

    const existingBookings = await Booking.find({
      appointmentDate: new Date(date),
      location,
      'artist.type': artistType,
      status: { $in: ['pending', 'confirmed', 'in-progress'] },
    });

    const bookedStarts = existingBookings.map(b => b.timeSlot.start);
    const availableSlots = allSlots.filter(s => !bookedStarts.includes(s.start));
    const bookedSlots = allSlots.filter(s => bookedStarts.includes(s.start));

    res.status(200).json({ success: true, date, location, artistType, availableSlots, bookedSlots });
  } catch (error) {
    next(error);
  }
};