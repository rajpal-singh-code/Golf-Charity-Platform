const Winner = require('../models/Winner');
const User = require('../models/User');
const { sendWinnerVerifiedEmail } = require('../utils/email');

// @desc    Get my winnings
// @route   GET /api/winners/me
// @access  Private
exports.getMyWinnings = async (req, res, next) => {
  try {
    const winners = await Winner.find({ user: req.user._id })
      .populate('draw', 'month year winningNumbers')
      .sort({ createdAt: -1 });

    res.json({ success: true, winners });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit proof for a win
// @route   PUT /api/winners/:id/proof
// @access  Private
exports.submitProof = async (req, res, next) => {
  try {
    const { proofImageUrl } = req.body;

    const winner = await Winner.findOne({ _id: req.params.id, user: req.user._id });
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner record not found' });
    }

    if (winner.verificationStatus !== 'pending') {
      return res.status(400).json({ success: false, message: 'Proof already submitted or processed' });
    }

    winner.proofImageUrl = proofImageUrl;
    winner.verificationStatus = 'proof_submitted';
    winner.proofSubmittedAt = new Date();
    await winner.save();

    res.json({ success: true, winner });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: get all winners
// @route   GET /api/winners
// @access  Admin
exports.getAllWinners = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.verificationStatus = status;

    const winners = await Winner.find(query)
      .populate('user', 'name email')
      .populate('draw', 'month year winningNumbers')
      .sort({ createdAt: -1 });

    res.json({ success: true, winners });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: approve or reject a winner
// @route   PUT /api/winners/:id/verify
// @access  Admin
exports.verifyWinner = async (req, res, next) => {
  try {
    const { action, adminNotes } = req.body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, message: 'Action must be approve or reject' });
    }

    const winner = await Winner.findById(req.params.id).populate('user', 'name email');
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner not found' });
    }

    winner.verificationStatus = action === 'approve' ? 'approved' : 'rejected';
    if (adminNotes) winner.adminNotes = adminNotes;

    if (action === 'approve') {
      // Send confirmation email
      sendWinnerVerifiedEmail(winner.user, winner.prizeAmount).catch(console.error);
    }

    await winner.save();
    res.json({ success: true, winner });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin: mark winner as paid
// @route   PUT /api/winners/:id/pay
// @access  Admin
exports.markAsPaid = async (req, res, next) => {
  try {
    const winner = await Winner.findById(req.params.id);
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner not found' });
    }

    if (winner.verificationStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'Winner must be approved before payment' });
    }

    winner.paymentStatus = 'paid';
    winner.paidAt = new Date();
    await winner.save();

    res.json({ success: true, winner });
  } catch (error) {
    next(error);
  }
};
