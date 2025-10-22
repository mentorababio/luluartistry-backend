const Booking = require('../models/Booking');
const Service = require('../models/Service');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const { bookingConfirmationEmail } = require('../utils/emailTemplates');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res, next) => {
  try {
    const {
      service,
      artist,
      location,
      appointmentDate,
      timeSlot,
      notes
    } = req.body;

    // Get service details
    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return next(new ErrorResponse('Service not found', 404));
    }

    // Find artist pricing
    const artistPricing = serviceDoc.pricing.find(p => p.artistType === artist.type);
    if (!artistPricing) {
      return next(new ErrorResponse('Invalid artist type for this service', 400));
    }

    const servicePrice = artistPricing.price;
    const depositAmount = Math.round(servicePrice * 0.5); // 50% deposit
    const balanceAmount = servicePrice - depositAmount;

    // Check for conflicting bookings
    const conflict = await Booking.findOne({
      appointmentDate: new Date(appointmentDate),
      location,
      'artist.type': artist.type,
      'timeSlot.start': timeSlot.start,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (conflict) {
      return next(new ErrorResponse('This time slot is already booked', 400));
    }

    // Create booking
    const booking = await Booking.create({
      customer: req.user.id,
      customerInfo: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phone
      },
      service,
      serviceSnapshot: {
        name: serviceDoc.name,
        description: serviceDoc.description,
        duration: serviceDoc.duration
      },
      artist,
      location,
      appointmentDate,
      timeSlot,
      pricing: {
        servicePrice,
        depositAmount,
        balanceAmount
      },
      notes: {
        customerNotes: notes
      }
    });

    // Send confirmation email
    try {
      await sendEmail({
        email: req.user.email,
        subject: 'Booking Confirmed - Lulu Artistry',
        html: bookingConfirmationEmail(booking)
      });
    } catch (err) {
      console.error('Booking confirmation email failed:', err.message);
    }

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user bookings
// @route   GET /api/bookings
// @access  Private
exports.getBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ customer: req.user.id })
      .populate('service', 'name category')
      .sort('-appointmentDate');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.find({ customer: req.user.id })
      .populate('service', 'name category')
      .sort('-appointmentDate');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
exports.getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service', 'name category description');

    if (!booking) {
      return next(new ErrorResponse('Booking not found', 404));
    }

    // Check authorization
    if (booking.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized', 403));
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/Admin
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new ErrorResponse('Booking not found', 404));
    }

    booking.status = status;
    
    if (note) {
      booking.notes.adminNotes = note;
    }

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return next(new ErrorResponse('Booking not found', 404));
    }

    // Check authorization
    if (booking.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized', 403));
    }

    // Check if can cancel (at least 24 hours before appointment)
    const hoursBefore = (new Date(booking.appointmentDate) - new Date()) / (1000 * 60 * 60);
    if (hoursBefore < 24 && req.user.role !== 'admin') {
      return next(new ErrorResponse('Cannot cancel within 24 hours of appointment', 400));
    }

    booking.status = 'cancelled';
    booking.cancellation = {
      isCancelled: true,
      cancelledBy: req.user.role === 'admin' ? 'admin' : 'customer',
      cancelledAt: new Date(),
      reason: req.body.reason
    };

    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get available time slots
// @route   GET /api/bookings/availability
// @access  Public
exports.getAvailability = async (req, res, next) => {
  try {
    const { date, location, artistType } = req.query;

    if (!date || !location || !artistType) {
      return next(new ErrorResponse('Please provide date, location, and artist type', 400));
    }

    // Studio hours: 8 AM to 6 PM
    const studioHours = {
      start: 8,
      end: 18
    };

    // Generate all possible time slots (1-hour intervals)
    const allSlots = [];
    for (let hour = studioHours.start; hour < studioHours.end; hour++) {
      allSlots.push({
        start: `${hour.toString().padStart(2, '0')}:00`,
        end: `${(hour + 1).toString().padStart(2, '0')}:00`
      });
    }

    // Get existing bookings for that date/location/artist
    const existingBookings = await Booking.find({
      appointmentDate: new Date(date),
      location,
      'artist.type': artistType,
      status: { $in: ['pending', 'confirmed', 'in-progress'] }
    });

    // Filter out booked slots
    const bookedSlots = existingBookings.map(b => b.timeSlot.start);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot.start));

    res.status(200).json({
      success: true,
      date,
      location,
      artistType,
      availableSlots,
      bookedSlots: allSlots.filter(slot => bookedSlots.includes(slot.start))
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Admin)
// @route   GET /api/bookings/admin/all
// @access  Private/Admin
exports.getAllBookings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.location) {
      query.location = req.query.location;
    }
    if (req.query.date) {
      query.appointmentDate = new Date(req.query.date);
    }

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('customer', 'firstName lastName email phone')
      .populate('service', 'name category')
      .sort('appointmentDate')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};