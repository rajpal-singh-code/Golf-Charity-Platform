const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One subscription per user
    },
    plan: {
      type: String,
      enum: ['monthly', 'yearly'],
      required: true,
    },
    // Plan amounts in currency units
    amount: {
      type: Number,
      required: true,
      // monthly = 10, yearly = 100 (example pricing)
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'cancelled', 'lapsed'],
      default: 'active',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    renewalDate: {
      type: Date,
    },
    // Prize pool contribution (amount - charity portion)
    prizePoolContribution: {
      type: Number,
      default: 0,
    },
    // Charity contribution amount
    charityContribution: {
      type: Number,
      default: 0,
    },
    paymentReference: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

// Calculate end date based on plan before saving
subscriptionSchema.pre('save', function (next) {
  if (this.isNew) {
    const now = new Date();
    if (this.plan === 'monthly') {
      this.endDate = new Date(now.setMonth(now.getMonth() + 1));
    } else {
      this.endDate = new Date(now.setFullYear(now.getFullYear() + 1));
    }
    this.renewalDate = this.endDate;
  }
  next();
});

module.exports = mongoose.model('Subscription', subscriptionSchema);
