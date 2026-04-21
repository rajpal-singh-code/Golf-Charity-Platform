const mongoose = require('mongoose');

const drawSchema = new mongoose.Schema(
  {
    month: {
      type: Number, // 0-11
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    // The 5 winning numbers (values 1-45)
    winningNumbers: {
      type: [Number],
      default: [],
    },
    drawType: {
      type: String,
      enum: ['random', 'algorithmic'],
      default: 'random',
    },
    status: {
      type: String,
      enum: ['pending', 'simulated', 'published'],
      default: 'pending',
    },
    // Total prize pool for this draw
    totalPrizePool: {
      type: Number,
      default: 0,
    },
    // Prize pool breakdown
    jackpotPool: {
      type: Number,
      default: 0,
    },
    fourMatchPool: {
      type: Number,
      default: 0,
    },
    threeMatchPool: {
      type: Number,
      default: 0,
    },
    // Jackpot rollover amount from previous month
    rolloverAmount: {
      type: Number,
      default: 0,
    },
    // Total subscribers participating in this draw
    participantCount: {
      type: Number,
      default: 0,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    runBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

// Compound unique index: only one draw per month/year
drawSchema.index({ month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Draw', drawSchema);
