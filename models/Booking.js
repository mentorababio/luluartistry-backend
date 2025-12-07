const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  bookingNumber: {
    type: String,
    unique: true,
    required: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Please select a service']
  },
  serviceSnapshot: {
    name: String,
    description: String,
    duration: Number
  },
  artist: {
    type: {
      type: String,
      enum: ['lulu', 'senior', 'artist'],
      required: true
    },
    name: String
  },
  location: {
    type: String,
    enum: ['calabar', 'port-harcourt'],
    required: [true, 'Please select a location']
  },
  appointmentDate: {
    type: Date,
    required: [true, 'Please provide appointment date']
  },
  timeSlot: {
    start: {
      type: String, // e.g., "09:00"
      required: true
    },
    end: {
      type: String, // e.g., "11:00"
      required: true
    }
  },
  pricing: {
    servicePrice: {
      type: Number,
      required: true
    },
    depositAmount: {
      type: Number,
      required: true
    },
    balanceAmount: {
      type: Number,
      required: true
    }
  },
  payment: {
    depositPaid: {
      type: Boolean,
      default: false
    },
    depositPaymentId: String,
    depositPaidAt: Date,
    balancePaid: {
      type: Boolean,
      default: false
    },
    balancePaymentId: String,
    balancePaidAt: Date,
    paymentMethod: {
      type: String,
      enum: ['paystack', 'cash', 'transfer']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
    default: 'pending'
  },
  notes: {
    customerNotes: String, // Customer's special requests
    adminNotes: String // Internal notes for admin
  },
  cancellation: {
    isCancelled: {
      type: Boolean,
      default: false
    },
    cancelledBy: {
      type: String,
      enum: ['customer', 'admin']
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number,
    refundStatus: {
      type: String,
      enum: ['pending', 'processed', 'rejected']
    }
  },
  reminder: {
    emailSent: {
      type: Boolean,
      default: false
    },
    emailSentAt: Date,
    smsSent: {
      type: Boolean,
      default: false
    },
    smsSentAt: Date
  },
  rating: {
    score: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    ratedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate booking number before saving
BookingSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const count = await this.constructor.countDocuments() + 1;
    this.bookingNumber = `BK-${year}${month}-${String(count).padStart(4, '0')}`;
  }
  next();
});

// Virtual for full payment status
BookingSchema.virtual('isFullyPaid').get(function() {
  return this.payment.depositPaid && this.payment.balancePaid;
});

// Virtual for checking if booking is upcoming
BookingSchema.virtual('isUpcoming').get(function() {
  return this.appointmentDate > new Date() && this.status === 'confirmed';
});

// Index for efficient queries
// Note: bookingNumber unique index already created by unique: true in schema
BookingSchema.index({ customer: 1, appointmentDate: -1 });
BookingSchema.index({ appointmentDate: 1, location: 1, 'artist.type': 1 });
BookingSchema.index({ status: 1, appointmentDate: 1 });

module.exports = mongoose.model('Booking', BookingSchema);