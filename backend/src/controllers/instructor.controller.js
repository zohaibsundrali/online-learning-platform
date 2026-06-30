const Course = require('../models/Course.model');
const Enrollment = require('../models/Enrollment.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const uploadBufferToCloudinary = require('../utils/cloudinaryUploader');

// @desc    Get all courses for instructor
// @route   GET /api/instructor/courses
// @access  Private (Instructor/Admin)
const getInstructorCourses = catchAsync(async (req, res, next) => {
  const instructorId = req.user.id;
  
  const courses = await Course.find({ instructor: instructorId })
    .sort({ createdAt: -1 })
    .select('title slug description thumbnail category level price isPublished studentsEnrolled totalDuration modules createdAt updatedAt');

  const coursesWithCount = courses.map(course => ({
    ...course.toObject(),
    moduleCount: course.modules ? course.modules.length : 0,
  }));

  res.status(200).json({
    success: true,
    count: coursesWithCount.length,
    data: coursesWithCount,
  });
});

// @desc    Get instructor statistics
// @route   GET /api/instructor/stats
// @access  Private (Instructor/Admin)
const getInstructorStats = catchAsync(async (req, res, next) => {
  const instructorId = req.user.id;

  const courses = await Course.find({ instructor: instructorId });
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(c => c.isPublished).length;
  const draftCourses = totalCourses - publishedCourses;

  const courseIds = courses.map(c => c._id);
  const enrollments = await Enrollment.find({ 
    course: { $in: courseIds },
    status: { $in: ['active', 'completed'] }
  }).distinct('user');
  
  const totalStudents = enrollments.length;

  const totalRevenue = courses.reduce((sum, course) => {
    return sum + (course.price * course.studentsEnrolled);
  }, 0);

  let mostPopularCourse = null;
  if (courses.length > 0) {
    mostPopularCourse = courses.reduce((max, course) => {
      return (course.studentsEnrolled > max.studentsEnrolled) ? course : max;
    }, courses[0]);
  }

  res.status(200).json({
    success: true,
    data: {
      totalCourses,
      publishedCourses,
      draftCourses,
      totalStudents,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      mostPopularCourse: mostPopularCourse ? {
        id: mostPopularCourse._id,
        title: mostPopularCourse.title,
        studentsEnrolled: mostPopularCourse.studentsEnrolled,
      } : null,
    },
  });
});

// @desc    Get single course for editing
// @route   GET /api/instructor/course/:courseId
// @access  Private (Instructor/Admin)
const getInstructorCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const instructorId = req.user.id;

  const course = await Course.findOne({ 
    _id: courseId, 
    instructor: instructorId 
  });

  if (!course) {
    return next(new AppError('Course not found or you do not own this course', 404));
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

// @desc    Create a new course - COMPLETELY REWRITTEN
// @route   POST /api/instructor/course
// @access  Private (Instructor/Admin)
const createCourse = async (req, res, next) => {
  console.log('📚 Create course - Started');
  console.log('📚 User:', req.user?.id, req.user?.name);
  console.log('📚 Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const instructorId = req.user.id;
    
    // Validate required fields
    const requiredFields = ['title', 'description', 'category', 'level', 'price', 'thumbnail'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.log('❌ Missing fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    // Prepare course data
    const courseData = {
      ...req.body,
      instructor: instructorId,
      instructorName: req.user.name,
    };

    // Generate slug from title
    if (courseData.title) {
      courseData.slug = courseData.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      console.log('📚 Generated slug:', courseData.slug);
    }

    // Clean up modules
    if (courseData.modules && courseData.modules.length > 0) {
      courseData.modules = courseData.modules.map(module => ({
        ...module,
        resources: module.resources?.filter(r => r.title?.trim() || r.url?.trim()) || [],
      }));
    } else {
      courseData.modules = [];
    }

    // Clean up arrays
    courseData.prerequisites = courseData.prerequisites?.filter(p => p.trim() !== '') || [];
    courseData.learningObjectives = courseData.learningObjectives?.filter(o => o.trim() !== '') || [];
    courseData.whatYouWillLearn = courseData.whatYouWillLearn?.filter(l => l.trim() !== '') || [];
    courseData.tags = courseData.tags?.filter(t => t.trim() !== '') || [];

    // ✅ Use new Course() instead of Course.create()
    console.log('📚 Creating course with data:', JSON.stringify(courseData, null, 2));
    
    const course = new Course(courseData);
    await course.save();
    
    console.log('✅ Course created successfully:', course._id, course.title);

    return res.status(201).json({
      success: true,
      data: course,
      message: 'Course created successfully',
    });
  } catch (error) {
    console.error('❌ Create course error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages.join(', ')}`,
      });
    }
    
    // Handle duplicate slug error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A course with this title already exists. Please use a different title.',
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to create course',
    });
  }
};

