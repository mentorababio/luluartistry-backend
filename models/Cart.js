const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true // Allows null for guest carts
  },
  sessionId: {
    type: String,
    sparse: true // For guest users
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    variant: {
      name: String,
      value: String
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true // Price at time of adding to cart
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  appliedCoupon: {
    code: String,
    discountAmount: Number,
    discountPercentage: Number
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  abandonmentEmailSent: {
    type: Boolean,
    default: false
  },
  abandonmentEmailSentAt: Date,
  secondReminderSent: {
    type: Boolean,
    default: false
  },
  secondReminderSentAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Update lastUpdated timestamp before save
CartSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Virtual for subtotal
CartSchema.virtual('subtotal').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
});

// Virtual for total items count
CartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => {
    return total + item.quantity;
  }, 0);
});

// Virtual for total after discount
CartSchema.virtual('total').get(function() {
  let total = this.subtotal;
  if (this.appliedCoupon && this.appliedCoupon.discountAmount) {
    total -= this.appliedCoupon.discountAmount;
  }
  return Math.max(total, 0); // Ensure total is never negative
});

// Virtual for checking if cart is abandoned
CartSchema.virtual('isAbandoned').get(function() {
  const hoursSinceUpdate = (Date.now() - this.lastUpdated.getTime()) / (1000 * 60 * 60);
  return hoursSinceUpdate >= parseInt(process.env.CART_ABANDONMENT_HOURS || 24) && this.items.length > 0;
});

// Index for efficient queries
// Note: Compound indexes are more efficient than single field indexes
CartSchema.index({ lastUpdated: 1 });
CartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-deletion

// Compound indexes for common queries
CartSchema.index({ user: 1, lastUpdated: -1 }); // For retrieving user's cart
CartSchema.index({ sessionId: 1, lastUpdated: -1 }); // For guest carts
CartSchema.index({ lastUpdated: 1, abandonmentEmailSent: 1 }); // For abandoned cart queries

module.exports = mongoose.model('Cart', CartSchema);