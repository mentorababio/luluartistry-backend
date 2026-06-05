const Settings = require('../models/Settings');
const ErrorResponse = require('../utils/errorResponse');

// ── Get settings ─────────────────────────────────────────────────────────────
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

// ── Update settings (Robust implementation) ──────────────────────────────────
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

    // 1. Explicitly set each field to trigger Mongoose change tracking
    for (const [key, value] of Object.entries(data)) {
      settings.set(`${section}.${key}`, value);
    }

    // 2. Explicitly mark the section as modified to ensure save triggers
    settings.markModified(section);

    // 3. Save to database
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

// ── Public endpoint ──────────────────────────────────────────────────────────
exports.getPublicSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ singleton: true });
    if (!settings) {
      settings = await Settings.create({ singleton: true });
    }
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