// @desc    Update a course - REWRITTEN
// @route   PUT /api/instructor/course/:courseId
// @access  Private (Instructor/Admin)
const updateCourse = async (req, res, next) => {
  console.log('📚 Update course - Started');
  console.log('📚 Course ID:', req.params.courseId);
  console.log('📚 Body:', JSON.stringify(req.body, null, 2));
  
  try {
    const { courseId } = req.params;
    const instructorId = req.user.id;

    // Find and verify ownership
    const course = await Course.findOne({ 
      _id: courseId, 
      instructor: instructorId 
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found or you do not own this course',
      });
    }

    // Prepare update data
    const updateData = { ...req.body };

    // If title is being updated, generate new slug
    if (updateData.title && updateData.title !== course.title) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }

    // Clean up arrays
    if (updateData.prerequisites) {
      updateData.prerequisites = updateData.prerequisites.filter(p => p.trim() !== '');
    }
    if (updateData.learningObjectives) {
      updateData.learningObjectives = updateData.learningObjectives.filter(o => o.trim() !== '');
    }
    if (updateData.whatYouWillLearn) {
      updateData.whatYouWillLearn = updateData.whatYouWillLearn.filter(l => l.trim() !== '');
    }
    if (updateData.tags) {
      updateData.tags = updateData.tags.filter(t => t.trim() !== '');
    }
    if (updateData.modules) {
      updateData.modules = updateData.modules.map(module => ({
        ...module,
        resources: module.resources?.filter(r => r.title?.trim() || r.url?.trim()) || [],
      }));
    }

    // Update course
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );

    console.log('✅ Course updated successfully:', updatedCourse._id);

    return res.status(200).json({
      success: true,
      data: updatedCourse,
      message: 'Course updated successfully',
    });
  } catch (error) {
    console.error('❌ Update course error:', error);
    console.error('❌ Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: `Validation error: ${messages.join(', ')}`,
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A course with this title already exists. Please use a different title.',
      });
    }
    
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update course',
    });
  }
};

// @desc    Toggle course publish status
// @route   PUT /api/instructor/course/:courseId/publish
// @access  Private (Instructor/Admin)
const togglePublish = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const instructorId = req.user.id;

  const course = await Course.findOne({ 
    _id: courseId, 
    instructor: instructorId 
  });

  if (!course) {
    return next(new AppError('Course not found or you do not own this course', 404));
  }

  course.isPublished = !course.isPublished;
  await course.save();

  res.status(200).json({
    success: true,
    data: {
      id: course._id,
      isPublished: course.isPublished,
    },
    message: course.isPublished ? 'Course published successfully' : 'Course unpublished successfully',
  });
});

// @desc    Delete course
// @route   DELETE /api/instructor/course/:courseId
// @access  Private (Instructor/Admin)
const deleteCourse = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const instructorId = req.user.id;

  const course = await Course.findOne({ 
    _id: courseId, 
    instructor: instructorId 
  });

  if (!course) {
    return next(new AppError('Course not found or you do not own this course', 404));
  }

  // Check if course has active enrollments
  const enrollmentCount = await Enrollment.countDocuments({
    course: courseId,
    status: 'active'
  });

  if (enrollmentCount > 0) {
    return next(new AppError('Cannot delete course with active enrollments', 400));
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully',
  });
});

