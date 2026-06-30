const ProgressService = require('../services/progress.service');
const Enrollment = require('../models/Enrollment.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const Activity = require('../models/Activity.model');

// @desc    Get learning page data
// @route   GET /api/learning/:enrollmentId
// @access  Private
const getLearningData = catchAsync(async (req, res, next) => {
  const { enrollmentId } = req.params;

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  if (enrollment.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized', 403));
  }

  const data = await ProgressService.getLearningData(enrollmentId);

  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Mark module as completed
// @route   PUT /api/learning/:enrollmentId/module/:moduleId/complete
// @access  Private
const markModuleComplete = catchAsync(async (req, res, next) => {
  const { enrollmentId, moduleId } = req.params;

  // Verify enrollment belongs to user
  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  if (enrollment.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized', 403));
  }

  // Get populated enrollment for module verification
  const populatedEnrollment = await Enrollment.findById(enrollmentId)
    .populate('course');
  
  if (!populatedEnrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  const course = populatedEnrollment.course;
  
  if (!course || !course.modules || course.modules.length === 0) {
    return next(new AppError('Course modules not found', 404));
  }

  // Verify module belongs to course
  const moduleExists = course.modules.some(
    m => m._id.toString() === moduleId
  );

  if (!moduleExists) {
    return next(new AppError('Module not found in this course', 404));
  }

  // Mark module as completed using the service
  const progressData = await ProgressService.markModuleCompleted(
    enrollmentId,
    moduleId
  );

  // Find the module for activity creation
  const module = course.modules.find(m => m._id.toString() === moduleId);
  
  // Create activity for module completion
  if (module) {
    await Activity.create({
      user: req.user.id,
      type: 'module_completed',
      description: `Completed "${module.title}" in "${course.title}"`,
      metadata: {
        courseId: course._id,
        courseTitle: course.title,
        moduleId: moduleId,
        moduleTitle: module.title,
      },
    });
  }

  // If course is now completed, create completion activity
  if (progressData.isCompleted) {
    await Activity.create({
      user: req.user.id,
      type: 'course_completed',
      description: `Completed "${course.title}"`,
      metadata: {
        courseId: course._id,
        courseTitle: course.title,
      },
    });
  }

  // Get next module for continuation
  const nextModule = await ProgressService.getNextModule(enrollmentId);

  res.status(200).json({
    success: true,
    data: {
      progress: progressData.progress,
      completedCount: progressData.completedCount,
      totalModules: progressData.totalModules,
      isCompleted: progressData.isCompleted,
      nextModule: nextModule || null,
    },
  });
});

// @desc    Update last accessed module
// @route   PUT /api/learning/:enrollmentId/position
// @access  Private
const updatePosition = catchAsync(async (req, res, next) => {
  const { enrollmentId } = req.params;
  const { moduleId } = req.body;

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  if (enrollment.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized', 403));
  }

  const updated = await ProgressService.updateLastAccessed(enrollmentId, moduleId);

  res.status(200).json({
    success: true,
    data: {
      lastAccessedModule: updated.lastAccessedModule,
      lastAccessedAt: updated.lastAccessedAt,
    },
  });
});

// @desc    Get resume data (for dashboard)
// @route   GET /api/learning/:enrollmentId/resume
// @access  Private
const getResumeData = catchAsync(async (req, res, next) => {
  const { enrollmentId } = req.params;

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  if (enrollment.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized', 403));
  }

  const data = await ProgressService.getResumeData(enrollmentId);

  res.status(200).json({
    success: true,
    data,
  });
});

// @desc    Get enrollment progress
// @route   GET /api/learning/:enrollmentId/progress
// @access  Private
const getProgress = catchAsync(async (req, res, next) => {
  const { enrollmentId } = req.params;

  const enrollment = await Enrollment.findById(enrollmentId)
    .populate('course', 'title modules');

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  if (enrollment.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized', 403));
  }

  res.status(200).json({
    success: true,
    data: {
      progress: enrollment.progress || 0,
      status: enrollment.status,
      completedModules: enrollment.completedModules ? enrollment.completedModules.length : 0,
      totalModules: enrollment.course && enrollment.course.modules ? enrollment.course.modules.length : 0,
      isCompleted: enrollment.status === 'completed',
      completionDate: enrollment.completionDate,
    },
  });
});

// ✅ ADD THIS MISSING FUNCTION - Check if course is completed
// @desc    Check if course is completed
// @route   GET /api/learning/:enrollmentId/completed
// @access  Private
const checkCompleted = catchAsync(async (req, res, next) => {
  const { enrollmentId } = req.params;

  const enrollment = await Enrollment.findById(enrollmentId)
    .populate('course', 'title modules');

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  if (enrollment.user.toString() !== req.user.id) {
    return next(new AppError('Unauthorized', 403));
  }

  const totalModules = enrollment.course?.modules?.length || 0;
  const completedCount = enrollment.completedModules?.length || 0;
  const isCompleted = totalModules > 0 && completedCount === totalModules;

  res.status(200).json({
    success: true,
    data: {
      isCompleted: isCompleted || enrollment.status === 'completed',
      progress: enrollment.progress || 0,
      status: enrollment.status,
      completedModules: completedCount,
      totalModules: totalModules,
      completionDate: enrollment.completionDate,
    },
  });
});

module.exports = {
  getLearningData,
  markModuleComplete,
  updatePosition,
  getResumeData,
  getProgress,
  checkCompleted, // ✅ EXPORT THIS
};