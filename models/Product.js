const mongoose = require('mongoose');
const slugify = require('slugify');

const VariantSchema = new mongoose.Schema({
  // For products with variants like "Length", "Color", "Volume", "Curl Type", etc.
  type: {
    type: String,
    required: true, // e.g., "Length", "Color", "Volume", "Curl"
    enum: ['Length', 'Color', 'Volume', 'Curl', 'Size', 'Weight', 'Other']
  },
  value: {
    type: String,
    required: true // e.g., "5mm", "Red", "0.07", "J Curl"
  },
  // SKU should be unique per variant
  sku: {
    type: String,
    unique: true,
    sparse: true
  },
  // Stock for this specific variant
  stock: {
    type: Number,
    required: true,
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  // Price adjustment if this variant costs more/less
  priceAdjustment: {
    type: Number,
    default: 0 // Can be positive or negative
  }
}, { _id: true });

const ProductSchema = new mongoose.Schema({
  // Basic Product Info
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
    type: Number, // Original price for showing discounts
    min: [0, 'Compare price cannot be negative']
  },

  // Category & Organization
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please provide product category']
  },
  subcategory: String, // e.g., "Lashes", "Adhesive", "Tools"
  tags: [{
    type: String,
    trim: true
  }],

  // Product Images
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: String,
    alt: String
  }],

  // Variants - For products with variations (Length, Color, Volume, Curl, etc.)
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
    default: 5 // Alert when stock goes below this
  },

  // Product Details & Specifications
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

// ============ PRE-SAVE HOOKS ============

// Create slug before saving
ProductSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Calculate total stock from variants if they exist
ProductSchema.pre('save', function(next) {
  if (this.variants && this.variants.length > 0) {
    // Sum up stock from all variants
    this.stock = this.variants.reduce((total, variant) => total + variant.stock, 0);
  }
  next();
});

// ============ VIRTUALS ============

// Virtual for checking if product is in stock
ProductSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Virtual for checking if low stock
ProductSchema.virtual('isLowStock').get(function() {
  return this.stock > 0 && this.stock <= this.lowStockThreshold;
});

// Virtual for discount percentage
ProductSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

// Virtual populate reviews
ProductSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'product',
  justOne: false
});

// ============ INDEXES ============

// Search indexes
ProductSchema.index({ name: 'text', description: 'text', tags: 'text' });

// Query optimization indexes
ProductSchema.index({ category: 1 });
ProductSchema.index({ price: 1 });
ProductSchema.index({ isFeatured: 1, isActive: 1 });
ProductSchema.index({ createdAt: -1 });
// Note: slug unique index already created by unique: true in schema
// Note: variants.sku unique index already created by unique: true in variant schema

module.exports = mongoose.model('Product', ProductSchema);