const Service = require('../models/Service');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
exports.getServices = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;

    const services = await Service.find(query).sort('displayOrder');

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
exports.getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return next(new ErrorResponse('Service not found', 404));
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Create service
// @route   POST /api/services
// @access  Private/Admin
exports.createService = async (req, res, next) => {
  try {
    const service = await Service.create(req.body);
    res.status(201).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!service) {
      return next(new ErrorResponse('Service not found', 404));
    }
    res.status(200).json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return next(new ErrorResponse('Service not found', 404));
    }
    res.status(200).json({ success: true, message: 'Service deleted' });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed default services
// @route   POST /api/services/seed
// @access  Private/Admin
exports.seedServices = async (req, res, next) => {
  try {
    const existing = await Service.countDocuments();
    if (existing > 0) {
      return res.status(200).json({
        success: true,
        message: `Services already seeded (${existing} exist). Delete them first to re-seed.`
      });
    }

    const services = [
      // ── LASHES ────────────────────────────────────────────────────────────
      {
        name: 'Classic Lash Extensions',
        category: 'lashes',
        description: 'Natural-looking individual lash extensions applied one by one. Perfect for everyday elegance.',
        benefits: ['Natural look', 'Lasts 4-6 weeks', 'Lightweight'],
        pricing: [
          { artistType: 'lulu', price: 35000 },
          { artistType: 'senior', price: 25000 },
          { artistType: 'artist', price: 18000 },
        ],
        duration: 90,
        requirements: ['Come with clean, makeup-free eyes', 'Remove contact lenses before appointment'],
        aftercare: ['Avoid water for 24 hours', 'Do not rub eyes', 'Use oil-free products'],
        isActive: true,
        displayOrder: 1,
      },
      {
        name: 'Volume Lash Extensions',
        category: 'lashes',
        description: 'Fluffy, dramatic volume lashes using multiple ultra-fine extensions per natural lash.',
        benefits: ['Full glamorous look', 'Lasts 4-6 weeks', 'Customizable volume'],
        pricing: [
          { artistType: 'lulu', price: 45000 },
          { artistType: 'senior', price: 35000 },
          { artistType: 'artist', price: 25000 },
        ],
        duration: 120,
        requirements: ['Clean, makeup-free eyes', 'Remove contact lenses'],
        aftercare: ['Avoid water for 24 hours', 'Brush daily with spoolie', 'Use oil-free products'],
        isActive: true,
        displayOrder: 2,
      },
      {
        name: 'Hybrid Lash Extensions',
        category: 'lashes',
        description: 'A mix of classic and volume lashes for a textured, natural yet full look.',
        benefits: ['Best of both worlds', 'Textured appearance', 'Lasts 4-6 weeks'],
        pricing: [
          { artistType: 'lulu', price: 40000 },
          { artistType: 'senior', price: 30000 },
          { artistType: 'artist', price: 22000 },
        ],
        duration: 105,
        requirements: ['Clean eyes, no makeup', 'Remove contact lenses'],
        aftercare: ['Avoid water for 24 hours', 'Brush daily', 'Oil-free products only'],
        isActive: true,
        displayOrder: 3,
      },
      {
        name: 'Lash Infill',
        category: 'lashes',
        description: 'Maintenance appointment to fill gaps in existing lash extensions.',
        benefits: ['Refresh your look', 'Cost effective', 'Quick appointment'],
        pricing: [
          { artistType: 'lulu', price: 20000 },
          { artistType: 'senior', price: 15000 },
          { artistType: 'artist', price: 10000 },
        ],
        duration: 60,
        requirements: ['Must have existing lash extensions (2-4 weeks old)', 'Clean lashes'],
        aftercare: ['Same as full set aftercare'],
        isActive: true,
        displayOrder: 4,
      },
      {
        name: 'Lash Removal',
        category: 'lashes',
        description: 'Safe and gentle removal of lash extensions using professional solvents.',
        benefits: ['Safe removal', 'No damage to natural lashes', 'Quick'],
        pricing: [
          { artistType: 'lulu', price: 5000 },
          { artistType: 'senior', price: 5000 },
          { artistType: 'artist', price: 5000 },
        ],
        duration: 30,
        requirements: ['Existing lash extensions'],
        aftercare: ['Condition natural lashes with serum'],
        isActive: true,
        displayOrder: 5,
      },

      // ── BROWS ─────────────────────────────────────────────────────────────
      {
        name: 'Brow Lamination',
        category: 'brows',
        description: 'Straightens and sets brow hairs in an upward position for a fluffy, full brow look.',
        benefits: ['Lasts 6-8 weeks', 'Low maintenance', 'Natural finish'],
        pricing: [
          { artistType: 'lulu', price: 25000 },
          { artistType: 'senior', price: 18000 },
          { artistType: 'artist', price: 12000 },
        ],
        duration: 60,
        requirements: ['No brow tint within 2 weeks', 'Clean brows'],
        aftercare: ['Avoid water for 24 hours', 'Apply brow serum daily'],
        isActive: true,
        displayOrder: 6,
      },
      {
        name: 'Brow Tinting',
        category: 'brows',
        description: 'Semi-permanent dye applied to brows to enhance color, shape and fullness.',
        benefits: ['Lasts 3-4 weeks', 'Defines brows', 'Natural look'],
        pricing: [
          { artistType: 'lulu', price: 10000 },
          { artistType: 'senior', price: 8000 },
          { artistType: 'artist', price: 6000 },
        ],
        duration: 30,
        requirements: ['Patch test 24 hours before if sensitive skin'],
        aftercare: ['Avoid water for 12 hours', 'No exfoliation on brow area'],
        isActive: true,
        displayOrder: 7,
      },
      {
        name: 'Brow Lamination + Tint',
        category: 'brows',
        description: 'Combined treatment for lamination and tinting — the ultimate brow transformation.',
        benefits: ['Full brow transformation', 'Lasts 6-8 weeks', 'One appointment'],
        pricing: [
          { artistType: 'lulu', price: 30000 },
          { artistType: 'senior', price: 22000 },
          { artistType: 'artist', price: 16000 },
        ],
        duration: 75,
        requirements: ['Clean brows', 'No previous tint within 2 weeks'],
        aftercare: ['Avoid water for 24 hours', 'Apply brow serum', 'No exfoliation'],
        isActive: true,
        displayOrder: 8,
      },

      // ── SIGNATURE ─────────────────────────────────────────────────────────
      {
        name: 'Full Glam Package',
        category: 'signature',
        description: 'Our signature package — volume lashes + brow lamination + tint for a complete transformation.',
        benefits: ['Complete look', 'Best value', 'VIP experience'],
        pricing: [
          { artistType: 'lulu', price: 70000 },
          { artistType: 'senior', price: 55000 },
          { artistType: 'artist', price: 40000 },
        ],
        duration: 180,
        requirements: ['Clean face, no makeup', 'Remove contact lenses', 'Patch test if sensitive'],
        aftercare: ['Avoid water for 24 hours', 'Follow individual aftercare for each treatment'],
        isActive: true,
        displayOrder: 9,
      },
    ];

    const created = await Service.insertMany(services);

    res.status(201).json({
      success: true,
      message: `${created.length} services seeded successfully!`,
      data: created
    });
  } catch (error) {
    next(error);
  }
};