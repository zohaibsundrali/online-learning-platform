const mongoose = require('mongoose');

/**
 * Activity Model - Tracks user activities and events
 * Used for:
 * - Recent activity timeline on dashboard
 * - User engagement tracking
 * - Learning progress events
 * - Notification system (future)
 */
const activitySchema = new mongoose.Schema(
  {
    // User who performed the activity
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    
    // Type of activity
    type: {
      type: String,
      enum: [
        'course_enrolled',      // Student enrolled in a course
        'module_completed',     // Student completed a module/lesson
        'course_completed',     // Student completed the entire course
        'review_posted',        // Student posted a course review
        'achievement_unlocked', // Student unlocked an achievement/badge
        'profile_updated',      // Student updated their profile
        'course_created',       // Instructor created a new course
        'course_published',     // Instructor published a course
        'certificate_downloaded', // Student downloaded their certificate
      ],
      required: true,
      index: true,
    },
    
    // Human-readable description of the activity
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    
    // Additional metadata for context
    metadata: {
      // Course related metadata
      courseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
      courseTitle: {
        type: String,
        trim: true,
      },
      
      // Module related metadata
      moduleId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      moduleTitle: {
        type: String,
        trim: true,
      },
      
      // Review related metadata
      reviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review',
      },
      rating: {
        type: Number,
        min: 1,
        max: 5,
      },
      
      // Achievement related metadata
      achievementId: {
        type: String,
      },
      achievementName: {
        type: String,
      },
      
      // Flexible metadata for future use
      extra: {
        type: mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    
    // Whether the user has seen/read this activity
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    // IP address (for analytics)
    ipAddress: {
      type: String,
      default: null,
    },
    
    // User agent (for analytics)
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

// Compound indexes for efficient queries
activitySchema.index({ user: 1, createdAt: -1 });
activitySchema.index({ user: 1, read: 1 });
activitySchema.index({ type: 1, createdAt: -1 });
activitySchema.index({ 'metadata.courseId': 1, createdAt: -1 });

// Virtual to get time ago
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

// Virtual to get activity icon type
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

// Virtual to get activity color
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

// Static method to create activity with common patterns
activitySchema.statics.logActivity = async function(data) {
  const { user, type, description, metadata = {}, ipAddress = null, userAgent = null } = data;
  
  // Validate required fields
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

// Static method to get recent activities for a user
activitySchema.statics.getRecentActivities = async function(userId, limit = 10) {
  return await this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
};

// Static method to get unread count for a user
activitySchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    user: userId,
    read: false,
  });
};

// Static method to mark all activities as read
activitySchema.statics.markAllAsRead = async function(userId) {
  return await this.updateMany(
    { user: userId, read: false },
    { read: true }
  );
};

// Pre-save middleware to ensure metadata has course info when available
activitySchema.pre('save', function(next) {
  // If the description contains a course title, extract it
  if (!this.metadata.courseTitle && this.description.includes('"')) {
    const match = this.description.match(/"([^"]+)"/);
    if (match) {
      this.metadata.courseTitle = match[1];
    }
  }
  next();
});

module.exports = mongoose.model('Activity', activitySchema);