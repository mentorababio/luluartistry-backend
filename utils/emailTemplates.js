// Base email template wrapper
const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #FF1493 0%, #FF69B4 100%); padding: 30px; text-align: center; color: white; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px; }
    .button { display: inline-block; padding: 12px 30px; background: #FF1493; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #f8f8f8; padding: 20px; text-align: center; font-size: 12px; color: #666; }
    .footer a { color: #FF1493; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ Lulu Artistry</h1>
      <p style="margin: 5px 0;">Beauty. Elegance. You.</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>📍 Calabar & Port Harcourt | 📞 ${process.env.SUPPORT_PHONE || '+234-XXX-XXX-XXXX'}</p>
      <p>💌 <a href="mailto:hello@luluartistry.com">hello@luluartistry.com</a> | 🌐 <a href="${process.env.FRONTEND_URL}">www.luluartistry.com</a></p>
      <p style="margin-top: 15px; color: #999;">© ${new Date().getFullYear()} Lulu Artistry. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
`;

// Welcome email
exports.welcomeEmail = (name) => baseTemplate(`
  <h2>Welcome to Lulu Artistry, ${name}! 💕</h2>
  <p>We're thrilled to have you join our beauty community!</p>
  <p>At Lulu Artistry, we're all about helping you express your unique beauty through premium lashes, nails, brows, and professional training.</p>
  <a href="${process.env.FRONTEND_URL}/product" class="button">Start Shopping</a>
  <p style="margin-top: 20px;">Need help? Our team is always here for you!</p>
`);

// Order confirmation
exports.orderConfirmationEmail = (order) => baseTemplate(`
  <h2>Thank You for Your Order! 🎉</h2>
  <p>Hi ${order.customerInfo.firstName},</p>
  <p>Your order has been confirmed and will be processed soon!</p>
  <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <strong>Order Number:</strong> ${order.orderNumber}<br>
    <strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}<br>
    <strong>Total:</strong> ₦${order.pricing.total.toLocaleString()}
  </div>
  <h3>Order Items:</h3>
  ${order.items.map(item => `
    <div style="margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee;">
      <strong>${item.productSnapshot.name}</strong> x ${item.quantity}<br>
      <span style="color: #666;">₦${item.price.toLocaleString()} each</span>
    </div>
  `).join('')}
  <a href="${process.env.FRONTEND_URL}/orders/${order.orderNumber}" class="button">Track Your Order</a>
`);

// Abandoned cart email (first)
exports.abandonedCartEmail = (cart, customerName) => baseTemplate(`
  <h2>You Left Something Behind! 💔</h2>
  <p>Hi ${customerName},</p>
  <p>We noticed you left some beautiful items in your cart. They're still waiting for you!</p>
  <h3>Your Cart (₦${cart.subtotal.toLocaleString()}):</h3>
  ${cart.items.map(item => `
    <div style="margin: 10px 0; padding: 10px; border-bottom: 1px solid #eee;">
      ${item.product.name} x ${item.quantity} - ₦${(item.price * item.quantity).toLocaleString()}
    </div>
  `).join('')}
  <a href="${process.env.FRONTEND_URL}/cart" class="button">Complete Your Purchase</a>
  <p style="margin-top: 20px;">Questions? We're here to help!</p>
`);

// Abandoned cart with discount (second)
exports.abandonedCartDiscountEmail = (cart, customerName, discountCode) => baseTemplate(`
  <h2>Still Thinking It Over? Here's 10% Off! 🎁</h2>
  <p>Hi ${customerName},</p>
  <p>We really want to see you glow! Here's a special discount just for you:</p>
  <div style="background: #fff4f4; padding: 20px; border-radius: 5px; text-align: center; margin: 20px 0;">
    <h3 style="color: #FF1493; margin: 0;">Use Code: <strong>${discountCode}</strong></h3>
    <p style="margin: 10px 0; font-size: 18px;">Get 10% off your cart!</p>
  </div>
  <p>Your cart is still waiting (₦${cart.subtotal.toLocaleString()}):</p>
  ${cart.items.slice(0, 3).map(item => `<div style="margin: 5px 0;">${item.product.name}</div>`).join('')}
  <a href="${process.env.FRONTEND_URL}/cart?code=${discountCode}" class="button">Claim Your Discount</a>
  <p style="margin-top: 20px; color: #999; font-size: 12px;">*Code expires in 48 hours</p>
`);

// Booking confirmation
exports.bookingConfirmationEmail = (booking) => baseTemplate(`
  <h2>Your Appointment is Confirmed! ✨</h2>
  <p>Hi ${booking.customerInfo.firstName},</p>
  <p>We're excited to pamper you soon!</p>
  <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <strong>Booking #:</strong> ${booking.bookingNumber}<br>
    <strong>Service:</strong> ${booking.serviceSnapshot.name}<br>
    <strong>Artist:</strong> ${booking.artist.name || 'Lulu'}<br>
    <strong>Date:</strong> ${new Date(booking.appointmentDate).toLocaleDateString()}<br>
    <strong>Time:</strong> ${booking.timeSlot.start}<br>
    <strong>Location:</strong> ${booking.location === 'calabar' ? 'Calabar Studio' : 'Port Harcourt Studio'}
  </div>
  <p><strong>Please Note:</strong> ${booking.serviceSnapshot.description}</p>
  <a href="${process.env.FRONTEND_URL}/bookings/${booking.bookingNumber}" class="button">View Booking Details</a>
  <p style="margin-top: 20px; font-size: 14px; color: #666;">If you need to reschedule, please contact us at least 24 hours in advance.</p>
`);

// Course enrollment confirmation
exports.enrollmentConfirmationEmail = (enrollment) => baseTemplate(`
  <h2>Welcome to the Course! 📚✨</h2>
  <p>Hi ${enrollment.studentInfo.firstName},</p>
  <p>You're officially enrolled! Get ready to level up your beauty skills!</p>
  <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <strong>Enrollment #:</strong> ${enrollment.enrollmentNumber}<br>
    <strong>Course:</strong> ${enrollment.courseSnapshot.title}<br>
    <strong>Start Date:</strong> ${new Date(enrollment.startDate).toLocaleDateString()}<br>
    <strong>Duration:</strong> ${enrollment.courseSnapshot.duration}<br>
    <strong>Location:</strong> ${enrollment.location === 'calabar' ? 'Calabar Studio' : 'Port Harcourt Studio'}
  </div>
  <p><strong>What to Bring:</strong></p>
  <ul>
    <li>Valid ID</li>
    <li>Notebook & pen</li>
    <li>Enthusiasm to learn!</li>
  </ul>
  <a href="${process.env.FRONTEND_URL}/enrollments/${enrollment.enrollmentNumber}" class="button">View Course Details</a>
  <p style="margin-top: 20px;">We can't wait to see you in class!</p>
`);

// Password reset
exports.passwordResetEmail = (resetUrl, name) => baseTemplate(`
  <h2>Reset Your Password 🔐</h2>
  <p>Hi ${name},</p>
  <p>You requested to reset your password. Click the button below:</p>
  <a href="${resetUrl}" class="button">Reset Password</a>
  <p style="margin-top: 20px; font-size: 14px; color: #666;">This link expires in 10 minutes. If you didn't request this, please ignore this email.</p>
`);

// Low stock alert (for admin)
exports.lowStockAlert = (product) => baseTemplate(`
  <h2>⚠️ Low Stock Alert</h2>
  <p>The following product is running low:</p>
  <div style="background: #fff4f4; padding: 15px; border-radius: 5px; margin: 20px 0;">
    <strong>Product:</strong> ${product.name}<br>
    <strong>Current Stock:</strong> ${product.stock} units<br>
    <strong>Category:</strong> ${product.category?.name || 'N/A'}
  </div>
  <p>Please restock soon to avoid running out!</p>
  <a href="${process.env.ADMIN_DASHBOARD_URL || process.env.FRONTEND_URL}/admin/products/${product._id}" class="button">Manage Product</a>
`);