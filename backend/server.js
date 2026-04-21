const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ── Middleware ────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://golf-charity-platform-fftg.vercel.app',
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Golf Charity Draw API is running 🏌️' });
});

// ── Routes ───────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/scores', require('./routes/scores'));
app.use('/api/draws', require('./routes/draws'));
app.use('/api/charities', require('./routes/charities'));
app.use('/api/winners', require('./routes/winners'));
app.use('/api/admin', require('./routes/admin'));

// ── 404 Handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──────────────────────────────────────────
app.use(errorHandler);

// ── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
