const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const ErrorResponse = require('../utils/errorResponse');

const generateBankTransferReference = () => {
  return 'LU-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6).toUpperCase();
};

// @desc    Create new order
// @route   POST /api/orders/checkout
// @access  Private
exports.createOrder = async (req, res, next) => {
  console.log("DEBUG: Incoming Request Body Items:", JSON.stringify(req.body.items, null, 2));

  try {
    const {
      items,
      shippingAddress,
      deliveryZone,
      customerInfo,
      coupon,
      isGift,
      giftMessage,
      notes,
      paymentMethod
    } = req.body;

    if (!paymentMethod) {
      return next(new ErrorResponse('Payment method is required', 400));
    }
    if (!['paystack', 'transfer'].includes(paymentMethod)) {
      return next(new ErrorResponse('Invalid payment method. Must be "paystack" or "transfer"', 400));
    }
    if (!items || items.length === 0) {
      return next(new ErrorResponse('Order must have at least one item', 400));
    }

    // Validate stock and build enriched items with required subtotal field
    const enrichedItems = [];
    for (const item of items) {
      console.log("DEBUG: Checking database for product ID:", item.product);

      if (!mongoose.Types.ObjectId.isValid(item.product)) {
        return next(new ErrorResponse(
          `Invalid product ID "${item.product}". Please add products from the Shop page.`,
          400
        ));
      }

      const product = await Product.findById(item.product);
      if (!product) {
        return next(new ErrorResponse(`Product not found: ${item.product}`, 404));
      }
      if (product.stock < item.quantity) {
        return next(new ErrorResponse(`Insufficient stock for ${product.name}`, 400));
      }

      const itemPrice = item.price || product.price;
      enrichedItems.push({
        product: item.product,
        productSnapshot: {
          name: product.name,
          image: (product.images && product.images[0] && product.images[0].url) || '',
          price: product.price
        },
        quantity: item.quantity,
        price: itemPrice,
        subtotal: itemPrice * item.quantity
      });
    }

    const subtotal = enrichedItems.reduce((acc, item) => acc + item.subtotal, 0);
    const shippingCost = deliveryZone?.cost || 0;
    const discount = coupon?.discountAmount || 0;
    const total = subtotal + shippingCost - discount;

    let orderStatus = 'pending';
    let paymentData = { method: paymentMethod, status: 'pending_payment' };

    if (paymentMethod === 'transfer') {
      paymentData.reference = generateBankTransferReference();
    }

    const order = new Order({
      user: req.user ? req.user.id : undefined,
      customerInfo,
      items: enrichedItems,
      shippingAddress,
      deliveryZone,
      pricing: { subtotal, shippingCost, discount, total },
      coupon,
      isGift,
      giftMessage,
      notes: { customerNote: notes },
      payment: paymentData,
      orderStatus
    });

    // ── FIX: Generate orderNumber manually before saving ─────────────────
    // The pre-save hook may fail silently if countDocuments throws,
    // so we generate it here as a guaranteed fallback.
    const date = new Date();
    const count = await Order.countDocuments() + 1;
    order.orderNumber = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}-${String(count).padStart(4, '0')}`;
    // ─────────────────────────────────────────────────────────────────────

    await order.save();

    if (req.user) {
      try { await Cart.findOneAndDelete({ user: req.user.id }); }
      catch (cartError) { console.error('Error clearing cart:', cartError); }
    }

    await order.populate('items.product', 'name images');

    res.status(201).json({
      success: true,
      data: order,
      message: paymentMethod === 'transfer'
        ? 'Order created. Please complete bank transfer.'
        : 'Order created. Please complete payment.',
      ...(paymentMethod === 'transfer' && {
        bankDetails: {
          bankName: process.env.BANK_NAME || 'GTBank',
          accountNumber: process.env.ACCOUNT_NUMBER || '0123456789',
          accountName: process.env.ACCOUNT_NAME || 'Lulu Artistry',
          amount: total,
          paymentReference: order.payment.reference
        }
      })
    });

  } catch (error) {
    console.error('Order creation error:', error);
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Private/Admin
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images');

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    if (order.user && order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to access this order', 403));
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single logged in user order
// @route   GET /api/orders/my/:id
// @access  Private
exports.getMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id })
      .populate('items.product', 'name images');

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true, runValidators: true }
    );

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    if (order.user && order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to cancel this order', 403));
    }

    if (['delivered', 'cancelled'].includes(order.orderStatus)) {
      return next(new ErrorResponse(`Order cannot be cancelled when status is ${order.orderStatus}`, 400));
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason || 'Cancelled by user';
    await order.save();

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// @desc    Add payment reference for bank transfer
// @route   PATCH /api/orders/my/:id/payment-reference
// @access  Private
exports.addPaymentReference = async (req, res, next) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return next(new ErrorResponse('Payment reference is required', 400));
    }

    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    order.payment.reference = reference;
    order.payment.status = 'payment_submitted';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Payment reference submitted successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};