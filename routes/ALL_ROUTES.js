// ============================================
// REFERENCE DOCUMENTATION - DO NOT USE DIRECTLY
// This file documents all available routes
// Copy individual route definitions to separate files
// ============================================

/**
 * CATEGORY ROUTES
 * Base URL: /api/categories
 * GET    /api/categories                  - Get all categories
 * GET    /api/categories/:id              - Get category by ID
 * POST   /api/categories                  - Create category (Admin only)
 * PUT    /api/categories/:id              - Update category (Admin only)
 * DELETE /api/categories/:id              - Delete category (Admin only)
 */

/**
 * SERVICE ROUTES
 * Base URL: /api/services
 * GET    /api/services                    - Get all services
 * GET    /api/services/:id                - Get service by ID
 * GET    /api/services/category/:category - Get services by category
 * POST   /api/services                    - Create service (Admin only)
 * PUT    /api/services/:id                - Update service (Admin only)
 * DELETE /api/services/:id                - Delete service (Admin only)
 */

/**
 * COURSE ROUTES
 * Base URL: /api/courses
 * GET    /api/courses                     - Get all courses
 * GET    /api/courses/:id                 - Get course by ID
 * GET    /api/courses/category/:category  - Get courses by category
 * POST   /api/courses                     - Create course (Admin only)
 * PUT    /api/courses/:id                 - Update course (Admin only)
 * DELETE /api/courses/:id                 - Delete course (Admin only)
 */

/**
 * ENROLLMENT ROUTES
 * Base URL: /api/enrollments
 * GET    /api/enrollments                 - Get user enrollments (Authenticated)
 * POST   /api/enrollments                 - Create enrollment (Authenticated)
 * GET    /api/enrollments/admin/all       - Get all enrollments (Admin only)
 * GET    /api/enrollments/:id             - Get enrollment by ID (Authenticated)
 * PUT    /api/enrollments/:id/status      - Update enrollment status (Admin only)
 * POST   /api/enrollments/:id/certificate - Issue certificate (Admin only)
 */

/**
 * REVIEW ROUTES
 * Base URL: /api/reviews
 * GET    /api/reviews/product/:productId  - Get product reviews
 * GET    /api/reviews/service/:serviceId  - Get service reviews
 * GET    /api/reviews/course/:courseId    - Get course reviews
 * POST   /api/reviews                     - Create review (Authenticated)
 * PUT    /api/reviews/:id                 - Update review (Authenticated)
 * DELETE /api/reviews/:id                 - Delete review (Authenticated)
 * POST   /api/reviews/:id/helpful         - Mark review as helpful (Authenticated)
 */

/**
 * WISHLIST ROUTES
 * Base URL: /api/wishlist
 * GET    /api/wishlist                    - Get user wishlist (Authenticated)
 * POST   /api/wishlist/add                - Add to wishlist (Authenticated)
 * DELETE /api/wishlist/remove/:productId  - Remove from wishlist (Authenticated)
 */

/**
 * COUPON ROUTES
 * Base URL: /api/coupons
 * POST   /api/coupons/validate            - Validate coupon (Public)
 * GET    /api/coupons                     - Get all coupons (Admin only)
 * POST   /api/coupons                     - Create coupon (Admin only)
 * GET    /api/coupons/:id                 - Get coupon by ID (Admin only)
 * PUT    /api/coupons/:id                 - Update coupon (Admin only)
 * DELETE /api/coupons/:id                 - Delete coupon (Admin only)
 */

/**
 * UPLOAD ROUTES
 * Base URL: /api/upload
 * POST   /api/upload/image                - Upload single image (Admin only)
 * POST   /api/upload/images               - Upload multiple images (Admin only)
 * DELETE /api/upload/image/:publicId      - Delete image (Admin only)
 */

/**
 * ADMIN ROUTES
 * Base URL: /api/admin
 * All routes require Admin authentication
 * GET    /api/admin/dashboard             - Get dashboard statistics
 * GET    /api/admin/orders/stats          - Get order statistics
 * GET    /api/admin/revenue               - Get revenue statistics
 * GET    /api/admin/customers             - Get all customers
 * PUT    /api/admin/customers/:id/role    - Update user role
 */