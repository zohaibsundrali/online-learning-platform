const User = require('../models/User.model');
const Course = require('../models/Course.model');
const Enrollment = require('../models/Enrollment.model');
const Activity = require('../models/Activity.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const bcrypt = require('bcrypt');

// ==================== Dashboard Stats ====================

// @desc    Get admin dashboard stats
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getDashboardStats = catchAsync(async (req, res, next) => {
  // User stats
  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalInstructors = await User.countDocuments({ role: 'instructor' });
  const totalAdmins = await User.countDocuments({ role: 'admin' });
  const activeUsers = await User.countDocuments({ isActive: true });
  const inactiveUsers = await User.countDocuments({ isActive: false });

  // Course stats
  const totalCourses = await Course.countDocuments();
  const publishedCourses = await Course.countDocuments({ isPublished: true });
  const pendingCourses = await Course.countDocuments({ isPublished: false });
  const totalModules = await Course.aggregate([
    { $project: { moduleCount: { $size: '$modules' } } },
    { $group: { _id: null, total: { $sum: '$moduleCount' } } }
  ]);

  // Enrollment stats
  const totalEnrollments = await Enrollment.countDocuments();
  const activeEnrollments = await Enrollment.countDocuments({ status: 'active' });
  const completedEnrollments = await Enrollment.countDocuments({ status: 'completed' });

  // Revenue (if price exists)
  const revenueData = await Course.aggregate([
    { $group: { _id: null, totalRevenue: { $sum: { $multiply: ['$price', '$studentsEnrolled'] } } } }
  ]);
  const totalRevenue = revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

  // Recent registrations (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentRegistrations = await User.find({
    createdAt: { $gte: sevenDaysAgo }
  }).sort({ createdAt: -1 }).limit(10).select('name email role avatar createdAt');

  // Recent courses (last 7 days)
  const recentCourses = await Course.find({
    createdAt: { $gte: sevenDaysAgo }
  }).sort({ createdAt: -1 }).limit(10).select('title category level price isPublished createdAt');

  // Monthly registrations (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const monthlyRegistrations = await User.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);

  // User distribution by role
  const userDistribution = [
    { role: 'Student', count: totalStudents },
    { role: 'Instructor', count: totalInstructors },
    { role: 'Admin', count: totalAdmins }
  ];

  res.status(200).json({
    success: true,
    data: {
      users: {
        total: totalUsers,
        students: totalStudents,
        instructors: totalInstructors,
        admins: totalAdmins,
        active: activeUsers,
        inactive: inactiveUsers,
      },
      courses: {
        total: totalCourses,
        published: publishedCourses,
        pending: pendingCourses,
        totalModules: totalModules.length > 0 ? totalModules[0].total : 0,
      },
      enrollments: {
        total: totalEnrollments,
        active: activeEnrollments,
        completed: completedEnrollments,
      },
      revenue: totalRevenue,
      recent: {
        registrations: recentRegistrations,
        courses: recentCourses,
      },
      charts: {
        monthlyRegistrations,
        userDistribution,
      }
    }
  });
});

// ==================== User Management ====================

// @desc    Get all users with pagination, search, filter
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const role = req.query.role || '';
  const status = req.query.status || '';

  // Build filter
  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }
  if (role) filter.role = role;
  if (status === 'active') filter.isActive = true;
  if (status === 'inactive') filter.isActive = false;

  const users = await User.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-password');

  const total = await User.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  });
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private (Admin)
const getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .populate('enrolledCourses', 'title thumbnail category');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Get user's enrollments with progress
  const enrollments = await Enrollment.find({ user: user._id })
    .populate('course', 'title thumbnail category level');

  res.status(200).json({
    success: true,
    data: { user, enrollments }
  });
});

// @desc    Create user (Admin)
// @route   POST /api/admin/users
// @access  Private (Admin)
const createUser = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    isActive: true,
  });

  res.status(201).json({
    success: true,
    data: user,
    message: 'User created successfully',
  });
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const updateUser = catchAsync(async (req, res, next) => {
  const { name, email, role, bio, isActive } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent admin from changing their own role to something else
  if (req.params.id === req.user.id && role && role !== 'admin') {
    return next(new AppError('Cannot change your own admin role', 400));
  }

  user.name = name || user.name;
  user.email = email || user.email;
  user.role = role || user.role;
  user.bio = bio !== undefined ? bio : user.bio;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  res.status(200).json({
    success: true,
    data: user,
    message: 'User updated successfully',
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent admin from deleting themselves
  if (req.params.id === req.user.id) {
    return next(new AppError('Cannot delete your own account', 400));
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
});

// @desc    Reset user password
// @route   PUT /api/admin/users/:id/reset-password
// @access  Private (Admin)
const resetPassword = catchAsync(async (req, res, next) => {
  const { newPassword } = req.body;

  if (!newPassword || newPassword.length < 6) {
    return next(new AppError('Password must be at least 6 characters', 400));
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(newPassword, salt);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Password reset successfully',
  });
});

// @desc    Toggle user status (suspend/activate)
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
const toggleUserStatus = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Prevent admin from suspending themselves
  if (req.params.id === req.user.id) {
    return next(new AppError('Cannot change your own status', 400));
  }

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    data: { isActive: user.isActive },
    message: user.isActive ? 'User activated successfully' : 'User suspended successfully',
  });
});

