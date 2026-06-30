const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const User = require('../models/User.model');
const Enrollment = require('../models/Enrollment.model');
const catchAsync = require('../utils/catchAsync');
const upload = require('../middleware/upload.middleware');
const { uploadAvatar, removeAvatar } = require('../controllers/user.controller');

// Avatar Routes
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/avatar', protect, removeAvatar);

// @desc    Get user enrollments (ALL - including completed)
// @route   GET /api/users/enrollments
// @access  Private
router.get('/enrollments', protect, catchAsync(async (req, res, next) => {
  // ✅ Get ALL enrollments, not just 'active'
  const enrollments = await Enrollment.find({ 
    user: req.user.id,
  }).populate({
    path: 'course',
    select: 'title thumbnail category level price instructorName totalDuration modules',
  });

  console.log(`📚 Found ${enrollments.length} enrollments for user`);

  // Format the response to include progress
  const courses = enrollments.map(enrollment => {
    if (!enrollment.course) {
      return null;
    }
    
    return {
      ...enrollment.course._doc,
      progress: enrollment.progress || 0,
      enrollmentId: enrollment._id,
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status || 'active',
      completionDate: enrollment.completionDate || null,
      isCompleted: enrollment.status === 'completed' || enrollment.progress === 100,
    };
  }).filter(course => course !== null);

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
  }).populate('course', 'title totalDuration');

  const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
  const averageProgress = enrollments.length > 0 ? Math.round(totalProgress / enrollments.length) : 0;
  const completedCount = enrollments.filter(e => e.progress === 100 || e.status === 'completed').length;

  res.status(200).json({
    success: true,
    data: {
      totalCourses: enrollments.length,
      completedCourses: completedCount,
      averageProgress,
      courses: enrollments.map(e => ({
        courseId: e.course?._id || null,
        title: e.course?.title || 'Unknown Course',
        progress: e.progress || 0,
        status: e.status || 'active',
        isCompleted: e.progress === 100 || e.status === 'completed',
      })),
    },
  });
}));

module.exports = router;