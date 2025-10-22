const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationEmail } = require('../utils/emailTemplates');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      deliveryZone,
      customerInfo,
      coupon,
      isGift,
      giftMessage,
      notes
    } = req.body;

    // Validate stock availability
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return next(new ErrorResponse(`Product not found: ${item.product}`, 404));
      }
      if (product.stock < item.quantity) {
        return next(new ErrorResponse(`Insufficient stock for ${product.name}`, 400));
      }
    }

    // Calculate pricing
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = deliveryZone.cost;
    const discount = coupon?.discountAmount || 0;
    const total = subtotal + shippingCost - discount;

    // Create order
    const order = await Order.create({
      user: req.user ? req.user.id : undefined,
      customerInfo,
      items,
      shippingAddress,
      deliveryZone,
      pricing: {
        subtotal,
        shippingCost,
        discount,
        total
      },
      coupon,
      isGift,
      giftMessage,
      notes: {
        customerNote: notes
      },
      payment: {
        method: req.body.paymentMethod || 'paystack'
      }
    });

    // Clear user's cart after order
    if (req.user) {
      await Cart.findOneAndDelete({ user: req.user.id });
    }

    // Populate order details
    await order.populate('items.product', 'name images');

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (user's own orders)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
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
      .populate('items.product', 'name images');

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Make sure user is order owner or admin
    if (order.user && order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized to access this order', 403));
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    let order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    order.orderStatus = status;
    
    if (note) {
      order.statusHistory.push({
        status,
        note,
        updatedAt: new Date()
      });
    }

    if (status === 'delivered') {
      order.deliveredAt = new Date();
    }

    if (status === 'cancelled') {
      order.cancelledAt = new Date();
      // Restore stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;

    const query = {};
    if (req.query.status) {
      query.orderStatus = req.query.status;
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email')
      .populate('items.product', 'name images')
      .sort('-createdAt')
      .skip(startIndex)
      .limit(limit);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      data: orders
    });
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

    // Check if user owns the order
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse('Not authorized', 403));
    }

    // Can only cancel pending or processing orders
    if (!['pending', 'processing'].includes(order.orderStatus)) {
      return next(new ErrorResponse('Cannot cancel order at this stage', 400));
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = req.body.reason;

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, totalSales: -item.quantity }
      });
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};