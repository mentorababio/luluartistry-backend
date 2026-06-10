const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const cloudinary = require('../config/cloudinary');

// ── Image helpers ─────────────────────────────────────────────────────────────
const normalizeImage = (img) => {
  if (!img) return null;
  if (typeof img === 'string') return { url: img, alt: '' };
  const url = img.url || img.secure_url || img.src;
  return url ? { url, alt: img.alt || '' } : null;
};

const buildImages = (body) => {
  let imagesArray = [];
  if (Array.isArray(body.images)) {
    imagesArray = body.images.map(normalizeImage).filter(Boolean);
  } else if (typeof body.images === 'string') {
    const normalized = normalizeImage(body.images);
    if (normalized) imagesArray = [normalized];
  }
  if (imagesArray.length === 0 && body.image) {
    const normalized = normalizeImage(body.image);
    if (normalized) imagesArray = [normalized];
  }
  return imagesArray;
};
// ─────────────────────────────────────────────────────────────────────────────

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const reqQuery = { ...req.query };
    const removeFields = ['select', 'sort', 'page', 'limit', 'search'];
    removeFields.forEach(param => delete reqQuery[param]);

    if (!req.user || req.user.role !== 'admin') {
      reqQuery.isActive = true;
    }

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    let query = Product.find(JSON.parse(queryStr)).populate('category', 'name slug');

    if (req.query.search) {
      query = query.find({ $text: { $search: req.query.search } });
    }

    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Product.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    const products = await query;

    const pagination = {};
    if (endIndex < total) pagination.next = { page: page + 1, limit };
    if (startIndex > 0) pagination.prev = { page: page - 1, limit };

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pagination,
      data: products
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name slug')
      .populate({
        path: 'reviews',
        select: 'rating comment user createdAt',
        populate: { path: 'user', select: 'firstName lastName avatar' }
      });

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    let uploadedImages = [];

    // Priority 1: actual file uploads via Multer → upload to Cloudinary
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'luluartistry/products'
        });
        uploadedImages.push({ url: result.secure_url, publicId: result.public_id, alt: '' });
      }
    }

    // Priority 2: image URLs/objects already in the request body
    if (uploadedImages.length === 0) {
      if (Array.isArray(req.body.images)) {
        uploadedImages = req.body.images.filter(img => img && img.url);
      } else if (req.body.image && typeof req.body.image === 'string') {
        uploadedImages = [{ url: req.body.image, alt: '' }];
      }
    }

    const { name, category, price, description, ...rest } = req.body;

    const product = await Product.create({
      name,
      category,
      price,
      description,
      ...rest,
      images: uploadedImages,
      isActive: true
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};
// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    const updates = { ...req.body };

    // Only overwrite images if the request actually carries image data
    const imagesArray = buildImages(req.body);
    if (imagesArray.length > 0) updates.images = imagesArray;

    product = await Product.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    await Product.findByIdAndDelete(req.params.id);

    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.publicId) {
          try { await cloudinary.uploader.destroy(img.publicId); }
          catch (e) { console.error('Cloudinary delete error:', e.message); }
        }
      }
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get featured products
// @route   GET /api/products/featured/all
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .limit(8)
      .populate('category', 'name slug');

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
exports.getProductsByCategory = async (req, res, next) => {
  try {
    const products = await Product.find({ category: req.params.categoryId, isActive: true })
      .populate('category', 'name slug');

    res.status(200).json({ success: true, count: products.length, data: products });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a single product image
// @route   DELETE /api/products/:id/images
// @access  Private/Admin
exports.deleteProductImage = async (req, res, next) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return next(new ErrorResponse('Image publicId is required', 400));
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorResponse('Product not found', 404));
    }

    await cloudinary.uploader.destroy(publicId);

    product.images = product.images.filter(img => img.publicId !== publicId);
    await product.save();

    res.status(200).json({ success: true, data: product.images });
  } catch (error) {
    next(error);
  }
};