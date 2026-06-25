/**
 * models/Booking.js
 * -----------------
 * Changes from original:
 * - customer: required → false (supports guest bookings)
 * - service: required → false (supports name-only bookings when ID not in DB)
 * - location enum expanded to include studio/home/mobile (frontend values)
 * - payment.paymentMethod: no longer required, undefined allowed
 * - bookingNumber pre-save hook kept as safety net but service generates it explicitly
 */

const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      required: true,
    },

    // Null for guest bookings
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },

    customerInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email:     { type: String, required: true },
      phone:     { type: String, required: true },
    },

    // Optional — may not exist in DB if service was added from frontend only
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: false,
      default: null,
    },

    serviceSnapshot: {
      name:        { type: String, required: true },
      description: String,
      duration:    { type: Number, default: 120 }, // minutes
    },

    artist: {
      type: {
        type: String,
        enum: ['lulu', 'senior', 'artist'],
        required: true,
      },
      name: String,
    },

    // Expanded to include frontend location values
    location: {
      type: String,
      enum: ['calabar', 'port-harcourt', 'studio', 'home', 'mobile'],
      required: [true, 'Please select a location'],
    },

    appointmentDate: {
      type: Date,
      required: [true, 'Please provide appointment date'],
    },

    timeSlot: {
      start: { type: String, required: true }, // "HH:MM" 24-hour
      end:   { type: String, required: true }, // calculated by service
    },

    pricing: {
      servicePrice:  { type: Number, required: true, default: 0 },
      depositAmount: { type: Number, required: true, default: 0 },
      balanceAmount: { type: Number, required: true, default: 0 },
    },

    payment: {
      depositPaid:      { type: Boolean, default: false },
      depositPaymentId: String,
      depositPaidAt:    Date,
      balancePaid:      { type: Boolean, default: false },
      balancePaymentId: String,
      balancePaidAt:    Date,
      // Not required — guest bookings may not have payment method yet
      paymentMethod: {
        type: String,
        enum: ['paystack', 'cash', 'transfer'],
        required: false,
      },
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
      default: 'pending',
    },

    notes: {
      customerNotes: String,
      adminNotes:    String,
    },

    cancellation: {
      isCancelled:  { type: Boolean, default: false },
      cancelledBy:  { type: String, enum: ['customer', 'admin'] },
      cancelledAt:  Date,
      reason:       String,
      refundAmount: Number,
      refundStatus: { type: String, enum: ['pending', 'processed', 'rejected'] },
    },

    reminder: {
      emailSent:   { type: Boolean, default: false },
      emailSentAt: Date,
      smsSent:     { type: Boolean, default: false },
      smsSentAt:   Date,
    },

    rating: {
      score:   { type: Number, min: 1, max: 5 },
      comment: String,
      ratedAt: Date,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Pre-save hook: generate bookingNumber as a safety net
// The service generates it explicitly; this only runs if somehow missed.
// ---------------------------------------------------------------------------
BookingSchema.pre('save', async function (next) {
  if (this.isNew && !this.bookingNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = (await this.constructor.countDocuments()) + 1;
    this.bookingNumber = `BK-${year}${month}-${String(count).padStart(4, '0')}`;
  }
  next();
});

// ---------------------------------------------------------------------------
// Virtuals
// ---------------------------------------------------------------------------
BookingSchema.virtual('isFullyPaid').get(function () {
  return this.payment.depositPaid && this.payment.balancePaid;
});

BookingSchema.virtual('isUpcoming').get(function () {
  return this.appointmentDate > new Date() && this.status === 'confirmed';
});

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
BookingSchema.index({ customer: 1, appointmentDate: -1 });
BookingSchema.index({ appointmentDate: 1, location: 1, 'artist.type': 1 });
BookingSchema.index({ status: 1, appointmentDate: 1 });

module.exports = mongoose.model('Booking', BookingSchema);