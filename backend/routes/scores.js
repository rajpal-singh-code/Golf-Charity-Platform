const express = require('express');
const router = express.Router();
const {
  getMyScores,
  addScore,
  editScore,
  deleteScore,
  getAllScores,
  adminEditScore,
} = require('../controllers/scoreController');
const { protect, adminOnly, requireSubscription } = require('../middleware/auth');

// User routes (require active subscription)
router.get('/me', protect, requireSubscription, getMyScores);
router.post('/', protect, requireSubscription, addScore);
router.put('/:entryId', protect, requireSubscription, editScore);
router.delete('/:entryId', protect, requireSubscription, deleteScore);

// Admin routes
router.get('/', protect, adminOnly, getAllScores);
router.put('/admin/:userId/:entryId', protect, adminOnly, adminEditScore);

module.exports = router;
