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
// @desc    Mark module as completed - COMPLETELY FIXED
// @route   PUT /api/learning/:enrollmentId/module/:moduleId/complete
// @access  Private
// @desc    Mark module as completed - COMPLETELY FIXED
// @route   PUT /api/learning/:enrollmentId/module/:moduleId/complete
// @access  Private
const markModuleComplete = catchAsync(async (req, res, next) => {
  try {
    const { enrollmentId, moduleId } = req.params;

    console.log(`📚 Marking module ${moduleId} as complete for enrollment ${enrollmentId}`);

    // Verify enrollment belongs to user
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      console.log('❌ Enrollment not found:', enrollmentId);
      return next(new AppError('Enrollment not found', 404));
    }

    if (enrollment.user.toString() !== req.user.id) {
      console.log('❌ Unauthorized access to enrollment');
      return next(new AppError('Unauthorized', 403));
    }

    // Get populated enrollment for module verification
    const populatedEnrollment = await Enrollment.findById(enrollmentId)
      .populate('course');
    
    if (!populatedEnrollment) {
      console.log('❌ Populated enrollment not found');
      return next(new AppError('Enrollment not found', 404));
    }

    const course = populatedEnrollment.course;
    
    if (!course || !course.modules || course.modules.length === 0) {
      console.log('❌ Course modules not found');
      return next(new AppError('Course modules not found', 404));
    }

    // Verify module belongs to course
    const moduleExists = course.modules.some(
      m => m._id.toString() === moduleId
    );

    if (!moduleExists) {
      console.log('❌ Module not found in course');
      return next(new AppError('Module not found in this course', 404));
    }

    // Mark module as completed using the service
    const progressData = await ProgressService.markModuleCompleted(
      enrollmentId,
      moduleId
    );
    console.log('✅ Module marked as completed, progress:', progressData.progress);

    // Find the module for activity creation
    const module = course.modules.find(m => m._id.toString() === moduleId);
    
    // ✅ FIX: Create activity with proper error handling
    if (module) {
      try {
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
        console.log('✅ Activity created for module completion');
      } catch (activityError) {
        console.error('⚠️ Activity creation failed:', activityError.message);
        // Don't fail the module completion if activity creation fails
      }
    }

    // If course is now completed, create completion activity
    if (progressData.isCompleted) {
      try {
        await Activity.create({
          user: req.user.id,
          type: 'course_completed',
          description: `Completed "${course.title}"`,
          metadata: {
            courseId: course._id,
            courseTitle: course.title,
          },
        });
        console.log('🎉 Course completed!');
      } catch (activityError) {
        console.error('⚠️ Course completion activity failed:', activityError.message);
      }
    }

    // Get next module for continuation
    const nextModule = await ProgressService.getNextModule(enrollmentId);

    console.log('✅ Mark module complete response sent');

    return res.status(200).json({
      success: true,
      data: {
        progress: progressData.progress,
        completedCount: progressData.completedCount,
        totalModules: progressData.totalModules,
        isCompleted: progressData.isCompleted,
        nextModule: nextModule || null,
      },
    });
  } catch (error) {
    console.error('❌ Mark module complete error:', error);
    return next(new AppError(error.message || 'Failed to mark module as completed', 500));
  }
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