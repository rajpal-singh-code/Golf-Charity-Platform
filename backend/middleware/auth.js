const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes — verify JWT
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Admin access required' });
  }
};

// Check active subscription middleware
const requireSubscription = async (req, res, next) => {
  const Subscription = require('../models/Subscription');

  const subscription = await Subscription.findOne({
    user: req.user._id,
    status: 'active',
  });

  if (!subscription) {
    return res.status(403).json({
      success: false,
      message: 'Active subscription required',
      code: 'NO_SUBSCRIPTION',
    });
  }

  // Check if subscription has expired
  if (new Date() > new Date(subscription.endDate)) {
    subscription.status = 'lapsed';
    await subscription.save();
    return res.status(403).json({
      success: false,
      message: 'Subscription has expired',
      code: 'SUBSCRIPTION_EXPIRED',
    });
  }

  req.subscription = subscription;
  next();
};

module.exports = { protect, adminOnly, requireSubscription };
