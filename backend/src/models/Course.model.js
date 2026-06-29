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
    type: Number, // in minutes
    required: true,
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
});

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Course title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
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
  },
  {
    timestamps: true,
  }
);

// Calculate total duration before saving
courseSchema.pre('save', function (next) {
  if (this.modules && this.modules.length > 0) {
    this.totalDuration = this.modules.reduce(
      (total, module) => total + module.duration,
      0
    );
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);