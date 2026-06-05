const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
  // Only one settings document per app
  singleton: { type: Boolean, default: true, unique: true },

  general: {
    businessName:    { type: String, default: 'Lulu Artistry' },
    businessEmail:   { type: String, default: 'info@luluartistry.com' },
    businessPhone:   { type: String, default: '+234 703 100 2094' },
    businessAddress: { type: String, default: 'Lagos, Nigeria' },
    businessWebsite: { type: String, default: 'https://luluartistry.store' },
  },

  bank: {
    bankName:      { type: String, default: 'GTBank' },
    accountNumber: { type: String, default: '0123456789' },
    accountName:   { type: String, default: 'Lulu Artistry LTD' },
    bankBranch:    { type: String, default: '' },
  },

  shipping: {
    standardShippingCost:  { type: Number, default: 1200 },
    expressShippingCost:   { type: Number, default: 2500 },
    freeShippingThreshold: { type: Number, default: 50000 },
    pickupAvailable:       { type: Boolean, default: true },
  },

  notifications: {
    emailNotifications:    { type: Boolean, default: true },
    smsNotifications:      { type: Boolean, default: false },
    orderNotifications:    { type: Boolean, default: true },
    bookingNotifications:  { type: Boolean, default: true },
    lowStockAlerts:        { type: Boolean, default: true },
    paymentAlerts:         { type: Boolean, default: true },
  },
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);