// @desc    Upload course thumbnail
// @route   POST /api/instructor/upload-thumbnail
// @access  Private (Instructor/Admin)
const uploadThumbnail = catchAsync(async (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return next(new AppError('Please upload an image', 400));
  }

  const uploadResult = await uploadBufferToCloudinary(
    req.file.buffer,
    'learnhub-thumbnails',
    [{ width: 200, height: 200, crop: 'fill' }]
  );

  res.status(200).json({
    success: true,
    data: {
      url: uploadResult.secure_url,
    },
    message: 'Thumbnail uploaded successfully',
  });
});

// @desc    Get course analytics
// @route   GET /api/instructor/course/:courseId/analytics
// @access  Private (Instructor/Admin)
const getCourseAnalytics = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const instructorId = req.user.id;

  const course = await Course.findOne({ 
    _id: courseId, 
    instructor: instructorId 
  });

  if (!course) {
    return next(new AppError('Course not found or you do not own this course', 404));
  }

  const enrollments = await Enrollment.find({ 
    course: courseId,
    status: { $in: ['active', 'completed'] }
  }).populate('user', 'name email avatar');

  const totalStudents = enrollments.length;
  const completedStudents = enrollments.filter(e => e.status === 'completed').length;
  
  const totalProgress = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0);
  const avgProgress = totalStudents > 0 ? Math.round(totalProgress / totalStudents) : 0;

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentEnrollments = enrollments.filter(e => new Date(e.enrolledAt) > thirtyDaysAgo);

  const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0;

  const moduleCompletion = [];
  if (course.modules && course.modules.length > 0) {
    for (const module of course.modules) {
      const completedCount = enrollments.filter(e => 
        e.completedModules && e.completedModules.some(
          cm => cm.moduleId && cm.moduleId.toString() === module._id.toString()
        )
      ).length;
      
      moduleCompletion.push({
        moduleId: module._id,
        title: module.title,
        total: totalStudents,
        completed: completedCount,
        percentage: totalStudents > 0 ? Math.round((completedCount / totalStudents) * 100) : 0,
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      totalStudents,
      completedStudents,
      avgProgress,
      completionRate,
      recentEnrollments: recentEnrollments.length,
      moduleCompletion,
      revenue: course.price * totalStudents,
    },
  });
});

// @desc    Get course students
// @route   GET /api/instructor/course/:courseId/students
// @access  Private (Instructor/Admin)
const getCourseStudents = catchAsync(async (req, res, next) => {
  const { courseId } = req.params;
  const instructorId = req.user.id;

  const course = await Course.findOne({ 
    _id: courseId, 
    instructor: instructorId 
  });

  if (!course) {
    return next(new AppError('Course not found or you do not own this course', 404));
  }

  const enrollments = await Enrollment.find({ 
    course: courseId,
    status: { $in: ['active', 'completed'] }
  })
  .populate('user', 'name email avatar')
  .sort({ enrolledAt: -1 });

  const students = enrollments.map(enrollment => ({
    id: enrollment.user._id,
    name: enrollment.user.name,
    email: enrollment.user.email,
    avatar: enrollment.user.avatar,
    progress: enrollment.progress || 0,
    status: enrollment.status,
    enrolledAt: enrollment.enrolledAt,
    completedAt: enrollment.completionDate,
    lastAccessed: enrollment.lastAccessedAt,
  }));

  res.status(200).json({
    success: true,
    count: students.length,
    data: students,
  });
});

module.exports = {
  getInstructorCourses,
  getInstructorStats,
  getInstructorCourse,
  togglePublish,
  deleteCourse,
  createCourse,
  updateCourse,
  uploadThumbnail,
  getCourseAnalytics,
  getCourseStudents,
};