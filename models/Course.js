const mongoose = require('mongoose');
const slugify = require('slugify');

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide course title'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug: {
    type: String,
    unique: true
  },
  category: {
    type: String,
    enum: ['brow', 'lash', 'combo', 'lamination'],
    required: [true, 'Please specify course category']
  },
  type: {
    type: String,
    enum: ['private', 'group'],
    required: [true, 'Please specify course type']
  },
  description: {
    type: String,
    required: [true, 'Please provide course description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  curriculum: [{
    title: String,
    topics: [String],
    duration: String // e.g., "Day 1", "2 hours"
  }],
  price: {
    type: Number,
    required: [true, 'Please provide course price'],
    min: [0, 'Price cannot be negative']
  },
  duration: {
    type: String,
    required: [true, 'Please specify course duration'] // e.g., "3 days", "1 week"
  },
  durationInDays: {
    type: Number,
    required: true
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all-levels'],
    default: 'beginner'
  },
  maxStudents: {
    type: Number,
    required: [true, 'Please specify maximum students'],
    min: [1, 'Must allow at least 1 student']
  },
  features: [{
    type: String // e.g., "Certification", "Training kit", "Lifetime support"
  }],
  requirements: [{
    type: String // Prerequisites
  }],
  whatYouWillLearn: [{
    type: String
  }],
  images: [{
    url: String,
    publicId: String,
    alt: String
  }],
  instructor: {
    name: {
      type: String,
      default: 'Lulu'
    },
    bio: String,
    image: String
  },
  location: {
    type: String,
    enum: ['calabar', 'port-harcourt', 'both'],
    default: 'both'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  totalEnrollments: {
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
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    metaKeywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create slug before saving
CourseSchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

// Virtual for available spots
CourseSchema.virtual('availableSpots').get(function() {
  return this.maxStudents - this.totalEnrollments;
});

// Virtual for checking if course is full
CourseSchema.virtual('isFull').get(function() {
  return this.totalEnrollments >= this.maxStudents;
});

// Virtual populate enrollments
CourseSchema.virtual('enrollments', {
  ref: 'Enrollment',
  localField: '_id',
  foreignField: 'course',
  justOne: false
});

// Index for search
CourseSchema.index({ title: 'text', description: 'text' });
CourseSchema.index({ category: 1, type: 1, isActive: 1 });
CourseSchema.index({ price: 1 });

module.exports = mongoose.model('Course', CourseSchema);