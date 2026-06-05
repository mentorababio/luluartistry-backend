const Settings = require('../models/Settings');
const ErrorResponse = require('../utils/errorResponse');

// ── Get settings ─────────────────────────────────────────────────────────────
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne({ singleton: true });
    if (!settings) settings = await Settings.create({ singleton: true });
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// ── Update settings (Production-Grade Implementation) ────────────────────────
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

    // Use findOneAndUpdate for atomic operations (avoids race conditions)
    // We use $set to target the specific nested path directly in MongoDB
    const updateQuery = {};
    for (const [key, value] of Object.entries(data)) {
      updateQuery[`${section}.${key}`] = value;
    }

    const settings = await Settings.findOneAndUpdate(
      { singleton: true },
      { $set: updateQuery },
      { new: true, upsert: true, runValidators: true }
    );

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
    if (!settings) settings = await Settings.create({ singleton: true });
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