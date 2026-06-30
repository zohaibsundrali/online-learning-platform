const Course = require('../models/Course.model');
const Enrollment = require('../models/Enrollment.model');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const Activity = require('../models/Activity.model');

// @desc    Get all courses with filtering, sorting, pagination
// @route   GET /api/courses
// @access  Public
const getCourses = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const skip = (page - 1) * limit;

  const filter = { isPublished: true };
  
  if (req.query.category) {
    filter.category = req.query.category;
  }
  
  if (req.query.level) {
    filter.level = req.query.level;
  }
  
  if (req.query.search) {
    filter.$text = { $search: req.query.search };
  }
  
  if (req.query.price) {
    if (req.query.price === 'free') {
      filter.price = 0;
    } else if (req.query.price === 'paid') {
      filter.price = { $gt: 0 };
    }
  }

  let sort = {};
  if (req.query.sort) {
    const sortFields = req.query.sort.split(',');
    sortFields.forEach(field => {
      if (field.startsWith('-')) {
        sort[field.substring(1)] = -1;
      } else {
        sort[field] = 1;
      }
    });
  } else {
    sort = { createdAt: -1 };
  }

  const courses = await Course.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate('instructor', 'name avatar');

  const total = await Course.countDocuments(filter);

  res.status(200).json({
    success: true,
    count: courses.length,
    total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: courses,
  });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
const getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name avatar bio');

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  let isEnrolled = false;
  let enrollmentId = null;
  
  if (req.user && req.user.id) {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: course._id,
    });
    if (enrollment) {
      isEnrolled = true;
      enrollmentId = enrollment._id;
    }
  }

  res.status(200).json({
    success: true,
    data: course,
    isEnrolled,
    enrollmentId,
  });
});

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Instructor/Admin)
const createCourse = catchAsync(async (req, res, next) => {
  req.body.instructor = req.user.id;
  req.body.instructorName = req.user.name;

  const course = await Course.create(req.body);

  res.status(201).json({
    success: true,
    data: course,
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Instructor/Admin)
const updateCourse = catchAsync(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to update this course', 403));
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Instructor/Admin)
const deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (course.instructor.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError('You are not authorized to delete this course', 403));
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully',
  });
});

// @desc    Enroll in course - FIXED
// @route   POST /api/courses/:id/enroll
// @access  Private
// @desc    Enroll in course - COMPLETELY FIXED
// @route   POST /api/courses/:id/enroll
// @access  Private
// @desc    Enroll in course - COMPLETELY FIXED
// @route   POST /api/courses/:id/enroll
// @access  Private
const enrollCourse = catchAsync(async (req, res, next) => {
  try {
    const courseId = req.params.id;
    const userId = req.user.id;

    console.log(`📚 Enrolling user ${userId} in course ${courseId}`);

    // Find the course
    const course = await Course.findById(courseId).select('_id title studentsEnrolled');
    if (!course) {
      console.log('❌ Course not found:', courseId);
      return next(new AppError('Course not found', 404));
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: userId,
      course: courseId,
    });

    if (existingEnrollment) {
      console.log('⚠️ User already enrolled in this course');
      return next(new AppError('Already enrolled in this course', 400));
    }

    // ✅ FIX: Create enrollment WITHOUT populating or validating course
    const enrollment = await Enrollment.create({
      user: userId,
      course: courseId,
      progress: 0,
      completedModules: [],
      status: 'active',
      lastAccessedAt: new Date(),
    });
    console.log('✅ Enrollment created:', enrollment._id);

    // Add course to user's enrolled courses
    await User.findByIdAndUpdate(userId, {
      $addToSet: { enrolledCourses: courseId },
    });

    // Increment students enrolled count
    course.studentsEnrolled += 1;
    await course.save();

    // ✅ FIX: Create activity with proper error handling
    try {
      await Activity.create({
        user: userId,
        type: 'course_enrolled',
        description: `Enrolled in "${course.title}"`,
        metadata: {
          courseId: course._id,
          courseTitle: course.title,
        },
      });
    } catch (activityError) {
      console.error('⚠️ Activity creation failed but enrollment succeeded:', activityError.message);
      // Don't fail the enrollment if activity creation fails
    }

    console.log('✅ Enrollment completed successfully');

    return res.status(201).json({
      success: true,
      message: 'Successfully enrolled in course',
      data: {
        enrollmentId: enrollment._id,
        courseId: course._id,
        courseTitle: course.title,
      },
    });
  } catch (error) {
    console.error('❌ Enrollment error:', error);
    // ✅ Handle validation errors properly
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return next(new AppError(`Validation error: ${messages.join(', ')}`, 400));
    }
    return next(new AppError(error.message || 'Failed to enroll in course', 500));
  }
});
// @desc    Update course progress
// @route   PUT /api/courses/:id/progress
// @access  Private
const updateProgress = catchAsync(async (req, res, next) => {
  const { moduleId, completed } = req.body;
  const courseId = req.params.id;

  const enrollment = await Enrollment.findOne({
    user: req.user.id,
    course: courseId,
  });

  if (!enrollment) {
    return next(new AppError('You are not enrolled in this course', 404));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (!enrollment.completedModules) {
    enrollment.completedModules = [];
  }

  if (completed) {
    const alreadyCompleted = enrollment.completedModules.some(
      item => item && item.moduleId && item.moduleId.toString() === moduleId
    );

    if (!alreadyCompleted) {
      enrollment.completedModules.push({
        moduleId: moduleId,
        completedAt: new Date(),
      });
    }
  } else {
    enrollment.completedModules = enrollment.completedModules.filter(
      item => item && item.moduleId && item.moduleId.toString() !== moduleId
    );
  }

  const totalModules = course.modules ? course.modules.length : 0;
  const completedCount = enrollment.completedModules ? enrollment.completedModules.length : 0;
  enrollment.progress = totalModules > 0 
    ? Math.round((completedCount / totalModules) * 100)
    : 0;

  if (enrollment.progress === 100 && enrollment.status !== 'completed') {
    enrollment.status = 'completed';
    enrollment.completionDate = new Date();
  }

  await enrollment.save();

  res.status(200).json({
    success: true,
    data: enrollment,
  });
});

// @desc    Get course categories
// @route   GET /api/courses/categories
// @access  Public
const getCategories = catchAsync(async (req, res, next) => {
  const categories = await Course.distinct('category');
  
  const categoryCounts = await Promise.all(
    categories.map(async (category) => {
      const count = await Course.countDocuments({ category, isPublished: true });
      return { name: category, count };
    })
  );

  res.status(200).json({
    success: true,
    data: categoryCounts,
  });
});

// @desc    Get popular courses
// @route   GET /api/courses/popular
// @access  Public
const getPopularCourses = catchAsync(async (req, res, next) => {
  const courses = await Course.find({ isPublished: true })
    .sort({ studentsEnrolled: -1, rating: -1 })
    .limit(6)
    .populate('instructor', 'name avatar');

  res.status(200).json({
    success: true,
    data: courses,
  });
});

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  updateProgress,
  getCategories,
  getPopularCourses,
};