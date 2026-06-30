const Enrollment = require('../models/Enrollment.model');

class ProgressService {
  /**
   * Calculate course progress based on completed modules
   */
  static async calculateProgress(enrollmentId) {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('course');

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    const course = enrollment.course;
    const totalModules = course.modules ? course.modules.length : 0;
    
    if (totalModules === 0) {
      return {
        progress: 0,
        completedCount: 0,
        totalModules: 0,
        isCompleted: false,
      };
    }

    const completedModules = enrollment.completedModules || [];
    const completedCount = completedModules.length;
    const progress = Math.round((completedCount / totalModules) * 100);

    // Update progress
    enrollment.progress = progress;
    
    // Check if course is completed
    if (progress === 100 && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completionDate = new Date();
    }

    await enrollment.save();
    
    return {
      progress,
      completedCount,
      totalModules,
      isCompleted: progress === 100,
    };
  }

  /**
   * Mark a module as completed
   */
  /**
 * Mark a module as completed - FIXED
 */
static async markModuleCompleted(enrollmentId, moduleId) {
  try {
    const enrollment = await Enrollment.findById(enrollmentId);

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    if (!enrollment.completedModules) {
      enrollment.completedModules = [];
    }

    // Check if module already completed
    const alreadyCompleted = enrollment.completedModules.some(item => {
      if (item && typeof item === 'object' && item.moduleId) {
        return item.moduleId.toString() === moduleId;
      }
      return item && item.toString() === moduleId;
    });

    if (!alreadyCompleted) {
      enrollment.completedModules.push({
        moduleId: moduleId,
        completedAt: new Date(),
      });
      await enrollment.save();
    }

    // Recalculate progress
    return await this.calculateProgress(enrollmentId);
  } catch (error) {
    console.error('❌ markModuleCompleted error:', error);
    throw error;
  }
}

  /**
   * Get the next incomplete module - FIXED
   */
  static async getNextModule(enrollmentId) {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('course');

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    const course = enrollment.course;
    
    if (!course || !course.modules || course.modules.length === 0) {
      return null;
    }

    // Get completed module IDs safely
    const completedModuleIds = (enrollment.completedModules || []).map(item => {
      if (item && typeof item === 'object' && item.moduleId) {
        return item.moduleId.toString();
      }
      return item ? item.toString() : '';
    }).filter(id => id !== '');

    // Find first module that's not completed
    const nextModule = course.modules.find(
      module => !completedModuleIds.includes(module._id.toString())
    );

    // ✅ FIX: Return null if no next module found (course is complete)
    return nextModule || null;
  }

  /**
   * Check if course is completed
   */
  static async isCourseCompleted(enrollmentId) {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('course');

    if (!enrollment) {
      return false;
    }

    const course = enrollment.course;
    if (!course || !course.modules || course.modules.length === 0) {
      return false;
    }

    const completedCount = enrollment.completedModules ? enrollment.completedModules.length : 0;
    return completedCount === course.modules.length;
  }

