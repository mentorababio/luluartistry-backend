// @desc    Create new order
// @route   POST /api/orders
// @access  Private
exports.createOrder = async (req, res, next) => {
  // DEBUGGING ADDITION: Log the request body to compare against your database
  console.log("DEBUG: Incoming Request Body:", JSON.stringify(req.body, null, 2));

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
      // THE FIX: Log the specific item product ID we are trying to find
      console.log("DEBUG: Validating product ID:", item.product);
      
      const product = await Product.findById(item.product);
      if (!product) {
        // This 404 is what you are seeing. It means the ID above does not exist in your DB.
        return next(new ErrorResponse(`Product not found: ${item.product}`, 404));
      }
      if (product.stock < item.quantity) {
        return next(new ErrorResponse(`Insufficient stock for ${product.name}`, 400));
      }
    }

    // ... (rest of your existing logic remains the same)
    
    // Calculate pricing
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingCost = deliveryZone.cost;
    const discount = coupon?.discountAmount || 0;
    const total = subtotal + shippingCost - discount;

    let orderStatus;
    let paymentData = { method: paymentMethod };

    if (paymentMethod === 'transfer') {
      const transferReference = generateBankTransferReference();
      orderStatus = 'pending';
      paymentData.status = 'pending_payment';
      paymentData.reference = transferReference;
    } else if (paymentMethod === 'paystack') {
      orderStatus = 'pending';
      paymentData.status = 'pending_payment';
    }

    const order = await Order.create({
      user: req.user ? req.user.id : undefined,
      customerInfo,
      items,
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

    for (const item of items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: -item.quantity, totalSales: item.quantity }
      });
    }

    if (req.user) {
      try { await Cart.findOneAndDelete({ user: req.user.id }); } catch (cartError) { console.error('Error clearing cart:', cartError); }
    }

    await order.populate('items.product', 'name images');

    res.status(201).json({
      success: true,
      data: order,
      message: paymentMethod === 'transfer' ? 'Order created. Please complete bank transfer.' : 'Order created. Please complete payment.',
      ...(paymentMethod === 'transfer' && {
        bankDetails: {
          bankName: process.env.BANK_NAME || 'Your Bank Name',
          accountNumber: process.env.ACCOUNT_NUMBER || 'Your Account Number',
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