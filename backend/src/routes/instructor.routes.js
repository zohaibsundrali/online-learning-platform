const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const {
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
} = require('../controllers/instructor.controller');

// All routes require authentication and instructor role
router.use(protect);

const isInstructor = (req, res, next) => {
  if (req.user.role !== 'instructor' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Instructor access required',
    });
  }
  next();
};

router.use(isInstructor);

// Course Management
router.post('/course', createCourse);
router.put('/course/:courseId', updateCourse);
router.post('/upload-thumbnail', upload.single('thumbnail'), uploadThumbnail);

// Dashboard routes
router.get('/courses', getInstructorCourses);
router.get('/stats', getInstructorStats);
router.get('/course/:courseId', getInstructorCourse);
router.get('/course/:courseId/analytics', getCourseAnalytics);
router.get('/course/:courseId/students', getCourseStudents);
router.put('/course/:courseId/publish', togglePublish);
router.delete('/course/:courseId', deleteCourse);

module.exports = router;