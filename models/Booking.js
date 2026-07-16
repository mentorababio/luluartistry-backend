const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema(
  {
    bookingNumber: {
      type: String,
      unique: true,
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },

    customerInfo: {
      firstName: { type: String, required: true },
      lastName:  { type: String, required: true },
      email:     { type: String, required: true },
      phone:     { type: String, required: true },
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: false,
      default: null,
    },

    serviceSnapshot: {
      name:        { type: String, required: true },
      description: String,
      duration:    { type: Number, default: 120 },
    },

    artist: {
      type: {
        type: String,
        enum: ['lulu', 'senior', 'artist', 'sarah', 'maya'],
        required: true,
      },
      name: String,
    },

    location: {
      type: String,
      enum: ['calabar', 'port-harcourt', 'studio', 'home-service', 'mobile'],
      required: [true, 'Please select a location'],
    },

    appointmentDate: {
      type: Date,
      required: [true, 'Please provide appointment date'],
    },

    timeSlot: {
      start: { type: String, required: true },
      end:   { type: String, required: true },
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

    // ── Reschedule Request ────────────────────────────────────────────────────
    // Customer requests a new date/time. Admin approves or rejects.
    rescheduleRequest: {
      requestedDate: { type: Date },
      requestedTime: { type: String },
      reason:        { type: String },
      status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
      },
      requestedAt:  { type: Date },
      respondedAt:  { type: Date },
      adminResponse: { type: String },
    },
    // ─────────────────────────────────────────────────────────────────────────

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

// Pre-save hook: generate bookingNumber as safety net
BookingSchema.pre('save', async function (next) {
  if (this.isNew && !this.bookingNumber) {
    const date  = new Date();
    const year  = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = (await this.constructor.countDocuments()) + 1;
    this.bookingNumber = `BK-${year}${month}-${String(count).padStart(4, '0')}`;
  }
  next();
});

BookingSchema.virtual('isFullyPaid').get(function () {
  return this.payment.depositPaid && this.payment.balancePaid;
});

BookingSchema.virtual('isUpcoming').get(function () {
  return this.appointmentDate > new Date() && this.status === 'confirmed';
});

BookingSchema.index({ customer: 1, appointmentDate: -1 });
BookingSchema.index({ appointmentDate: 1, location: 1, 'artist.type': 1 });
BookingSchema.index({ status: 1, appointmentDate: 1 });
BookingSchema.index({ 'customerInfo.phone': 1 });
BookingSchema.index({ bookingNumber: 1 });

module.exports = mongoose.model('Booking', BookingSchema);