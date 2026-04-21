const nodemailer = require('nodemailer');

// Create transporter (uses env vars for real email, logs mock in development)
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // In development: log emails to console instead of sending
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n📧 [MOCK EMAIL] To: ${to} | Subject: ${subject}`);
    return;
  }

  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"Golf Charity Draw" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

// ── Email Templates ──────────────────────────────────────────────

exports.sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to Golf Charity Draw! 🏆',
    html: `
      <h2>Welcome, ${user.name}!</h2>
      <p>You've successfully joined the Golf Charity Draw platform.</p>
      <p>Start entering your scores and you could win big while supporting charity!</p>
    `,
  });
};

exports.sendSubscriptionConfirmation = async (user, plan) => {
  await sendEmail({
    to: user.email,
    subject: 'Subscription Confirmed ✅',
    html: `
      <h2>Subscription Confirmed</h2>
      <p>Hi ${user.name}, your <strong>${plan}</strong> subscription is now active.</p>
      <p>You are eligible to participate in monthly draws. Good luck!</p>
    `,
  });
};

exports.sendDrawResultsEmail = async (user, draw, matchType, prize) => {
  await sendEmail({
    to: user.email,
    subject: '🎉 You Won in the Monthly Draw!',
    html: `
      <h2>Congratulations, ${user.name}!</h2>
      <p>You matched <strong>${matchType}</strong> in the ${draw.month + 1}/${draw.year} draw.</p>
      <p>Prize Amount: <strong>£${prize}</strong></p>
      <p>Log in to submit your verification proof and claim your prize.</p>
    `,
  });
};

exports.sendWinnerVerifiedEmail = async (user, prize) => {
  await sendEmail({
    to: user.email,
    subject: 'Prize Verified — Payment Incoming 💰',
    html: `
      <h2>Your prize has been verified!</h2>
      <p>Hi ${user.name}, your prize of <strong>£${prize}</strong> has been approved.</p>
      <p>Payment will be processed shortly. Thank you for participating!</p>
    `,
  });
};
