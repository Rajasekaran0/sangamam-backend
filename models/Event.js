const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    club: {
      type: String,
      enum: ['NSS', 'NSO', 'YRC', 'NCC'],
      required: [true, 'Club is required'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    date: {
      type: String,
      required: [true, 'Date is required'],
    },
    time: {
      type: String,
      default: 'TBD',
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
    },
    status: {
      type: String,
      enum: [
        'Registration Open',
        'Registration Closes Soon',
        'Upcoming',
        'Completed',
        'Cancelled',
      ],
      default: 'Upcoming',
    },
    type: {
      type: String,
      default: 'General',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);