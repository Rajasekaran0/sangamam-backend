const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['NSS', 'NSO', 'YRC', 'NCC'],
      required: [true, 'Club name is required'],
      unique: true,
    },
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    motto: {
      type: String,
      default: '',
    },
    stats: {
      activeMembers: { type: Number, default: 0 },
      annualPrograms: { type: Number, default: 0 },
      otherStatLabel: { type: String, default: '' },
      otherStatValue: { type: String, default: '' },
      serviceHours: { type: String, default: '' },
    },
    achievements: [
      {
        type: String,
      },
    ],
    focusAreas: [
      {
        type: String,
      },
    ],
    color: {
      type: String,
      default: '#1e3a8a',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Club', clubSchema);