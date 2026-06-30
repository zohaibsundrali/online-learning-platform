const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const Enrollment = require('../models/Enrollment.model');
const catchAsync = require('../utils/catchAsync');

// @desc    Get user enrollments
// @route   GET /api/users/enrollments
// @access  Private
router.get('/enrollments', protect, catchAsync(async (req, res, next) => {
  const enrollments = await Enrollment.find({ 
    user: req.user.id,
    status: 'active'
  }).populate({
    path: 'course',
    select: 'title thumbnail category level price instructorName totalDuration modules',
  });

  // Format the response to include progress
  const courses = enrollments.map(enrollment => ({
    ...enrollment.course._doc,
    progress: enrollment.progress,
    enrollmentId: enrollment._id,
    enrolledAt: enrollment.enrolledAt,
    status: enrollment.status,
  }));

  res.status(200).json({
    success: true,
    count: courses.length,
    data: courses,
  });
}));

// @desc    Get user progress
// @route   GET /api/users/progress
// @access  Private
router.get('/progress', protect, catchAsync(async (req, res, next) => {
  const enrollments = await Enrollment.find({ 
    user: req.user.id,
    status: 'active'
  }).populate('course', 'title totalDuration');

  const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
  const averageProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;

  res.status(200).json({
    success: true,
    data: {
      totalCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.progress === 100).length,
      averageProgress,
      courses: enrollments.map(e => ({
        courseId: e.course._id,
        title: e.course.title,
        progress: e.progress,
        status: e.status,
      })),
    },
  });
}));

module.exports = router;