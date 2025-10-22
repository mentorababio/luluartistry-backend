const mongoose = require('mongoose');

const EnrollmentSchema = new mongoose.Schema({
  enrollmentNumber: {
    type: String,
    unique: true,
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    address: String
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Please select a course']
  },
  courseSnapshot: {
    title: String,
    category: String,
    type: String,
    price: Number,
    duration: String
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide course start date']
  },
  location: {
    type: String,
    enum: ['calabar', 'port-harcourt'],
    required: [true, 'Please select a location']
  },
  payment: {
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'partial', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['paystack', 'transfer', 'cash']
    },
    paymentId: String,
    paidAt: Date,
    installments: [{
      amount: Number,
      paidAt: Date,
      paymentId: String
    }]
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'on-hold'],
    default: 'pending'
  },
  progress: {
    completedDays: {
      type: Number,
      default: 0
    },
    attendance: [{
      date: Date,
      present: Boolean,
      notes: String
    }],
    practiceHours: {
      type: Number,
      default: 0
    }
  },
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    certificateNumber: String,
    issuedDate: Date,
    certificateUrl: String
  },
  notes: {
    studentNotes: String, // Student's questions/comments
    instructorNotes: String // Instructor feedback
  },
  completedAt: Date,
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

// Generate enrollment number before saving
EnrollmentSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const count = await this.constructor.countDocuments() + 1;
    this.enrollmentNumber = `ENR-${year}-${String(count).padStart(5, '0')}`;
  }
  next();
});

// Virtual for completion percentage
EnrollmentSchema.virtual('completionPercentage').get(function() {
  if (this.courseSnapshot && this.courseSnapshot.duration) {
    const totalDays = parseInt(this.courseSnapshot.duration) || 1;
    return Math.min(Math.round((this.progress.completedDays / totalDays) * 100), 100);
  }
  return 0;
});

// Virtual for checking if eligible for certificate
EnrollmentSchema.virtual('eligibleForCertificate').get(function() {
  return this.status === 'completed' && this.completionPercentage >= 80;
});

// Index for efficient queries
EnrollmentSchema.index({ student: 1, createdAt: -1 });
EnrollmentSchema.index({ course: 1, startDate: 1 });
EnrollmentSchema.index({ status: 1, startDate: 1 });
EnrollmentSchema.index({ enrollmentNumber: 1 });

// Update course total enrollments after save
EnrollmentSchema.post('save', async function() {
  const Course = mongoose.model('Course');
  const activeEnrollments = await this.constructor.countDocuments({
    course: this.course,
    status: { $in: ['pending', 'active'] }
  });
  await Course.findByIdAndUpdate(this.course, { totalEnrollments: activeEnrollments });
});

module.exports = mongoose.model('Enrollment', EnrollmentSchema);