  /**
   * Get learning data for the learning page
   */
  static async getLearningData(enrollmentId) {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate({
        path: 'course',
        populate: {
          path: 'instructor',
          select: 'name avatar bio',
        },
      });

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    const course = enrollment.course;
    
    if (!course || !course.modules || course.modules.length === 0) {
      return {
        enrollment: {
          id: enrollment._id,
          progress: enrollment.progress || 0,
          status: enrollment.status,
          completedModules: [],
          enrolledAt: enrollment.enrolledAt,
          completionDate: enrollment.completionDate,
        },
        course: {
          id: course?._id || null,
          title: course?.title || 'Course not found',
          description: course?.description || '',
          thumbnail: course?.thumbnail || '',
          instructor: course?.instructor || null,
          totalDuration: course?.totalDuration || 0,
          category: course?.category || '',
          level: course?.level || '',
        },
        modules: [],
        currentModule: null,
        currentModuleIndex: 0,
        prevModule: null,
        nextModule: null,
        totalModules: 0,
        completedCount: 0,
      };
    }

    // Get completed module IDs safely
    const completedModuleIds = (enrollment.completedModules || []).map(item => {
      if (item && typeof item === 'object' && item.moduleId) {
        return item.moduleId.toString();
      }
      return item ? item.toString() : '';
    }).filter(id => id !== '');

    // Process modules with completion status
    const modules = course.modules.map(module => ({
      ...module.toObject(),
      isCompleted: completedModuleIds.includes(module._id.toString()),
      isLocked: false,
    }));

    // Find current module
    let currentModule = null;
    let currentModuleIndex = 0;

    if (enrollment.lastAccessedModule) {
      const index = modules.findIndex(
        m => m._id.toString() === enrollment.lastAccessedModule.toString()
      );
      if (index !== -1) {
        currentModule = modules[index];
        currentModuleIndex = index;
      }
    }

    // If no last accessed or it was removed, find first incomplete
    if (!currentModule) {
      const firstIncompleteIndex = modules.findIndex(m => !m.isCompleted);
      if (firstIncompleteIndex !== -1) {
        currentModule = modules[firstIncompleteIndex];
        currentModuleIndex = firstIncompleteIndex;
      } else if (modules.length > 0) {
        // All completed, show the last module
        currentModule = modules[modules.length - 1];
        currentModuleIndex = modules.length - 1;
      }
    }

    // Determine previous and next modules
    const prevModule = currentModuleIndex > 0 ? modules[currentModuleIndex - 1] : null;
    const nextModule = currentModuleIndex < modules.length - 1 ? modules[currentModuleIndex + 1] : null;

    return {
      enrollment: {
        id: enrollment._id,
        progress: enrollment.progress || 0,
        status: enrollment.status,
        completedModules: enrollment.completedModules || [],
        enrolledAt: enrollment.enrolledAt,
        completionDate: enrollment.completionDate,
      },
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        instructor: course.instructor,
        totalDuration: course.totalDuration,
        category: course.category,
        level: course.level,
      },
      modules,
      currentModule,
      currentModuleIndex,
      prevModule,
      nextModule,
      totalModules: modules.length,
      completedCount: completedModuleIds.length,
    };
  }

  /**
   * Update last accessed module
   */
  static async updateLastAccessed(enrollmentId, moduleId) {
    const enrollment = await Enrollment.findByIdAndUpdate(
      enrollmentId,
      {
        lastAccessedModule: moduleId,
        lastAccessedAt: new Date(),
      },
      { new: true }
    );

    return enrollment;
  }

  /**
   * Get resume data (for dashboard "Continue Learning")
   */
  static async getResumeData(enrollmentId) {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('course', 'title slug thumbnail modules');

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    let resumeModuleId = enrollment.lastAccessedModule;

    // If no last accessed, find first incomplete
    if (!resumeModuleId && enrollment.course && enrollment.course.modules) {
      const completedModuleIds = (enrollment.completedModules || []).map(item => {
        if (item && typeof item === 'object' && item.moduleId) {
          return item.moduleId.toString();
        }
        return item ? item.toString() : '';
      }).filter(id => id !== '');
      
      const firstIncomplete = enrollment.course.modules.find(
        module => !completedModuleIds.includes(module._id.toString())
      );
      
      if (firstIncomplete) {
        resumeModuleId = firstIncomplete._id;
      } else if (enrollment.course.modules.length > 0) {
        resumeModuleId = enrollment.course.modules[enrollment.course.modules.length - 1]._id;
      }
    }

    return {
      enrollmentId: enrollment._id,
      courseId: enrollment.course?._id || null,
      courseTitle: enrollment.course?.title || 'Course not found',
      courseSlug: enrollment.course?.slug || '',
      thumbnail: enrollment.course?.thumbnail || '',
      progress: enrollment.progress || 0,
      status: enrollment.status,
      resumeModuleId,
    };
  }

  /**
   * Check if course is completed and handle completion logic
   */
  static async checkAndHandleCompletion(enrollmentId) {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('course');

    if (!enrollment) {
      throw new Error('Enrollment not found');
    }

    const course = enrollment.course;
    const totalModules = course.modules ? course.modules.length : 0;
    const completedCount = enrollment.completedModules ? enrollment.completedModules.length : 0;

    if (totalModules > 0 && completedCount === totalModules && enrollment.status !== 'completed') {
      enrollment.status = 'completed';
      enrollment.completionDate = new Date();
      enrollment.progress = 100;
      await enrollment.save();

      // Create course completion activity
      const Activity = require('../models/Activity.model');
      await Activity.create({
        user: enrollment.user,
        type: 'course_completed',
        description: `Completed "${course.title}"`,
        metadata: {
          courseId: course._id,
          courseTitle: course.title,
        },
      });

      return {
        isCompleted: true,
        completionDate: enrollment.completionDate,
        status: 'completed',
      };
    }

    return {
      isCompleted: enrollment.status === 'completed',
      completionDate: enrollment.completionDate,
      status: enrollment.status,
    };
  }

  /**
   * Get completion status for dashboard display
   */
  static async getCompletionStatus(enrollmentId) {
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('course', 'title thumbnail modules');

    if (!enrollment) {
      return null;
    }

    const totalModules = enrollment.course?.modules?.length || 0;
    const completedCount = enrollment.completedModules?.length || 0;

    return {
      isCompleted: enrollment.status === 'completed',
      progress: enrollment.progress || 0,
      completedCount,
      totalModules,
      completionDate: enrollment.completionDate,
      status: enrollment.status,
      certificateAvailable: enrollment.status === 'completed',
      certificateUrl: enrollment.status === 'completed' 
        ? `/api/certificates/${enrollmentId}`
        : null,
    };
  }

  /**
   * Get all completed module IDs for an enrollment
   */
  static async getCompletedModuleIds(enrollmentId) {
    const enrollment = await Enrollment.findById(enrollmentId);
    if (!enrollment) {
      return [];
    }

    return (enrollment.completedModules || []).map(item => {
      if (item && typeof item === 'object' && item.moduleId) {
        return item.moduleId.toString();
      }
      return item ? item.toString() : '';
    }).filter(id => id !== '');
  }
}

module.exports = ProgressService;