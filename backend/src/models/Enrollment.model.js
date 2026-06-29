const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    enrolledAt: {
      type: Date,
      default: Date.now,
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    completedModules: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active',
    },
    completionDate: {
      type: Date,
      default: null,
    },
    lastAccessed: {
      type: Date,
      default: Date.now,
    },
    certificateUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can enroll in a course only once
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);