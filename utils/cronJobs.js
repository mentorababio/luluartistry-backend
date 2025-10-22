const Cart = require('../models/Cart');
const Product = require('../models/Product');
const sendEmail = require('./sendEmail');
const { abandonedCartEmail, abandonedCartDiscountEmail, lowStockAlert } = require('./emailTemplates');

// Check for abandoned carts and send reminder emails
exports.checkAbandonedCarts = async () => {
  try {
    const abandonmentHours = parseInt(process.env.CART_ABANDONMENT_HOURS) || 24;
    const cutoffTime = new Date(Date.now() - abandonmentHours * 60 * 60 * 1000);

    // Find carts that haven't been updated in X hours and haven't received first email
    const abandonedCarts = await Cart.find({
      lastUpdated: { $lte: cutoffTime },
      items: { $exists: true, $not: { $size: 0 } },
      abandonmentEmailSent: false,
      user: { $exists: true, $ne: null }
    }).populate('user').populate('items.product');

    console.log(`Found ${abandonedCarts.length} abandoned carts`);

    for (const cart of abandonedCarts) {
      if (cart.user && cart.user.email) {
        try {
          await sendEmail({
            email: cart.user.email,
            subject: 'You Left Something Behind at Lulu Artistry 💕',
            html: abandonedCartEmail(cart, cart.user.firstName)
          });

          cart.abandonmentEmailSent = true;
          cart.abandonmentEmailSentAt = new Date();
          await cart.save();

          console.log(`First abandonment email sent to ${cart.user.email}`);
        } catch (error) {
          console.error(`Failed to send abandonment email to ${cart.user.email}:`, error.message);
        }
      }
    }

    // Send second reminder with discount after 48 hours
    const secondReminderCutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const secondReminderCarts = await Cart.find({
      lastUpdated: { $lte: secondReminderCutoff },
      items: { $exists: true, $not: { $size: 0 } },
      abandonmentEmailSent: true,
      secondReminderSent: false,
      user: { $exists: true, $ne: null }
    }).populate('user').populate('items.product');

    console.log(`Found ${secondReminderCarts.length} carts for second reminder`);

    for (const cart of secondReminderCarts) {
      if (cart.user && cart.user.email) {
        try {
          const discountCode = 'COMEBACK10';
          
          await sendEmail({
            email: cart.user.email,
            subject: '🎁 Here\'s 10% Off Your Cart!',
            html: abandonedCartDiscountEmail(cart, cart.user.firstName, discountCode)
          });

          cart.secondReminderSent = true;
          cart.secondReminderSentAt = new Date();
          await cart.save();

          console.log(`Second abandonment email sent to ${cart.user.email}`);
        } catch (error) {
          console.error(`Failed to send second reminder to ${cart.user.email}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error in abandoned cart check:', error);
  }
};

// Check for low stock products and alert admin
exports.checkLowStock = async () => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true
    }).populate('category');

    console.log(`Found ${lowStockProducts.length} low stock products`);

    for (const product of lowStockProducts) {
      try {
        await sendEmail({
          email: process.env.ADMIN_EMAIL,
          subject: `⚠️ Low Stock Alert: ${product.name}`,
          html: lowStockAlert(product)
        });

        console.log(`Low stock alert sent for ${product.name}`);
      } catch (error) {
        console.error(`Failed to send low stock alert for ${product.name}:`, error.message);
      }
    }
  } catch (error) {
    console.error('Error in low stock check:', error);
  }
};

// Send booking reminders 24 hours before appointment
exports.sendBookingReminders = async () => {
  try {
    const Booking = require('../models/Booking');
    const { bookingReminderEmail } = require('./emailTemplates');

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const upcomingBookings = await Booking.find({
      appointmentDate: { $gte: tomorrow, $lt: dayAfterTomorrow },
      status: 'confirmed',
      'reminder.emailSent': false
    }).populate('customer');

    console.log(`Found ${upcomingBookings.length} bookings to remind`);

    for (const booking of upcomingBookings) {
      if (booking.customer && booking.customer.email) {
        try {
          await sendEmail({
            email: booking.customer.email,
            subject: '⏰ Reminder: Your Appointment Tomorrow at Lulu Artistry',
            html: bookingReminderEmail(booking)
          });

          booking.reminder.emailSent = true;
          booking.reminder.emailSentAt = new Date();
          await booking.save();

          console.log(`Reminder sent to ${booking.customer.email}`);
        } catch (error) {
          console.error(`Failed to send reminder to ${booking.customer.email}:`, error.message);
        }
      }
    }
  } catch (error) {
    console.error('Error in booking reminders:', error);
  }
};

// Booking reminder email template (add to emailTemplates.js)
const bookingReminderEmail = (booking) => {
  const baseTemplate = require('./emailTemplates').baseTemplate || ((content) => content);
  return baseTemplate(`
    <h2>Reminder: Your Appointment is Tomorrow! ⏰</h2>
    <p>Hi ${booking.customerInfo.firstName},</p>
    <p>Just a friendly reminder about your upcoming appointment:</p>
    <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <strong>Service:</strong> ${booking.serviceSnapshot.name}<br>
      <strong>Date:</strong> ${new Date(booking.appointmentDate).toLocaleDateString()}<br>
      <strong>Time:</strong> ${booking.timeSlot.start}<br>
      <strong>Location:</strong> ${booking.location === 'calabar' ? 'Calabar Studio' : 'Port Harcourt Studio'}
    </div>
    <p><strong>Important:</strong></p>
    <ul>
      <li>Please arrive 10 minutes early</li>
      <li>Come with a clean face (no makeup)</li>
      <li>Bring your booking confirmation</li>
    </ul>
    <p>We can't wait to see you! If you need to reschedule, please contact us ASAP.</p>
  `);
};