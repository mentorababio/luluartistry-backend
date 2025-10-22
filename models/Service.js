const mongoose = require('mongoose');
const slugify = require('slugify');

const ServiceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide service name'],
    trim: true
  },
  slug: {
    type: String,
    unique: true
  },
  category: {
    type: String,
    enum: ['brows', 'lashes', 'signature'],
    required: [true, 'Please specify service category']
  },
  description: {
    type: String,
    required: [true, 'Please provide service description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  benefits: [{
    type: String // e.g., "Lasts 2+ years", "Perfect for oily skin"
  }],
  pricing: [{
    artistType: {
      type: String,
      enum: ['lulu', 'senior', 'artist'],
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    }
  }],
  duration: {
    type: Number, // Duration in minutes
    required: [true, 'Please specify service duration'],
    min: [15, 'Duration must be at least 15 minutes']
  },
  image: {
    url: String,
    publicId: String,
    alt: String
  },
  requirements: [{
    type: String // e.g., "Come with clean face", "No makeup"
  }],
  aftercare: [{
    type: String // Post-service instructions
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug before saving
ServiceSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Virtual for price range

ServiceSchema.virtual('priceRange').get(function() {
  if (this.pricing && this.pricing.length > 0) {
    const prices = this.pricing.map(p => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `₦${min.toLocaleString()}` : `₦${min.toLocaleString()} - ₦${max.toLocaleString()}`;
  }
  return 'Price not available';
});

// Index for search
ServiceSchema.index({ name: 'text', description: 'text' });
ServiceSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Service', ServiceSchema);