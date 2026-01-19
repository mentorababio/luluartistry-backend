const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

/* ================================
   PROFILE
================================ */

// @desc    Get logged-in user profile
// @route   GET /api/users/me
// @access  Private
exports.getMyProfile = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
};

// @desc    Update logged-in user profile
// @route   PUT /api/users/me
// @access  Private
exports.updateMyProfile = async (req, res, next) => {
  const allowedFields = ['firstName', 'lastName', 'phone'];
  const updates = {};

  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user
  });
};

/* ================================
   ADDRESSES
================================ */

// @desc    Get user addresses
// @route   GET /api/users/me/addresses
// @access  Private
exports.getMyAddresses = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user.addresses
  });
};

// @desc    Add address
// @route   POST /api/users/me/addresses
// @access  Private
exports.addAddress = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  // If new address is default, unset others
  if (req.body.isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  user.addresses.push(req.body);
  await user.save();

  res.status(201).json({
    success: true,
    data: user.addresses
  });
};

// @desc    Update address
// @route   PUT /api/users/me/addresses/:addressId
// @access  Private
exports.updateAddress = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  if (req.body.isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  Object.assign(address, req.body);
  await user.save();

  res.status(200).json({
    success: true,
    data: user.addresses
  });
};

// @desc    Delete address
// @route   DELETE /api/users/me/addresses/:addressId
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  const user = await User.findById(req.user.id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    return next(new ErrorResponse('Address not found', 404));
  }

  address.remove();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully'
  });
};

/* ================================
   WISHLIST
================================ */

// @desc    Get wishlist
// @route   GET /api/users/me/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  const user = await User.findById(req.user.id)
    .populate('wishlist');

  res.status(200).json({
    success: true,
    data: user.wishlist
  });
};

// @desc    Add product to wishlist
// @route   POST /api/users/me/wishlist/:productId
// @access  Private
exports.addToWishlist = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user.wishlist.includes(req.params.productId)) {
    user.wishlist.push(req.params.productId);
    await user.save();
  }

  res.status(200).json({
    success: true,
    data: user.wishlist
  });
};

// @desc    Remove product from wishlist
// @route   DELETE /api/users/me/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  const user = await User.findById(req.user.id);

  user.wishlist = user.wishlist.filter(
    id => id.toString() !== req.params.productId
  );

  await user.save();

  res.status(200).json({
    success: true,
    data: user.wishlist
  });
};
