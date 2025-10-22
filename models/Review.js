const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  images: [{
    url: String,
    publicId: String
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  adminResponse: {
    comment: String,
    respondedAt: Date
  },
  isApproved: {
    type: Boolean,
    default: true // Auto-approve by default, can be changed for moderation
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Only one review per user per product/service/course
ReviewSchema.index({ user: 1, product: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ user: 1, service: 1 }, { unique: true, sparse: true });
ReviewSchema.index({ user: 1, course: 1 }, { unique: true, sparse: true });

// Update parent model's rating after save/update/delete
ReviewSchema.statics.calculateAverageRating = async function(modelName, modelId) {
  const obj = await this.aggregate([
    {
      $match: { [modelName.toLowerCase()]: modelId, isApproved: true }
    },
    {
      $group: {
        _id: `$${modelName.toLowerCase()}`,
        averageRating: { $avg: '$rating' },
        numOfReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    const Model = mongoose.model(modelName);
    await Model.findByIdAndUpdate(modelId, {
      averageRating: obj[0]?.averageRating || 0,
      numOfReviews: obj[0]?.numOfReviews || 0
    });
  } catch (err) {
    console.error('Error updating average rating:', err);
  }
};

// Calculate average rating after save
ReviewSchema.post('save', function() {
  if (this.product) {
    this.constructor.calculateAverageRating('Product', this.product);
  }
  if (this.service) {
    this.constructor.calculateAverageRating('Service', this.service);
  }
  if (this.course) {
    this.constructor.calculateAverageRating('Course', this.course);
  }
});

// Calculate average rating before remove
ReviewSchema.pre('remove', function(next) {
  if (this.product) {
    this.constructor.calculateAverageRating('Product', this.product);
  }
  if (this.service) {
    this.constructor.calculateAverageRating('Service', this.service);
  }
  if (this.course) {
    this.constructor.calculateAverageRating('Course', this.course);
  }
  next();
});

module.exports = mongoose.model('Review', ReviewSchema);