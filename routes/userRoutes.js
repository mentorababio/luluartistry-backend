const express = require('express');
const {
  getMyProfile,
  updateMyProfile,
  getMyAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  addToWishlist,
  removeFromWishlist
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');

const router = express.Router();

// Profile
router.get('/me', protect, getMyProfile);
router.put('/me', protect, updateMyProfile);

// Addresses
router.get('/me/addresses', protect, getMyAddresses);
router.post('/me/addresses', protect, addAddress);
router.put('/me/addresses/:addressId', protect, updateAddress);
router.delete('/me/addresses/:addressId', protect, deleteAddress);

// Wishlist
router.get('/me/wishlist', protect, getWishlist);
router.post('/me/wishlist/:productId', protect, addToWishlist);
router.delete('/me/wishlist/:productId', protect, removeFromWishlist);

module.exports = router;
