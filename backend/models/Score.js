const mongoose = require('mongoose');

// A single score entry
const scoreEntrySchema = new mongoose.Schema({
  value: {
    type: Number,
    required: true,
    min: [1, 'Score must be at least 1'],
    max: [45, 'Score cannot exceed 45'],
  },
  date: {
    type: Date,
    required: true,
  },
});

// The Score document holds all 5 scores for a user
const scoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One Score document per user
    },
    // Array of last 5 scores, sorted newest first
    entries: {
      type: [scoreEntrySchema],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 5;
        },
        message: 'Maximum 5 score entries allowed',
      },
    },
  },
  { timestamps: true }
);

// Method: add a new score, enforce rolling 5-entry limit, prevent duplicate dates
scoreSchema.methods.addScore = function (value, date) {
  const inputDate = new Date(date);
  // Normalize to date-only for comparison
  const inputDateStr = inputDate.toISOString().split('T')[0];

  // Check for duplicate date
  const duplicate = this.entries.find((entry) => {
    const entryDateStr = new Date(entry.date).toISOString().split('T')[0];
    return entryDateStr === inputDateStr;
  });

  if (duplicate) {
    throw new Error('A score already exists for this date. Edit or delete the existing entry.');
  }

  // Add new score
  this.entries.push({ value, date: inputDate });

  // Sort by date descending (newest first)
  this.entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Keep only the latest 5
  if (this.entries.length > 5) {
    this.entries = this.entries.slice(0, 5);
  }
};

// Method: edit an existing score by its _id
scoreSchema.methods.editScore = function (entryId, newValue, newDate) {
  const entry = this.entries.id(entryId);
  if (!entry) throw new Error('Score entry not found');

  const newDateStr = new Date(newDate).toISOString().split('T')[0];

  // Check duplicate date (excluding the current entry)
  const duplicate = this.entries.find((e) => {
    if (e._id.toString() === entryId) return false;
    return new Date(e.date).toISOString().split('T')[0] === newDateStr;
  });

  if (duplicate) throw new Error('Another score already exists for this date.');

  entry.value = newValue;
  entry.date = new Date(newDate);

  // Re-sort after edit
  this.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Method: delete a score entry by its _id
scoreSchema.methods.deleteScore = function (entryId) {
  const index = this.entries.findIndex((e) => e._id.toString() === entryId);
  if (index === -1) throw new Error('Score entry not found');
  this.entries.splice(index, 1);
};

module.exports = mongoose.model('Score', scoreSchema);
