const mongoose = require('mongoose');

const CouponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Please provide coupon code'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [20, 'Coupon code cannot exceed 20 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: [true, 'Please specify discount type']
  },
  discountValue: {
    type: Number,
    required: [true, 'Please provide discount value'],
    min: [0, 'Discount value cannot be negative']
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: [0, 'Minimum order amount cannot be negative']
  },
  maximumDiscount: {
    type: Number, // For percentage discounts, cap the maximum discount amount
    min: [0, 'Maximum discount cannot be negative']
  },
  applicableTo: {
    type: String,
    enum: ['all', 'products', 'services', 'courses'],
    default: 'all'
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date']
  },
  usageLimit: {
    total: {
      type: Number,
      default: null // null means unlimited
    },
    perUser: {
      type: Number,
      default: 1
    }
  },
  usageCount: {
    type: Number,
    default: 0
  },
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    usedAt: Date,
    orderNumber: String
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for checking if coupon is valid
CouponSchema.virtual('isValid').get(function() {
  const now = new Date();
  const isDateValid = now >= this.startDate && now <= this.endDate;
  const isUsageValid = !this.usageLimit.total || this.usageCount < this.usageLimit.total;
  return this.isActive && isDateValid && isUsageValid;
});

// Virtual for remaining uses
CouponSchema.virtual('remainingUses').get(function() {
  if (!this.usageLimit.total) return 'Unlimited';
  return Math.max(0, this.usageLimit.total - this.usageCount);
});

// Method to calculate discount
CouponSchema.methods.calculateDiscount = function(orderAmount) {
  if (orderAmount < this.minimumOrderAmount) {
    return 0;
  }

  let discount = 0;
  if (this.discountType === 'percentage') {
    discount = (orderAmount * this.discountValue) / 100;
    if (this.maximumDiscount && discount > this.maximumDiscount) {
      discount = this.maximumDiscount;
    }
  } else if (this.discountType === 'fixed') {
    discount = Math.min(this.discountValue, orderAmount);
  }

  return Math.round(discount);
};

// Method to check if user can use coupon
CouponSchema.methods.canUserUse = function(userId) {
  const userUsageCount = this.usedBy.filter(
    use => use.user.toString() === userId.toString()
  ).length;
  
  return userUsageCount < this.usageLimit.perUser;
};

// Index for efficient queries
CouponSchema.index({ code: 1 });
CouponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Coupon', CouponSchema);