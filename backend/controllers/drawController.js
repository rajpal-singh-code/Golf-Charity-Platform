const Draw = require('../models/Draw');
const Winner = require('../models/Winner');
const Score = require('../models/Score');
const Subscription = require('../models/Subscription');
const User = require('../models/User');
const { sendDrawResultsEmail } = require('../utils/email');

// ── PRIZE POOL DISTRIBUTION ──────────────────────────────────────
const POOL_SPLITS = { '5-match': 0.40, '4-match': 0.35, '3-match': 0.25 };

// Generate 5 unique random numbers between 1 and 45
const generateRandomNumbers = () => {
  const nums = new Set();
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(nums).sort((a, b) => a - b);
};

// Algorithmic draw: weighted by user score frequency
const generateAlgorithmicNumbers = async () => {
  const allScores = await Score.find({ 'entries.0': { $exists: true } });

  const frequency = {};
  allScores.forEach((doc) => {
    doc.entries.forEach((entry) => {
      frequency[entry.value] = (frequency[entry.value] || 0) + 1;
    });
  });

  // Weighted pool: more frequent scores get more "slots"
  const pool = [];
  for (let i = 1; i <= 45; i++) {
    const weight = frequency[i] || 1;
    for (let j = 0; j < weight; j++) pool.push(i);
  }

  const nums = new Set();
  while (nums.size < 5 && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    nums.add(pool[idx]);
  }
  // Fill remaining with random if pool exhausted
  while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1);

  return Array.from(nums).sort((a, b) => a - b);
};

// Count how many of a user's scores match the winning numbers
const countMatches = (userScores, winningNumbers) => {
  return userScores.filter((s) => winningNumbers.includes(s)).length;
};

// ── CONTROLLERS ──────────────────────────────────────────────────

// @desc    Create/initialize a draw for this month
// @route   POST /api/draws
// @access  Admin
exports.createDraw = async (req, res, next) => {
  try {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    // Check if draw already exists for this month
    const existing = await Draw.findOne({ month, year });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: `Draw for ${month + 1}/${year} already exists`,
      });
    }

    // Calculate prize pool from active subscriptions
    const activeSubs = await Subscription.find({ status: 'active' });
    const totalPool = activeSubs.reduce((sum, s) => sum + s.prizePoolContribution, 0);

    // Check for jackpot rollover from previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevYear = month === 0 ? year - 1 : year;
    const prevDraw = await Draw.findOne({ month: prevMonth, year: prevYear, status: 'published' });

    let rollover = 0;
    if (prevDraw) {
      const prevJackpotWinner = await Winner.findOne({ draw: prevDraw._id, matchType: '5-match' });
      if (!prevJackpotWinner) {
        rollover = prevDraw.jackpotPool; // No 5-match winner last month → rollover
      }
    }

    const jackpotPool = parseFloat((totalPool * POOL_SPLITS['5-match'] + rollover).toFixed(2));
    const fourMatchPool = parseFloat((totalPool * POOL_SPLITS['4-match']).toFixed(2));
    const threeMatchPool = parseFloat((totalPool * POOL_SPLITS['3-match']).toFixed(2));

    const draw = await Draw.create({
      month,
      year,
      totalPrizePool: totalPool,
      jackpotPool,
      fourMatchPool,
      threeMatchPool,
      rolloverAmount: rollover,
      participantCount: activeSubs.length,
      runBy: req.user._id,
    });

    res.status(201).json({ success: true, draw });
  } catch (error) {
    next(error);
  }
};

// @desc    Run/simulate a draw (generates numbers, finds winners)
// @route   POST /api/draws/:id/run
// @access  Admin
exports.runDraw = async (req, res, next) => {
  try {
    const { drawType = 'random', simulate = false } = req.body;

    const draw = await Draw.findById(req.params.id);
    if (!draw) return res.status(404).json({ success: false, message: 'Draw not found' });
    if (draw.status === 'published') {
      return res.status(400).json({ success: false, message: 'Draw already published' });
    }

    // Generate winning numbers
    const winningNumbers =
      drawType === 'algorithmic'
        ? await generateAlgorithmicNumbers()
        : generateRandomNumbers();

    draw.winningNumbers = winningNumbers;
    draw.drawType = drawType;

    if (!simulate) {
      // OFFICIAL RUN: find winners among active subscribers with scores
      const activeSubUsers = await Subscription.find({ status: 'active' }).select('user');
      const activeUserIds = activeSubUsers.map((s) => s.user);

      const scoreDocs = await Score.find({
        user: { $in: activeUserIds },
        'entries.0': { $exists: true }, // Only users with at least 1 score
      });

      // Clear old winner records for this draw (in case re-run)
      await Winner.deleteMany({ draw: draw._id });

      const winners = { '5-match': [], '4-match': [], '3-match': [] };

      for (const scoreDoc of scoreDocs) {
        const userScores = scoreDoc.entries.map((e) => e.value);
        const matchCount = countMatches(userScores, winningNumbers);

        if (matchCount >= 3) {
          const type = matchCount === 5 ? '5-match' : matchCount === 4 ? '4-match' : '3-match';
          winners[type].push({ userId: scoreDoc.user, userScores, matchCount });
        }
      }

      // Get prize pool references
      const poolMap = {
        '5-match': draw.jackpotPool,
        '4-match': draw.fourMatchPool,
        '3-match': draw.threeMatchPool,
      };

      // Create winner records and split prize equally
      for (const [type, winnerList] of Object.entries(winners)) {
        if (winnerList.length === 0) continue;
        const prizePerWinner = parseFloat((poolMap[type] / winnerList.length).toFixed(2));

        for (const w of winnerList) {
          await Winner.create({
            draw: draw._id,
            user: w.userId,
            matchType: type,
            userScores: w.userScores,
            matchedCount: w.matchCount,
            prizeAmount: prizePerWinner,
          });

          // Update user's total winnings
          await User.findByIdAndUpdate(w.userId, { $inc: { totalWinnings: prizePerWinner } });

          // Send notification email
          const user = await User.findById(w.userId);
          if (user) sendDrawResultsEmail(user, draw, type, prizePerWinner).catch(console.error);
        }
      }

      draw.status = 'published';
      draw.publishedAt = new Date();
    } else {
      draw.status = 'simulated';
    }

    await draw.save();

    res.json({
      success: true,
      draw,
      message: simulate ? 'Draw simulated (not published)' : 'Draw published successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all draws
// @route   GET /api/draws
// @access  Public
exports.getAllDraws = async (req, res, next) => {
  try {
    const draws = await Draw.find({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .limit(12);

    res.json({ success: true, draws });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all draws (admin view)
// @route   GET /api/draws/admin
// @access  Admin
exports.getAllDrawsAdmin = async (req, res, next) => {
  try {
    const draws = await Draw.find().sort({ year: -1, month: -1 }).populate('runBy', 'name');
    res.json({ success: true, draws });
  } catch (error) {
    next(error);
  }
};

// @desc    Get latest published draw
// @route   GET /api/draws/latest
// @access  Public
exports.getLatestDraw = async (req, res, next) => {
  try {
    const draw = await Draw.findOne({ status: 'published' }).sort({ year: -1, month: -1 });
    res.json({ success: true, draw });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's draw participation history + wins
// @route   GET /api/draws/my-history
// @access  Private
exports.getMyDrawHistory = async (req, res, next) => {
  try {
    const wins = await Winner.find({ user: req.user._id })
      .populate('draw', 'month year winningNumbers status')
      .sort({ createdAt: -1 });

    res.json({ success: true, wins });
  } catch (error) {
    next(error);
  }
};
