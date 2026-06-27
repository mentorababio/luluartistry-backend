const mongoose = require('mongoose');
const slugify = require('slugify');

const VariantSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['Length', 'Color', 'Volume', 'Curl', 'Size', 'Weight', 'Other']
  },
  value: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  priceAdjustment: {
    type: Number,
    default: 0
  }
}, { _id: true });

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
    maxlength: [200, 'Name cannot be more than 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    sparse: true
  },
  description: {
    type: String,
    required: [false, 'Please provide product description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },

  // Pricing
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: [0, 'Price cannot be negative']
  },
  comparePrice: {
    type: Number,
    min: [0, 'Compare price cannot be negative']
  },

  // Category & Organization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide product category']
  },
  subcategory: String,
  tags: [{
    type: String,
    trim: true
  }],

  // Product Images
  images: [{
    url: { type: String, required: true },
    publicId: String,
    alt: String
  }],

  // Variants
  variants: [VariantSchema],

  // Stock Management
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    default: 5
  },

  // Product Details
  specifications: [{
    key: String,
    value: String
  }],

  // SEO
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
  },

  // Status & Visibility
  isFeatured: {
    type: Boolean,
    default: false,
    index: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  // ── NEW: New Arrival flag ─────────────────────────────────────────────────
  // Any product from any category can be marked as a new arrival.
  // Admin toggles this from the products page.
  isNewArrival: {
    type: Boolean,
    default: false,
    index: true
  },
  // ─────────────────────────────────────────────────────────────────────────

  // Reviews & Ratings
  averageRating: {
    type: Number,
    min: [0, 'Rating must be at least 0'],
    max: [5, 'Rating cannot be more than 5'],
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },

  // Analytics
  totalSales: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// ── Pre-save hooks ────────────────────────────────────────────────────────────
ProductSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  next();
});

ProductSchema.pre('save', function(next) {
  if (this.variants && this.variants.length > 0) {
    this.stock = this.variants.reduce((total, variant) => total + variant.stock, 0);
  }
  next();
});

// ── Virtuals ──────────────────────────────────────────────────────────────────
ProductSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

ProductSchema.virtual('isLowStock').get(function() {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

ProductSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false
});

// ── Indexes ───────────────────────────────────────────────────────────────────
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ isNewArrival: 1, isActive: 1 });
ProductSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);