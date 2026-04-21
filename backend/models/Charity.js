const mongoose = require('mongoose');

const charitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Charity name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    imageUrl: {
      type: String,
      default: null,
    },
    website: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      enum: ['health', 'education', 'environment', 'sports', 'community', 'other'],
      default: 'other',
    },
    totalReceived: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    upcomingEvents: [
      {
        title: String,
        date: Date,
        description: String,
      },
    ],
    subscriberCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Charity', charitySchema);