// ==================== Course Management ====================

// @desc    Get all courses (admin view)
// @route   GET /api/admin/courses
// @access  Private (Admin)
const getCourses = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';
  const category = req.query.category || '';
  const status = req.query.status || '';

  const filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  if (category) filter.category = category;
  if (status === 'published') filter.isPublished = true;
  if (status === 'pending') filter.isPublished = false;

  const courses = await Course.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('instructor', 'name email avatar');

  const total = await Course.countDocuments(filter);

  res.status(200).json({
    success: true,
    data: courses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  });
});

// @desc    Get single course (admin view)
// @route   GET /api/admin/courses/:id
// @access  Private (Admin)
const getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id)
    .populate('instructor', 'name email avatar bio');

  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const enrollments = await Enrollment.find({ course: course._id })
    .populate('user', 'name email avatar');

  res.status(200).json({
    success: true,
    data: { course, enrollments }
  });
});

// @desc    Toggle course publish status
// @route   PUT /api/admin/courses/:id/toggle-publish
// @access  Private (Admin)
const toggleCoursePublish = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  course.isPublished = !course.isPublished;
  await course.save();

  res.status(200).json({
    success: true,
    data: { isPublished: course.isPublished },
    message: course.isPublished ? 'Course published successfully' : 'Course unpublished successfully',
  });
});

// @desc    Delete course (admin)
// @route   DELETE /api/admin/courses/:id
// @access  Private (Admin)
const deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Course deleted successfully',
  });
});

// ==================== Category Management ====================

// @desc    Get all categories with counts
// @route   GET /api/admin/categories
// @access  Private (Admin)
const getCategories = catchAsync(async (req, res, next) => {
  const categories = await Course.distinct('category');
  
  const categoryData = await Promise.all(
    categories.map(async (category) => {
      const count = await Course.countDocuments({ category });
      const published = await Course.countDocuments({ category, isPublished: true });
      return { name: category, count, published };
    })
  );

  res.status(200).json({
    success: true,
    data: categoryData,
  });
});

// ==================== Notifications ====================

// @desc    Get admin notifications
// @route   GET /api/admin/notifications
// @access  Private (Admin)
const getNotifications = catchAsync(async (req, res, next) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // New registrations
  const newRegistrations = await User.find({
    createdAt: { $gte: sevenDaysAgo }
  }).countDocuments();

  // New course submissions
  const newCourses = await Course.find({
    createdAt: { $gte: sevenDaysAgo },
    isPublished: false
  }).countDocuments();

  // New enrollments
  const newEnrollments = await Enrollment.find({
    createdAt: { $gte: sevenDaysAgo }
  }).countDocuments();

  // Pending instructor applications
  const pendingInstructors = await User.countDocuments({
    role: 'instructor',
    isActive: false
  });

  const notifications = [
    {
      type: 'registration',
      title: 'New Registrations',
      count: newRegistrations,
      message: `${newRegistrations} new users joined in the last 7 days`,
      icon: 'UserPlus',
      color: 'blue',
    },
    {
      type: 'course',
      title: 'New Course Submissions',
      count: newCourses,
      message: `${newCourses} new courses awaiting review`,
      icon: 'BookOpen',
      color: 'green',
    },
    {
      type: 'enrollment',
      title: 'New Enrollments',
      count: newEnrollments,
      message: `${newEnrollments} new enrollments in the last 7 days`,
      icon: 'GraduationCap',
      color: 'purple',
    },
    {
      type: 'instructor',
      title: 'Pending Instructors',
      count: pendingInstructors,
      message: `${pendingInstructors} instructor applications pending approval`,
      icon: 'Users',
      color: 'orange',
    },
  ];

  res.status(200).json({
    success: true,
    data: notifications,
  });
});

// ==================== Enrollment Management ====================

// @desc    Get all enrollments
// @route   GET /api/admin/enrollments
// @access  Private (Admin)
const getEnrollments = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const enrollments = await Enrollment.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('user', 'name email avatar')
    .populate('course', 'title thumbnail category');

  const total = await Enrollment.countDocuments();

  res.status(200).json({
    success: true,
    data: enrollments,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  });
});

// @desc    Update enrollment status
// @route   PUT /api/admin/enrollments/:id
// @access  Private (Admin)
const updateEnrollment = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const enrollment = await Enrollment.findById(req.params.id);

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  enrollment.status = status;
  if (status === 'completed') {
    enrollment.completionDate = new Date();
  }
  await enrollment.save();

  res.status(200).json({
    success: true,
    data: enrollment,
    message: 'Enrollment updated successfully',
  });
});

module.exports = {
  getDashboardStats,
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  toggleUserStatus,
  getCourses,
  getCourse,
  toggleCoursePublish,
  deleteCourse,
  getCategories,
  getNotifications,
  getEnrollments,
  updateEnrollment,
};