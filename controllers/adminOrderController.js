const Order = require('../models/Order');
const ErrorResponse = require('../utils/errorResponse');

/**
 * ==========================================
 * ADMIN: GET ALL ORDERS (Dashboard + Tabs)
 * ==========================================
 * GET /api/orders/admin
 * Query params:
 *  - status (optional): pending | processing | cancelled | delivered
 */
exports.getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { status } = req.query;

    const query = status ? { orderStatus: status } : {};

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('user', 'firstName lastName email');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * ADMIN: GET SINGLE ORDER DETAILS
 * ==========================================
 * GET /api/orders/admin/:id
 */
exports.getOrderDetailsAdmin = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'firstName lastName email');

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

/**
 * ==========================================
 * ADMIN: ACCEPT ORDER
 * ==========================================
 * PATCH /api/orders/admin/:id/accept
 */
exports.acceptOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    // Prevent invalid state changes
    if (order.orderStatus !== 'pending') {
      return next(
        new ErrorResponse(
          `Order cannot be accepted in '${order.orderStatus}' state`,
          400
        )
      );
    }

    order.orderStatus = 'processing';

    order.statusHistory.push({
      status: 'processing',
      note: 'Order accepted by admin'
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order accepted successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * ADMIN: DECLINE / CANCEL ORDER
 * ==========================================
 * PATCH /api/orders/admin/:id/decline
 * Body:
 *  - reason (optional)
 */
exports.declineOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    if (order.orderStatus === 'cancelled') {
      return next(new ErrorResponse('Order already cancelled', 400));
    }

    order.orderStatus = 'cancelled';
    order.cancelledAt = Date.now();
    order.cancellationReason = reason || 'Declined by admin';

    order.statusHistory.push({
      status: 'cancelled',
      note: order.cancellationReason
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order declined successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * ADMIN: MARK ORDER AS DELIVERED
 * ==========================================
 * PATCH /api/orders/admin/:id/deliver
 */
exports.markOrderDelivered = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    if (order.orderStatus !== 'processing' && order.orderStatus !== 'shipped') {
      return next(
        new ErrorResponse(
          `Order cannot be delivered in '${order.orderStatus}' state`,
          400
        )
      );
    }

    order.orderStatus = 'delivered';
    order.deliveredAt = Date.now();

    order.statusHistory.push({
      status: 'delivered',
      note: 'Order delivered successfully'
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order marked as delivered',
      data: order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ==========================================
 * ADMIN: GET ORDER STATUS HISTORY (TIMELINE)
 * ==========================================
 * GET /api/orders/admin/:id/history
 */
exports.getOrderHistory = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).select('statusHistory');

    if (!order) {
      return next(new ErrorResponse('Order not found', 404));
    }

    res.status(200).json({
      success: true,
      data: order.statusHistory
    });
  } catch (error) {
    next(error);
  }
};
