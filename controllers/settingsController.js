const Settings = require('../models/Settings');
const ErrorResponse = require('../utils/errorResponse');

// ── Get settings (or create default if none exist) ────────────────────────────
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ singleton: true });
    if (!settings) {
      settings = await Settings.create({ singleton: true });
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// ── Update settings ───────────────────────────────────────────────────────────
exports.updateSettings = async (req, res, next) => {
  try {
    const { section, data } = req.body;

    if (!section || !data) {
      return next(new ErrorResponse('Section and data are required', 400));
    }

    const allowed = ['general', 'bank', 'shipping', 'notifications'];
    if (!allowed.includes(section)) {
      return next(new ErrorResponse(`Invalid section: ${section}`, 400));
    }

    let settings = await Settings.findOne({ singleton: true });
    if (!settings) {
      settings = await Settings.create({ singleton: true });
    }

    // Update only the specified section
    settings[section] = { ...settings[section].toObject(), ...data };
    await settings.save();

    res.status(200).json({
      success: true,
      message: `${section} settings updated successfully`,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

// ── Public endpoint — get bank details for checkout ───────────────────────────
exports.getPublicSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ singleton: true });
    if (!settings) {
      settings = await Settings.create({ singleton: true });
    }
    // Only return bank details publicly
    res.status(200).json({
      success: true,
      data: {
        bank: settings.bank,
        shipping: settings.shipping,
        general: {
          businessName: settings.general.businessName,
          businessEmail: settings.general.businessEmail,
          businessPhone: settings.general.businessPhone,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
