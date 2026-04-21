const Score = require('../models/Score');

// @desc    Get my scores
// @route   GET /api/scores/me
// @access  Private + Subscription
exports.getMyScores = async (req, res, next) => {
  try {
    const scoreDoc = await Score.findOne({ user: req.user._id });
    res.json({ success: true, entries: scoreDoc ? scoreDoc.entries : [] });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new score
// @route   POST /api/scores
// @access  Private + Subscription
exports.addScore = async (req, res, next) => {
  try {
    const { value, date } = req.body;

    // Validate score value
    const numValue = parseInt(value);
    if (isNaN(numValue) || numValue < 1 || numValue > 45) {
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 45' });
    }

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    let scoreDoc = await Score.findOne({ user: req.user._id });

    // Should always exist (created at registration), but safety check
    if (!scoreDoc) {
      scoreDoc = await Score.create({ user: req.user._id, entries: [] });
    }

    scoreDoc.addScore(numValue, date); // This validates duplicate dates
    await scoreDoc.save();

    res.status(201).json({ success: true, entries: scoreDoc.entries });
  } catch (error) {
    // Return validation errors as 400
    if (error.message.includes('already exists') || error.message.includes('must be')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Edit a score entry
// @route   PUT /api/scores/:entryId
// @access  Private + Subscription
exports.editScore = async (req, res, next) => {
  try {
    const { value, date } = req.body;
    const numValue = parseInt(value);

    if (isNaN(numValue) || numValue < 1 || numValue > 45) {
      return res.status(400).json({ success: false, message: 'Score must be between 1 and 45' });
    }

    const scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc) {
      return res.status(404).json({ success: false, message: 'No scores found' });
    }

    scoreDoc.editScore(req.params.entryId, numValue, date);
    await scoreDoc.save();

    res.json({ success: true, entries: scoreDoc.entries });
  } catch (error) {
    if (error.message.includes('not found') || error.message.includes('already exists')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Delete a score entry
// @route   DELETE /api/scores/:entryId
// @access  Private + Subscription
exports.deleteScore = async (req, res, next) => {
  try {
    const scoreDoc = await Score.findOne({ user: req.user._id });
    if (!scoreDoc) {
      return res.status(404).json({ success: false, message: 'No scores found' });
    }

    scoreDoc.deleteScore(req.params.entryId);
    await scoreDoc.save();

    res.json({ success: true, entries: scoreDoc.entries });
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    next(error);
  }
};

// @desc    Admin: get all users' scores
// @route   GET /api/scores (admin)
// @access  Admin
exports.getAllScores = async (req, res, next) => {
  try {
    const scores = await Score.find()
      .populate('user', 'name email')
      .sort({ updatedAt: -1 });

    res.json({ success: true, scores });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: edit a user's score
// @route   PUT /api/scores/admin/:userId/:entryId
// @access  Admin
exports.adminEditScore = async (req, res, next) => {
  try {
    const { value, date } = req.body;
    const scoreDoc = await Score.findOne({ user: req.params.userId });
    if (!scoreDoc) {
      return res.status(404).json({ success: false, message: 'Score document not found' });
    }

    scoreDoc.editScore(req.params.entryId, parseInt(value), date);
    await scoreDoc.save();

    res.json({ success: true, entries: scoreDoc.entries });
  } catch (error) {
    next(error);
  }
};
