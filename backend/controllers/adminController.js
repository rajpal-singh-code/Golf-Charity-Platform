const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Winner = require('../models/Winner');
const Draw = require('../models/Draw');
const Charity = require('../models/Charity');
const Score = require('../models/Score');

// @desc    Admin dashboard analytics
// @route   GET /api/admin/stats
// @access  Admin
exports.getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeSubscriptions,
      totalDraws,
      pendingWinners,
      totalCharities,
      totalRevenue,
      totalPrizePool,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Subscription.countDocuments({ status: 'active' }),
      Draw.countDocuments({ status: 'published' }),
      Winner.countDocuments({ verificationStatus: 'proof_submitted' }),
      Charity.countDocuments({ isActive: true }),
      Subscription.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      Subscription.aggregate([{ $group: { _id: null, total: { $sum: '$prizePoolContribution' } } }]),
    ]);

    // Recent users
    const recentUsers = await User.find({ role: 'user' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt');

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeSubscriptions,
        totalDraws,
        pendingWinners,
        totalCharities,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalPrizePool: totalPrizePool[0]?.total || 0,
        recentUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' })
      .populate('selectedCharity', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user with full details
// @route   GET /api/admin/users/:id
// @access  Admin
exports.getUserDetail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).populate('selectedCharity', 'name');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [subscription, scores, wins] = await Promise.all([
      Subscription.findOne({ user: user._id }),
      Score.findOne({ user: user._id }),
      Winner.find({ user: user._id }).populate('draw', 'month year'),
    ]);

    res.json({ success: true, user, subscription, scores, wins });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user (name, role, isActive)
// @route   PUT /api/admin/users/:id
// @access  Admin
exports.updateUser = async (req, res, next) => {
  try {
    const { name, role, isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role, isActive },
      { new: true, runValidators: true }
    );

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Soft delete
    user.isActive = false;
    await user.save();

    res.json({ success: true, message: 'User deactivated' });
  } catch (error) {
    next(error);
  }
};
