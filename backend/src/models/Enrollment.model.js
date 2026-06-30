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
    // Track completed modules with timestamps
    completedModules: [
      {
        moduleId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        completedAt: {
          type: Date,
          default: Date.now,
        },
      }
    ],
    // Track last accessed module for resume functionality
    lastAccessedModule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course.modules',
    },
    lastAccessedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'dropped'],
      default: 'active',
    },
    completionDate: {
      type: Date,
      default: null,
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

// Indexes for performance
enrollmentSchema.index({ user: 1, course: 1 });
enrollmentSchema.index({ user: 1, status: 1 });
enrollmentSchema.index({ course: 1, status: 1 });

// Virtual to check if course is completed
enrollmentSchema.virtual('isCompleted').get(function () {
  return this.status === 'completed';
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);