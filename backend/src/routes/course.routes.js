const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// Placeholder routes - will be implemented in Step 5
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Course routes - coming soon',
    data: []
  });
});

router.get('/:id', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Course details - coming soon',
    data: null
  });
});

router.post('/', protect, (req, res) => {
  res.status(201).json({
    success: true,
    message: 'Course created - coming soon',
    data: null
  });
});

module.exports = router;