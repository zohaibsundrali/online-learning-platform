const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'course_enrolled',
        'module_completed',
        'course_completed',
        'review_posted',
        'achievement_unlocked',
        'profile_updated',
        'course_created',
        'course_published',
        'certificate_downloaded',
      ],
      required: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    metadata: {
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      courseTitle: {
        type: String,
        trim: true,
      },
      moduleId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      moduleTitle: {
        type: String,
        trim: true,
      },
      reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      achievementId: {
        type: String,
      },
      achievementName: {
        type: String,
      },
      extra: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ user: 1, read: 1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ 'metadata.courseId': 1, createdAt: -1 });

// Virtuals
activitySchema.virtual('timeAgo').get(function () {
  const now = new Date();
  const diff = Math.floor((now - this.createdAt) / 1000);
  
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
});

activitySchema.virtual('iconType').get(function () {
  const iconMap = {
    'course_enrolled': 'book-open',
    'module_completed': 'check-circle',
    'course_completed': 'award',
    'review_posted': 'star',
    'achievement_unlocked': 'trophy',
    'profile_updated': 'user',
    'course_created': 'plus-circle',
    'course_published': 'globe',
    'certificate_downloaded': 'file-text',
  };
  return iconMap[this.type] || 'activity';
});

activitySchema.virtual('color').get(function () {
  const colorMap = {
    'course_enrolled': '#8AA39B',
    'module_completed': '#C08B5C',
    'course_completed': '#E07A5F',
    'review_posted': '#E07A5F',
    'achievement_unlocked': '#8AA39B',
    'profile_updated': '#8AA39B',
    'course_created': '#8AA39B',
    'course_published': '#8AA39B',
    'certificate_downloaded': '#C08B5C',
  };
  return colorMap[this.type] || '#DBE2DC';
});

// ✅ FIXED: Static methods
activitySchema.statics.logActivity = async function(data) {
  const { user, type, description, metadata = {}, ipAddress = null, userAgent = null } = data;
  
  if (!user || !type || !description) {
    throw new Error('User, type, and description are required');
  }
  
  const activity = new this({
    user,
    type,
    description,
    metadata,
    ipAddress,
    userAgent,
  });
  
  return await activity.save();
};

activitySchema.statics.getRecentActivities = async function(userId, limit = 10) {
  return await this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

activitySchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    user: userId,
    read: false,
  });
};

activitySchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { user: userId, read: false },
    { read: true }
  );
};

// ✅ FIXED: Pre-save middleware - properly call next()
activitySchema.pre('save', async function() {
  try {
    // If the description contains a course title, extract it
    if (!this.metadata.courseTitle && this.description) {
      const match = this.description.match(/"([^"]+)"/);
      if (match) {
        this.metadata.courseTitle = match[1];
      }
    }
    return; // Just return, don't call next
  } catch (error) {
    console.error('❌ Activity pre-save error:', error);
    throw error;
  }
});

module.exports = mongoose.model('Activity', activitySchema);