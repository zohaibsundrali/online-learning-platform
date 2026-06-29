const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollCourse,
  updateProgress,
  getCategories,
  getPopularCourses,
} = require('../controllers/course.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getCourses);
router.get('/categories', getCategories);
router.get('/popular', getPopularCourses);
router.get('/:id', getCourse);

// Protected routes
router.post('/', protect, restrictTo('instructor', 'admin'), createCourse);
router.put('/:id', protect, restrictTo('instructor', 'admin'), updateCourse);
router.delete('/:id', protect, restrictTo('instructor', 'admin'), deleteCourse);
router.post('/:id/enroll', protect, enrollCourse);
router.put('/:id/progress', protect, updateProgress);

module.exports = router;