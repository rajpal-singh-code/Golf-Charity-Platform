const express = require('express');
const router = express.Router();
const {
  getMyWinnings,
  submitProof,
  getAllWinners,
  verifyWinner,
  markAsPaid,
} = require('../controllers/winnerController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/me', protect, getMyWinnings);
router.put('/:id/proof', protect, submitProof);

// Admin
router.get('/', protect, adminOnly, getAllWinners);
router.put('/:id/verify', protect, adminOnly, verifyWinner);
router.put('/:id/pay', protect, adminOnly, markAsPaid);

module.exports = router;
