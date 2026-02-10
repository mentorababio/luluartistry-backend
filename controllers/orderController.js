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
      notes,
      paymentMethod  // ← Make sure this is destructured
    } = req.body;

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const filter = { user: req.user.id };

    // Support status tabs: processing, shipped, delivered, cancelled
    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const orders = await Order.find(filter)
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

// @desc    Get single order for logged-in user
// @route   GET /api/orders/my/:id
// @access  Private
exports.getMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};
// @desc    Add bank transfer reference
// @route   PATCH /api/orders/my/:id/payment-reference
// @access  Private
exports.addPaymentReference = async (req, res, next) => {
  try {
    const { reference } = req.body;

    if (!reference) {
      return next(
        new ErrorResponse('Payment reference is required', 400)
      );
    }

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    if (order.payment.method !== 'transfer') {
      return next(
        new ErrorResponse('Not a bank transfer order', 400)
      );
    }

    order.payment.reference = reference;
    order.payment.status = 'initiated';

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


    // Validate payment method
    if (!paymentMethod) {
      return next(new ErrorResponse('Payment method is required', 400));
    }

    if (!['paystack', 'transfer'].includes(paymentMethod)) {
      return next(new ErrorResponse('Invalid payment method. Must be "paystack" or "transfer"', 400));
    }

    // Validate required fields
    if (!items || items.length === 0) {
      return next(new ErrorResponse('Order must have at least one item', 400));
    }

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

    // Set status based on payment method
    let orderStatus;
    let paymentData = {
      method: paymentMethod
    };

    if (paymentMethod === 'transfer') {
      // Bank Transfer: Create order immediately, wait for admin confirmation
      orderStatus = 'pending';
      paymentData.status = 'pending';
    } else if (paymentMethod === 'paystack') {
      // Paystack: Create order, mark as pending payment
      orderStatus = 'pending';
      paymentData.status = 'pending';
    }

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
      payment: paymentData,
      orderStatus
    });

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { 
          stock: -item.quantity,
          totalSales: item.quantity
        }
      });
    }

    // Clear user's cart after order
    if (req.user) {
      try {
        await Cart.findOneAndDelete({ user: req.user.id });
      } catch (cartError) {
        console.error('Error clearing cart:', cartError);
        // Don't fail the order if cart deletion fails
      }
    }

    // Populate order details
    await order.populate('items.product', 'name images');

    // Send different responses based on payment method
    let responseMessage;
    if (paymentMethod === 'transfer') {
      responseMessage = 'Order created successfully. Please complete bank transfer to the account details provided.';
    } else {
      responseMessage = 'Order created successfully. Please complete payment.';
    }

    res.status(201).json({
      success: true,
      data: order,
      message: responseMessage,
      // Include bank details if bank transfer
      ...(paymentMethod === 'transfer' && {
        bankDetails: {
          bankName: process.env.BANK_NAME || 'Your Bank Name',
          accountNumber: process.env.ACCOUNT_NUMBER || 'Your Account Number',
          accountName: process.env.ACCOUNT_NAME || 'Lulu Artistry',
          amount: total
        }
      })
    });

  } catch (error) {
    console.error('Order creation error:', error);
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product', 'name images')
      .sort({ createdAt: -1 });

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
      .populate('items.product', 'name images')
      .populate('user', 'firstName lastName email phone');

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Check if user is order owner or admin
    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
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

// @desc    Get all orders (Admin)
// @route   GET /api/orders/admin/all
// @access  Private/Admin
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name images')
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      pages: Math.ceil(total / limit),
      data: orders
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
    const { status } = req.body;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return next(new ErrorResponse('Invalid order status', 400));
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('items.product', 'name images');

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    res.status(200).json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`
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

    // Check if user is order owner
    if (order.user.toString() !== req.user.id) {
      return next(new ErrorResponse('Not authorized to cancel this order', 403));
    }

    // Only allow cancellation of pending orders
    if (order.status !== 'pending') {
      return next(new ErrorResponse('Can only cancel pending orders', 400));
    }

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, totalSales: -item.quantity }
      });
    }

    order.status = 'cancelled';
    await order.save();

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// USER ORDER CONTROLLERS
// ===============================

// @desc    Get logged-in user's orders
// @route   GET /api/orders/my
// @access  Private
exports.getMyOrders = async (req, res, next) => {
  try {
    const filter = { user: req.user.id };

    if (req.query.status) {
      filter.orderStatus = req.query.status;
    }

    const orders = await Order.find(filter).sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order for logged-in user
// @route   GET /api/orders/my/:id
// @access  Private
exports.getMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};
