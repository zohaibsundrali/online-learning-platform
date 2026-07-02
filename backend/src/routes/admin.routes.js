const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth.middleware');
const {
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
} = require('../controllers/admin.controller');

// All routes require authentication and admin role
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard
router.get('/stats', getDashboardStats);
router.get('/notifications', getNotifications);

// User Management
router.get('/users', getUsers);
router.get('/users/:id', getUser);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/reset-password', resetPassword);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Course Management
router.get('/courses', getCourses);
router.get('/courses/:id', getCourse);
router.put('/courses/:id/toggle-publish', toggleCoursePublish);
router.delete('/courses/:id', deleteCourse);

// Category Management
router.get('/categories', getCategories);

// Enrollment Management
router.get('/enrollments', getEnrollments);
router.put('/enrollments/:id', updateEnrollment);

module.exports = router;