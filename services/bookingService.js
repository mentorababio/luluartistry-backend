/**
 * bookingService.js
 * -----------------
 * Single source of truth for all booking creation logic.
 * Called by both POST /api/bookings (auth) and POST /api/bookings/guest (public).
 *
 * WHY: Eliminates duplicated validation, pricing, and conflict-check logic
 * across two controllers. Any bug fix or feature change happens in one place.
 */

const Booking = require('../models/Booking');
const Service = require('../models/Service');
const sendEmail = require('../utils/sendEmail');
const { bookingConfirmationEmail } = require('../utils/emailTemplates');

// ---------------------------------------------------------------------------
// Service duration map (minutes)
// Used to calculate timeSlot.end from timeSlot.start + service duration
// ---------------------------------------------------------------------------
const SERVICE_DURATIONS = {
  'classic set':                90,   // 1.5h
  'hybrid set':                120,   // 2h
  'volume set':                150,   // 2.5h
  'megavolume set':            180,   // 3h
  'mega volume set':           180,
  'ombré powder brows':        180,
  'ombre powder brows':        180,
  'signature combo brows':     180,
  'microshading':              150,
  'brow lamination & tint':     60,   // 1h
  'brow lamination':            60,
  'brow touch-up (all types)':  60,
  'brow touch-up':              60,
};

/**
 * Calculate end time from a start time string and duration in minutes.
 * @param {string} start - "HH:MM" (24-hour)
 * @param {number} durationMinutes
 * @returns {string} end time "HH:MM"
 */
function calculateEndTime(start, durationMinutes) {
  const [h, m] = start.split(':').map(Number);
  const totalMinutes = h * 60 + m + durationMinutes;
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

/**
 * Resolve service duration from service name.
 * Falls back to 120 minutes (2h) if not found.
 */
function resolveDuration(serviceName) {
  if (!serviceName) return 120;
  const key = serviceName.trim().toLowerCase();
  return SERVICE_DURATIONS[key] || 120;
}

/**
 * Generate a unique booking number.
 * Format: BK-YYYYMM-XXXX (e.g. BK-202607-0042)
 * Done here instead of the pre-save hook so errors are caught explicitly.
 */
async function generateBookingNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const count = (await Booking.countDocuments()) + 1;
  return `BK-${year}${month}-${String(count).padStart(4, '0')}`;
}

/**
 * Validate required guest customer fields.
 * Returns an error string or null if valid.
 */
function validateCustomerInfo(customerInfo) {
  if (!customerInfo) return 'customerInfo is required';
  const { firstName, email, phone } = customerInfo;
  if (!firstName || !firstName.trim()) return 'customerInfo.firstName is required';
  if (!email || !email.trim()) return 'customerInfo.email is required';
  if (!phone || !phone.trim()) return 'customerInfo.phone is required';
  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'customerInfo.email is invalid';
  return null;
}

/**
 * Core booking creation service.
 *
 * @param {object} data - Booking payload from the request body
 * @param {object|null} user - Authenticated user (req.user) or null for guests
 * @returns {object} { booking } on success
 * @throws {Error} with .statusCode and .message on failure
 */
