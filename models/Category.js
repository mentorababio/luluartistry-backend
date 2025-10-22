const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide category name'],
    unique: true,
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  image: {
    url: String,
    publicId: String,
    alt: String
  },
  icon: {
    type: String, // For icon class names (e.g., 'fa-eye', 'fa-hand')
    default: 'fa-tag'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  displayOrder: {
    type: Number,
    default: 0 // For controlling category display order
  },
  productCount: {
    type: Number,
    default: 0
  },
  seo: {
    metaTitle: String,
    metaDescription: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug before saving
CategorySchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Virtual populate products
CategorySchema.virtual('products', {
  ref: 'Product',
  localField: '_id',
  foreignField: 'category',
  justOne: false
});

// Update product count after save
CategorySchema.post('save', async function() {
  const Product = mongoose.model('Product');
  this.productCount = await Product.countDocuments({ category: this._id, isActive: true });
  await this.constructor.findByIdAndUpdate(this._id, { productCount: this.productCount });
});

module.exports = mongoose.model('Category', CategorySchema);