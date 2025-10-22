const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  customerInfo: {
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    }
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productSnapshot: {
      name: String,
      image: String,
      price: Number
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
      required: true
    },
    subtotal: {
      type: Number,
      required: true
    }
  }],
  shippingAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    landmark: String
  },
  deliveryZone: {
    zone: {
      type: String,
      required: true
    },
    cost: {
      type: Number,
      required: true
    }
  },
  pricing: {
    subtotal: {
      type: Number,
      required: true
    },
    shippingCost: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  coupon: {
    code: String,
    discountAmount: Number
  },
  payment: {
    method: {
      type: String,
      enum: ['paystack', 'transfer', 'cash-on-delivery'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    paymentId: String,
    paidAt: Date,
    paystackReference: String
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    updatedAt: {
      type: Date,
      default: Date.now
    },
    note: String
  }],
  tracking: {
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date
  },
  notes: {
    customerNote: String,
    adminNote: String
  },
  isGift: {
    type: Boolean,
    default: false
  },
  giftMessage: String,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, {
  timestamps: true
});

// Generate order number before saving
OrderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const count = await this.constructor.countDocuments() + 1;
    this.orderNumber = `ORD-${year}${month}${day}-${String(count).padStart(4, '0')}`;
  }
  next();
});

// Add status to history before updating
OrderSchema.pre('save', function(next) {
  if (this.isModified('orderStatus') && !this.isNew) {
    this.statusHistory.push({
      status: this.orderStatus,
      updatedAt: new Date()
    });
  }
  next();
});

// Update product sales count after order
OrderSchema.post('save', async function() {
  if (this.payment.status === 'paid' && this.isModified('payment.status')) {
    const Product = mongoose.model('Product');
    
    for (const item of this.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 
          totalSales: item.quantity,
          stock: -item.quantity
        }
      });
    }
  }
});

// Index for efficient queries
OrderSchema.index({ user: 1, createdAt: -1 });
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ orderStatus: 1, createdAt: -1 });
OrderSchema.index({ 'payment.status': 1 });

module.exports = mongoose.model('Order', OrderSchema);