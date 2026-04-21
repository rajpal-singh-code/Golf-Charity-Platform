const Charity = require('../models/Charity');
const User = require('../models/User');

// @desc    Get all active charities
// @route   GET /api/charities
// @access  Public
exports.getCharities = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const charities = await Charity.find(query).sort({ isFeatured: -1, name: 1 });
    res.json({ success: true, charities });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single charity
// @route   GET /api/charities/:id
// @access  Public
exports.getCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
    res.json({ success: true, charity });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: create charity
// @route   POST /api/charities
// @access  Admin
exports.createCharity = async (req, res, next) => {
  try {
    const charity = await Charity.create(req.body);
    res.status(201).json({ success: true, charity });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update charity
// @route   PUT /api/charities/:id
// @access  Admin
exports.updateCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });
    res.json({ success: true, charity });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: delete charity
// @route   DELETE /api/charities/:id
// @access  Admin
exports.deleteCharity = async (req, res, next) => {
  try {
    const charity = await Charity.findById(req.params.id);
    if (!charity) return res.status(404).json({ success: false, message: 'Charity not found' });

    // Soft delete — deactivate rather than remove
    charity.isActive = false;
    await charity.save();

    res.json({ success: true, message: 'Charity deactivated' });
  } catch (error) {
    next(error);
  }
};
