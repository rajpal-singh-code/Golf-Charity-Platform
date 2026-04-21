const Subscription = require('../models/Subscription');
const { sendSubscriptionConfirmation } = require('../utils/email');

// Plan pricing (in your currency, e.g. GBP)
const PLAN_PRICES = { monthly: 10, yearly: 100 };

// @desc    Subscribe to a plan
// @route   POST /api/subscriptions
// @access  Private
exports.subscribe = async (req, res, next) => {
  try {
    const { plan } = req.body;

    if (!['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Plan must be monthly or yearly' });
    }

    // Check if user already has an active subscription
    const existing = await Subscription.findOne({ user: req.user._id });
    if (existing && existing.status === 'active' && new Date() < new Date(existing.endDate)) {
      return res.status(400).json({ success: false, message: 'You already have an active subscription' });
    }

    const amount = PLAN_PRICES[plan];
    const charityPct = req.user.charityPercentage || 10;
    const charityContribution = parseFloat(((amount * charityPct) / 100).toFixed(2));
    const prizePoolContribution = parseFloat((amount - charityContribution).toFixed(2));

    let subscription;

    if (existing) {
      // Reactivate/update existing subscription
      existing.plan = plan;
      existing.amount = amount;
      existing.status = 'active';
      existing.startDate = new Date();
      existing.charityContribution = charityContribution;
      existing.prizePoolContribution = prizePoolContribution;

      const now = new Date();
      existing.endDate =
        plan === 'monthly'
          ? new Date(now.setMonth(now.getMonth() + 1))
          : new Date(now.setFullYear(now.getFullYear() + 1));
      existing.renewalDate = existing.endDate;

      subscription = await existing.save();
    } else {
      subscription = await Subscription.create({
        user: req.user._id,
        plan,
        amount,
        charityContribution,
        prizePoolContribution,
      });
    }

    // Send confirmation email
    sendSubscriptionConfirmation(req.user, plan).catch(console.error);

    res.status(201).json({ success: true, subscription });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's subscription
// @route   GET /api/subscriptions/me
// @access  Private
exports.getMySubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    res.json({ success: true, subscription });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel subscription
// @route   PUT /api/subscriptions/cancel
// @access  Private
exports.cancelSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ user: req.user._id });
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'No subscription found' });
    }

    subscription.status = 'cancelled';
    await subscription.save();

    res.json({ success: true, message: 'Subscription cancelled', subscription });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all subscriptions
// @route   GET /api/subscriptions (admin)
// @access  Admin
exports.getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });

    const totalRevenue = subscriptions.reduce((sum, s) => sum + s.amount, 0);
    const activeCount = subscriptions.filter((s) => s.status === 'active').length;

    res.json({ success: true, subscriptions, totalRevenue, activeCount });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: update subscription status
// @route   PUT /api/subscriptions/:id (admin)
// @access  Admin
exports.updateSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate('user', 'name email');

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    res.json({ success: true, subscription });
  } catch (error) {
    next(error);
  }
};
