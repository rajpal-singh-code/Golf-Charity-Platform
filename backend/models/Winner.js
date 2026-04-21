const mongoose = require('mongoose');

const winnerSchema = new mongoose.Schema(
  {
    draw: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Draw',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Which tier they won
    matchType: {
      type: String,
      enum: ['5-match', '4-match', '3-match'],
      required: true,
    },
    // Their scores that participated
    userScores: {
      type: [Number],
      required: true,
    },
    // How many numbers matched
    matchedCount: {
      type: Number,
      required: true,
    },
    // Prize amount awarded
    prizeAmount: {
      type: Number,
      default: 0,
    },
    // Verification flow
    verificationStatus: {
      type: String,
      enum: ['pending', 'proof_submitted', 'approved', 'rejected'],
      default: 'pending',
    },
    proofImageUrl: {
      type: String,
      default: null,
    },
    proofSubmittedAt: {
      type: Date,
      default: null,
    },
    // Payment flow
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    paidAt: {
      type: Date,
      default: null,
    },
    adminNotes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Winner', winnerSchema);
