const express = require('express');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductsByCategory,
  deleteProductImage
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const router = express.Router();

// Get all products & Create product (admin only)
router.route('/')
  .get(getProducts)
  .post(
    protect,
    authorize('admin'),
    createProduct   // ✅ JSON-only
  );

// Get featured products
router.get('/featured/all', getFeaturedProducts);

// Get products by category
router.get('/category/:categoryId', getProductsByCategory);

// Get single product, Update product (admin), Delete product (admin)
router.route('/:id')
  .get(getProduct)
  .put(protect, authorize('admin'), updateProduct)
  .delete(protect, authorize('admin'), deleteProduct);

router.delete(
  '/:id/images',
  protect,
  authorize('admin'),
  deleteProductImage
);


module.exports = router;