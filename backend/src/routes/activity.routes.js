const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const Activity = require('../models/Activity.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Get user activities
// @route   GET /api/activities
// @access  Private
router.get('/', protect, catchAsync(async (req, res, next) => {
  const { limit = 10, type, read } = req.query;
  
  // Build filter
  const filter = { user: req.user.id };
  if (type) filter.type = type;
  if (read !== undefined) filter.read = read === 'true';

  const activities = await Activity.find(filter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .lean();

  const unreadCount = await Activity.getUnreadCount(req.user.id);

  res.status(200).json({
    success: true,
    count: activities.length,
    unreadCount,
    data: activities,
  });
}));

// @desc    Get unread count
// @route   GET /api/activities/unread
// @access  Private
router.get('/unread', protect, catchAsync(async (req, res, next) => {
  const count = await Activity.getUnreadCount(req.user.id);
  
  res.status(200).json({
    success: true,
    data: { unreadCount: count },
  });
}));

// @desc    Mark activity as read
// @route   PUT /api/activities/:id/read
// @access  Private
router.put('/:id/read', protect, catchAsync(async (req, res, next) => {
  const activity = await Activity.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { read: true },
    { new: true }
  );

  if (!activity) {
    return next(new AppError('Activity not found', 404));
  }

  res.status(200).json({
    success: true,
    data: activity,
  });
}));

// @desc    Mark all activities as read
// @route   PUT /api/activities/read-all
// @access  Private
router.put('/read-all', protect, catchAsync(async (req, res, next) => {
  await Activity.markAllAsRead(req.user.id);
  
  res.status(200).json({
    success: true,
    message: 'All activities marked as read',
  });
}));

// @desc    Delete activity
// @route   DELETE /api/activities/:id
// @access  Private
router.delete('/:id', protect, catchAsync(async (req, res, next) => {
  const activity = await Activity.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!activity) {
    return next(new AppError('Activity not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Activity deleted successfully',
  });
}));

module.exports = router;