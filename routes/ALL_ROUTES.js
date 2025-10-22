// ============================================
// COPY EACH SECTION INTO SEPARATE FILES
// ============================================

// ========== routes/categoryRoutes.js ==========
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Import controller (you'll create this)
// const { getCategories, getCategory, createCategory, updateCategory, deleteCategory } = require('../controllers/categoryController');

router.route('/').get(getCategories).post(protect, authorize('admin'), createCategory);
router.route('/:id').get(getCategory).put(protect, authorize('admin'), updateCategory).delete(protect, authorize('admin'), deleteCategory);

module.exports = router;

// ========== routes/serviceRoutes.js ==========
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// const { getServices, getService, getServicesByCategory, createService, updateService, deleteService } = require('../controllers/serviceController');

router.route('/').get(getServices).post(protect, authorize('admin'), createService);
router.get('/category/:category', getServicesByCategory);
router.route('/:id').get(getService).put(protect, authorize('admin'), updateService).delete(protect, authorize('admin'), deleteService);

module.exports = router;

// ========== routes/courseRoutes.js ==========
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// const { getCourses, getCourse, getCoursesByCategory, createCourse, updateCourse, deleteCourse } = require('../controllers/courseController');

router.route('/').get(getCourses).post(protect, authorize('admin'), createCourse);
router.get('/category/:category', getCoursesByCategory);
router.route('/:id').get(getCourse).put(protect, authorize('admin'), updateCourse).delete(protect, authorize('admin'), deleteCourse);

module.exports = router;

// ========== routes/enrollmentRoutes.js ==========
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// const { createEnrollment, getEnrollments, getEnrollment, updateEnrollmentStatus, getAllEnrollments, issueCertificate } = require('../controllers/enrollmentController');

router.route('/').get(protect, getEnrollments).post(protect, createEnrollment);
router.get('/admin/all', protect, authorize('admin'), getAllEnrollments);
router.get('/:id', protect, getEnrollment);
router.put('/:id/status', protect, authorize('admin'), updateEnrollmentStatus);
router.post('/:id/certificate', protect, authorize('admin'), issueCertificate);

module.exports = router;

// ========== routes/reviewRoutes.js ==========
const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

// const { getReviews, createReview, updateReview, deleteReview, markHelpful } = require('../controllers/reviewController');

router.get('/product/:productId', getReviews);
router.get('/service/:serviceId', getReviews);
router.get('/course/:courseId', getReviews);
router.post('/', protect, createReview);
router.route('/:id').put(protect, updateReview).delete(protect, deleteReview);
router.post('/:id/helpful', protect, markHelpful);

module.exports = router;

// ========== routes/wishlistRoutes.js ==========
const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

// const { getWishlist, addToWishlist, removeFromWishlist } = require('../controllers/wishlistController');

router.get('/', protect, getWishlist);
router.post('/add', protect, addToWishlist);
router.delete('/remove/:productId', protect, removeFromWishlist);

module.exports = router;

// ========== routes/couponRoutes.js ==========
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// const { getCoupons, getCoupon, createCoupon, updateCoupon, deleteCoupon, validateCoupon } = require('../controllers/couponController');

router.post('/validate', validateCoupon);
router.route('/').get(protect, authorize('admin'), getCoupons).post(protect, authorize('admin'), createCoupon);
router.route('/:id').get(protect, authorize('admin'), getCoupon).put(protect, authorize('admin'), updateCoupon).delete(protect, authorize('admin'), deleteCoupon);

module.exports = router;

// ========== routes/uploadRoutes.js ==========
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const router = express.Router();

// const { uploadImage, uploadMultipleImages, deleteImage } = require('../controllers/uploadController');

router.post('/image', protect, authorize('admin'), upload.single('image'), uploadImage);
router.post('/images', protect, authorize('admin'), upload.array('images', 5), uploadMultipleImages);
router.delete('/image/:publicId', protect, authorize('admin'), deleteImage);

module.exports = router;

// ========== routes/adminRoutes.js ==========
const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// const { getDashboardStats, getOrderStats, getRevenueStats, getCustomers, updateUserRole } = require('../controllers/adminController');

router.use(protect, authorize('admin')); // All routes require admin

router.get('/dashboard', getDashboardStats);
router.get('/orders/stats', getOrderStats);
router.get('/revenue', getRevenueStats);
router.get('/customers', getCustomers);
router.put('/customers/:id/role', updateUserRole);

module.exports = router;