const axios = require('axios');
const Order = require('../models/Order');
const Booking = require('../models/Booking');
const Enrollment = require('../models/Enrollment');
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationEmail } = require('../utils/emailTemplates');

const paystackAPI = axios.create({
  baseURL: 'https://api.paystack.co',
  headers: {
    Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
});

// @desc    Initialize payment
// @route   POST /api/payment/initialize
// @access  Private
exports.initializePayment = async (req, res, next) => {
  try {
    const { type, referenceId, amount, email } = req.body;
    // type: 'order', 'booking', 'enrollment'
    // referenceId: ID of the order/booking/enrollment

    // Generate unique reference
    const reference = `${type}-${referenceId}-${Date.now()}`;

    // Initialize Paystack transaction
    const response = await paystackAPI.post('/transaction/initialize', {
      email,
      amount: amount * 100, // Paystack expects amount in kobo (₦1 = 100 kobo)
      reference,
      callback_url: `${process.env.PAYSTACK_CALLBACK_URL}?ref=${reference}`,
      metadata: {
        type,
        referenceId,
        userId: req.user ? req.user.id : null
      }
    });

    res.status(200).json({
      success: true,
      data: {
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        reference: response.data.data.reference
      }
    });
  } catch (error) {
    console.error('Paystack initialization error:', error.response?.data || error.message);
    next(new ErrorResponse('Payment initialization failed', 500));
  }
};

// @desc    Verify payment
// @route   GET /api/payment/verify/:reference
// @access  Public
exports.verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;

    // Verify transaction with Paystack
    const response = await paystackAPI.get(`/transaction/verify/${reference}`);

    const { status, data } = response.data;

    if (status && data.status === 'success') {
      const { type, referenceId } = data.metadata;

      // Update payment status based on type
      if (type === 'order') {
        await handleOrderPayment(referenceId, data);
      } else if (type === 'booking') {
        await handleBookingPayment(referenceId, data);
      } else if (type === 'enrollment') {
        await handleEnrollmentPayment(referenceId, data);
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: {
          reference: data.reference,
          amount: data.amount / 100,
          status: data.status
        }
      });
    } else {
      return next(new ErrorResponse('Payment verification failed', 400));
    }
  } catch (error) {
    console.error('Payment verification error:', error.response?.data || error.message);
    next(new ErrorResponse('Payment verification failed', 500));
  }
};

// @desc    Paystack webhook
// @route   POST /api/payment/webhook
// @access  Public
exports.paystackWebhook = async (req, res, next) => {
  try {
    const hash = require('crypto')
      .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash === req.headers['x-paystack-signature']) {
      const event = req.body;

      // Handle different event types
      switch (event.event) {
        case 'charge.success':
          const { type, referenceId } = event.data.metadata;
          
          if (type === 'order') {
            await handleOrderPayment(referenceId, event.data);
          } else if (type === 'booking') {
            await handleBookingPayment(referenceId, event.data);
          } else if (type === 'enrollment') {
            await handleEnrollmentPayment(referenceId, event.data);
          }
          break;

        case 'transfer.success':
          // Handle refunds
          console.log('Transfer successful:', event.data);
          break;

        default:
          console.log('Unhandled webhook event:', event.event);
      }

      res.status(200).send('Webhook received');
    } else {
      res.status(400).send('Invalid signature');
    }
  } catch (error) {
    console.error('Webhook error:', error);
    next(error);
  }
};

// Helper function to handle order payment
async function handleOrderPayment(orderId, paymentData) {
  try {
    const order = await Order.findById(orderId).populate('items.product');

    if (!order) {
      throw new Error('Order not found');
    }

    order.payment.status = 'paid';
    order.payment.paymentId = paymentData.id;
    order.payment.paystackReference = paymentData.reference;
    order.payment.paidAt = new Date();
    order.orderStatus = 'processing';

    await order.save();

    // Send order confirmation email
    if (order.customerInfo.email) {
      await sendEmail({
        email: order.customerInfo.email,
        subject: `Order Confirmed - ${order.orderNumber}`,
        html: orderConfirmationEmail(order)
      });
    }

    console.log(`Order ${orderId} payment processed successfully`);
  } catch (error) {
    console.error('Error handling order payment:', error);
  }
}

// Helper function to handle booking payment
async function handleBookingPayment(bookingId, paymentData) {{
  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      throw new Error('Booking not found');
    }

    // Check if it's deposit or balance payment
    const amount = paymentData.amount / 100;
    
    if (amount === booking.pricing.depositAmount) {
      booking.payment.depositPaid = true;
      booking.payment.depositPaymentId = paymentData.id;
      booking.payment.depositPaidAt = new Date();
      booking.status = 'confirmed';
    } else if (amount === booking.pricing.balanceAmount) {
      booking.payment.balancePaid = true;
      booking.payment.balancePaymentId = paymentData.id;
      booking.payment.balancePaidAt = new Date();
    }

    booking.payment.paymentMethod = 'paystack';

    await booking.save();

    console.log(`Booking ${bookingId} payment processed successfully`);
  } catch (error) {
    console.error('Error handling booking payment:', error);
  }
}

// Helper function to handle enrollment payment
async function handleEnrollmentPayment(enrollmentId, paymentData) {
  try {
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    enrollment.payment.status = 'paid';
    enrollment.payment.method = 'paystack';
    enrollment.payment.paymentId = paymentData.id;
    enrollment.payment.paidAt = new Date();
    enrollment.status = 'active';

    await enrollment.save();

    console.log(`Enrollment ${enrollmentId} payment processed successfully`);
  } catch (error) {
    console.error('Error handling enrollment payment:', error);
  }
}

// @desc    Initiate refund
// @route   POST /api/payment/refund
// @access  Private/Admin
exports.initiateRefund = async (req, res, next) => {
  try {
    const { reference, amount, reason } = req.body;

    const response = await paystackAPI.post('/refund', {
      transaction: reference,
      amount: amount ? amount * 100 : undefined, // Partial or full refund
      merchant_note: reason
    });

    res.status(200).json({
      success: true,
      message: 'Refund initiated successfully',
      data: response.data.data
    });
  } catch (error) {
    console.error('Refund error:', error.response?.data || error.message);
    next(new ErrorResponse('Refund initiation failed', 500));
  }
}};