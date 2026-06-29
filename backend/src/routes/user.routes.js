const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');

// Placeholder routes - will be implemented in Step 5
router.get('/profile', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User profile - coming soon',
    data: req.user
  });
});

router.get('/enrollments', protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: 'User enrollments - coming soon',
    data: []
  });
});

module.exports = router;