const express = require('express');
const router = express.Router();
const {
  subscribe,
  getMySubscription,
  cancelSubscription,
  getAllSubscriptions,
  updateSubscription,
} = require('../controllers/subscriptionController');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', protect, subscribe);
router.get('/me', protect, getMySubscription);
router.put('/cancel', protect, cancelSubscription);

// Admin routes
router.get('/', protect, adminOnly, getAllSubscriptions);
router.put('/:id', protect, adminOnly, updateSubscription);

module.exports = router;
