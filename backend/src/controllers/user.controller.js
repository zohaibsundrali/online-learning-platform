const User = require('../models/User.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Upload profile picture
// @route   POST /api/users/upload-avatar
// @access  Private
const uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please upload an image', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: req.file.path },
    { new: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user,
    message: 'Profile picture updated successfully',
  });
});

// @desc    Remove profile picture
// @route   DELETE /api/users/avatar
// @access  Private
const removeAvatar = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: null },
    { new: true }
  ).select('-password');

  res.status(200).json({
    success: true,
    data: user,
    message: 'Profile picture removed successfully',
  });
});

module.exports = {
  uploadAvatar,
  removeAvatar,
};