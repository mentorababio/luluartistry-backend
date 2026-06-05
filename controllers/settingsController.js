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

// ── Update settings (Debug-Enabled) ──────────────────────────────────────────
exports.updateSettings = async (req, res, next) => {
  try {
    const { section, data } = req.body;
    
    // Log incoming data to help us identify if the frontend is sending correctly
    console.log(`[DEBUG] Update requested for section: ${section}`);
    console.log(`[DEBUG] Data received: ${JSON.stringify(data)}`);

    if (!section || !data) {
      return next(new ErrorResponse('Section and data are required', 400));
    }

    const allowed = ['general', 'bank', 'shipping', 'notifications'];
    if (!allowed.includes(section)) {
      return next(new ErrorResponse(`Invalid section: ${section}`, 400));
    }

    // Attempt to find the singleton document
    let settings = await Settings.findOne({ singleton: true });
    
    if (!settings) {
      console.log("[DEBUG] No settings found, creating new singleton...");
      settings = await Settings.create({ singleton: true });
    }

    // Apply the update
    // Use .set() to ensure Mongoose detects path modifications
    for (const [key, value] of Object.entries(data)) {
      settings.set(`${section}.${key}`, value);
    }

    // Mark the nested section as modified for safety
    settings.markModified(section);
    
    await settings.save();

    console.log("[DEBUG] Save operation successful");

    res.status(200).json({
      success: true,
      message: `${section} settings updated successfully`,
      data: settings
    });
  } catch (error) {
    console.error("[DEBUG] Save operation failed:", error);
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