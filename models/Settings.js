const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  singleton: { type: Boolean, default: true, unique: true },
  general: {
    businessName: String,
    businessEmail: String,
    businessPhone: String,
    businessAddress: String,
    businessWebsite: String,
  },
  bank: {
    bankName: String,
    accountNumber: String,
    accountName: String,
    bankBranch: String,
  },
  shipping: {
    standardShippingCost: Number,
    expressShippingCost: Number,
    freeShippingThreshold: Number,
    pickupAvailable: Boolean,
  },
  notifications: {
    emailNotifications: Boolean,
    smsNotifications: Boolean,
    orderNotifications: Boolean,
    bookingNotifications: Boolean,
    lowStockAlerts: Boolean,
    paymentAlerts: Boolean,
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);