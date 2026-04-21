const express = require('express');
const router = express.Router();
const {
  createDraw,
  runDraw,
  getAllDraws,
  getAllDrawsAdmin,
  getLatestDraw,
  getMyDrawHistory,
} = require('../controllers/drawController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getAllDraws);
router.get('/latest', getLatestDraw);
router.get('/my-history', protect, getMyDrawHistory);
router.get('/admin', protect, adminOnly, getAllDrawsAdmin);
router.post('/', protect, adminOnly, createDraw);
router.post('/:id/run', protect, adminOnly, runDraw);

module.exports = router;