async function createBookingService(data, user = null) {
  const {
    service: serviceInput,
    artist,
    location,
    appointmentDate,
    timeSlot,
    notes,
    customerInfo,
    pricing: frontendPricing,
    payment: frontendPayment,
  } = data;

  const isGuest = !user;

  // -------------------------------------------------------------------------
  // 1. Validate customer info
  // -------------------------------------------------------------------------
  let resolvedCustomerInfo;

  if (isGuest) {
    const err = validateCustomerInfo(customerInfo);
    if (err) {
      const e = new Error(err);
      e.statusCode = 400;
      throw e;
    }
    const nameParts = customerInfo.firstName.trim().split(' ');
    resolvedCustomerInfo = {
      firstName: nameParts[0],
      lastName: nameParts.slice(1).join(' ') || nameParts[0],
      email: customerInfo.email.trim().toLowerCase(),
      phone: customerInfo.phone.trim(),
    };
  } else {
    resolvedCustomerInfo = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
    };
  }

  console.log(`[BookingService] Customer resolved:`, resolvedCustomerInfo);

  // -------------------------------------------------------------------------
  // 2. Validate required booking fields
  // -------------------------------------------------------------------------
  if (!artist?.type) {
    const e = new Error('artist.type is required');
    e.statusCode = 400;
    throw e;
  }
  if (!location) {
    const e = new Error('location is required');
    e.statusCode = 400;
    throw e;
  }
  if (!appointmentDate) {
    const e = new Error('appointmentDate is required');
    e.statusCode = 400;
    throw e;
  }
  if (!timeSlot?.start) {
    const e = new Error('timeSlot.start is required');
    e.statusCode = 400;
    throw e;
  }

  // -------------------------------------------------------------------------
  // 3. Resolve service — try MongoDB ID, then name lookup, then snapshot only
  // -------------------------------------------------------------------------
  let serviceDoc = null;
  let serviceId = undefined;
  let serviceSnapshot = {
    name: serviceInput || 'Unknown Service',
    description: '',
    duration: resolveDuration(serviceInput),
  };

  try {
    const mongoose = require('mongoose');
    if (serviceInput && mongoose.Types.ObjectId.isValid(serviceInput)) {
      serviceDoc = await Service.findById(serviceInput);
    }
    if (!serviceDoc && serviceInput) {
      serviceDoc = await Service.findOne({
        name: { $regex: new RegExp(`^${serviceInput.trim()}$`, 'i') },
      });
    }
    if (serviceDoc) {
      serviceId = serviceDoc._id;
      serviceSnapshot = {
        name: serviceDoc.name,
        description: serviceDoc.description || '',
        duration: serviceDoc.duration || resolveDuration(serviceDoc.name),
      };
    }
  } catch (lookupErr) {
    console.warn('[BookingService] Service lookup failed, using snapshot only:', lookupErr.message);
  }

  console.log(`[BookingService] Service resolved: "${serviceSnapshot.name}", duration: ${serviceSnapshot.duration}min`);

  // -------------------------------------------------------------------------
  // 4. Calculate timeSlot.end from start + service duration
  // -------------------------------------------------------------------------
  const endTime = calculateEndTime(timeSlot.start, serviceSnapshot.duration);
  const resolvedTimeSlot = { start: timeSlot.start, end: endTime };

  console.log(`[BookingService] TimeSlot: ${resolvedTimeSlot.start} → ${resolvedTimeSlot.end}`);

  // -------------------------------------------------------------------------
  // 5. Resolve pricing
  // Priority: DB service pricing → frontend-provided pricing → default 0
  // -------------------------------------------------------------------------
  let servicePrice = frontendPricing?.servicePrice || 0;
  let depositAmount = frontendPricing?.depositAmount || Math.round(servicePrice * 0.5);
  let balanceAmount = frontendPricing?.balanceAmount || servicePrice - depositAmount;

  if (serviceDoc?.pricing?.length) {
    const artistPricing = serviceDoc.pricing.find(p => p.artistType === artist.type);
    if (artistPricing) {
      servicePrice = artistPricing.price;
      depositAmount = Math.round(servicePrice * 0.5);
      balanceAmount = servicePrice - depositAmount;
    }
  }

  console.log(`[BookingService] Pricing: service=₦${servicePrice}, deposit=₦${depositAmount}, balance=₦${balanceAmount}`);

  // -------------------------------------------------------------------------
  // 6. Conflict check — prevent double-booking same slot
  // -------------------------------------------------------------------------
  const conflict = await Booking.findOne({
    appointmentDate: new Date(appointmentDate),
    location,
    'artist.type': artist.type,
    'timeSlot.start': resolvedTimeSlot.start,
    status: { $in: ['pending', 'confirmed', 'in-progress'] },
  });

  if (conflict) {
    console.warn(`[BookingService] Conflict detected: ${conflict.bookingNumber}`);
    const e = new Error('This time slot is already booked. Please choose a different time.');
    e.statusCode = 409;
    throw e;
  }

  console.log('[BookingService] No conflicts found. Creating booking...');

  // -------------------------------------------------------------------------
  // 7. Resolve payment method
  // -------------------------------------------------------------------------
  const VALID_PAYMENT_METHODS = ['paystack', 'cash', 'transfer'];
  const rawMethod = frontendPayment?.paymentMethod;
  const resolvedPaymentMethod = VALID_PAYMENT_METHODS.includes(rawMethod) ? rawMethod : undefined;

  // -------------------------------------------------------------------------
  // 8. Generate booking number
  // -------------------------------------------------------------------------
  const bookingNumber = await generateBookingNumber();

  // -------------------------------------------------------------------------
  // 9. Create booking document
  // -------------------------------------------------------------------------
  const bookingPayload = {
    bookingNumber,
    customerInfo: resolvedCustomerInfo,
    ...(serviceId ? { service: serviceId } : {}),
    ...(isGuest ? {} : { customer: user.id }),
    serviceSnapshot,
    artist,
    location,
    appointmentDate: new Date(appointmentDate),
    timeSlot: resolvedTimeSlot,
    pricing: { servicePrice, depositAmount, balanceAmount },
    payment: {
      depositPaid: frontendPayment?.depositPaid || false,
      balancePaid: frontendPayment?.balancePaid || false,
      ...(resolvedPaymentMethod ? { paymentMethod: resolvedPaymentMethod } : {}),
    },
    notes: { customerNotes: notes || '' },
    status: 'pending',
  };

  console.log(`[BookingService] Saving booking: ${bookingNumber}`);

  const booking = await Booking.create(bookingPayload);

  console.log(`[BookingService] ✅ Booking saved: ${booking.bookingNumber} (${booking._id})`);

  // -------------------------------------------------------------------------
  // 10. Send confirmation email (non-blocking — never fail the booking)
  // -------------------------------------------------------------------------
  const emailRecipient = resolvedCustomerInfo.email;
  setImmediate(async () => {
    try {
      await sendEmail({
        email: emailRecipient,
        subject: 'Booking Confirmed - Lulu Artistry',
        html: bookingConfirmationEmail(booking),
      });
      console.log(`[BookingService] Confirmation email sent to ${emailRecipient}`);
    } catch (emailErr) {
      console.error(`[BookingService] Email failed (non-fatal):`, emailErr.message);
    }
  });

  return { booking };
}

module.exports = { createBookingService };