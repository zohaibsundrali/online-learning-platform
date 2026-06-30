const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Module title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Module description is required'],
  },
  duration: {
    type: Number,
    required: true,
    min: [1, 'Duration must be at least 1 minute'],
  },
  videoUrl: {
    type: String,
    required: [true, 'Video URL is required'],
  },
  resources: [
    {
      title: String,
      url: String,
    },
  ],
  isFree: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Course description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Web Development',
        'Data Science',
        'Mobile Development',
        'DevOps',
        'Cloud Computing',
        'Cybersecurity',
        'AI & Machine Learning',
        'Business',
        'Design',
        'Marketing',
      ],
    },
    level: {
      type: String,
      required: [true, 'Level is required'],
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    },
    price: {
      type: Number,
      required: [true, 'Course price is required'],
      min: [0, 'Price cannot be negative'],
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    instructorName: {
      type: String,
      required: true,
    },
    instructorBio: {
      type: String,
      maxlength: [500, 'Instructor bio cannot exceed 500 characters'],
    },
    modules: [moduleSchema],
    totalDuration: {
      type: Number,
      default: 0,
    },
    studentsEnrolled: {
      type: Number,
      default: 0,
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail is required'],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    prerequisites: [String],
    learningObjectives: [String],
    tags: [String],
    whatYouWillLearn: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ FIXED: Pre-save middleware - Using async/await without next
courseSchema.pre('save', async function() {
  try {
    console.log('📚 Course pre-save middleware called');
    console.log('📚 Title:', this.title);
    
    // Generate slug from title
    if (this.title) {
      this.slug = this.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      console.log('📚 Generated slug:', this.slug);
    }
    
    // Calculate total duration
    if (this.modules && this.modules.length > 0) {
      this.totalDuration = this.modules.reduce(
        (total, module) => total + (module.duration || 0),
        0
      );
    }
    
    console.log('✅ Pre-save completed successfully');
    return; // Just return, don't call next
  } catch (error) {
    console.error('❌ Pre-save error:', error);
    throw error; // Throw error instead of next(error)
  }
});

// Virtual for number of modules
courseSchema.virtual('moduleCount').get(function () {
  return this.modules ? this.modules.length : 0;
});

// Index for search
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
// Index for slug
courseSchema.index({ slug: 1 });

module.exports = mongoose.model('Course', courseSchema);