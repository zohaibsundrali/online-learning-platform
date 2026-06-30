const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getLearningData,
  markModuleComplete,
  updatePosition,
  getResumeData,
  getProgress,
  checkCompleted,
} = require('../controllers/learning.controller');

// All routes are protected
router.use(protect);

// Get learning data for the page
router.get('/:enrollmentId', getLearningData);

// Get resume data for dashboard
router.get('/:enrollmentId/resume', getResumeData);

// Get progress only
router.get('/:enrollmentId/progress', getProgress);

// Check if course is completed
router.get('/:enrollmentId/completed', checkCompleted);

// Mark module as completed
router.put('/:enrollmentId/module/:moduleId/complete', markModuleComplete);

// Update last accessed position
router.put('/:enrollmentId/position', updatePosition);

module.exports = router;