const User = require('../models/User');
const Score = require('../models/Score');
const generateToken = require('../utils/generateToken');
const { sendWelcomeEmail } = require('../utils/email');

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, selectedCharity, charityPercentage } = req.body;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Validate charity percentage
    const charityPct = charityPercentage ? parseInt(charityPercentage) : 10;
    if (charityPct < 10 || charityPct > 100) {
      return res.status(400).json({
        success: false,
        message: 'Charity percentage must be between 10 and 100',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      selectedCharity: selectedCharity || null,
      charityPercentage: charityPct,
    });

    // Create an empty Score document for this user
    await Score.create({ user: user._id, entries: [] });

    // Send welcome email (non-blocking)
    sendWelcomeEmail(user).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        selectedCharity: user.selectedCharity,
        charityPercentage: user.charityPercentage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    // Include password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account has been deactivated' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        selectedCharity: user.selectedCharity,
        charityPercentage: user.charityPercentage,
        totalWinnings: user.totalWinnings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('selectedCharity', 'name imageUrl');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update profile (name, charity, charityPercentage)
// @route   PUT /api/auth/me
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, selectedCharity, charityPercentage } = req.body;

    const updates = {};
    if (name) updates.name = name;
    if (selectedCharity) updates.selectedCharity = selectedCharity;
    if (charityPercentage) {
      const pct = parseInt(charityPercentage);
      if (pct < 10 || pct > 100) {
        return res.status(400).json({ success: false, message: 'Charity % must be 10–100' });
      }
      updates.charityPercentage = pct;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).populate('selectedCharity', 'name imageUrl');

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
