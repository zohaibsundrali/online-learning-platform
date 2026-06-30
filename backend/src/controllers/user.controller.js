const User = require('../models/User.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const uploadBufferToCloudinary = require('../utils/cloudinaryUploader');

// @desc    Upload profile picture
// @route   POST /api/users/upload-avatar
// @access  Private
const uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file || !req.file.buffer) {
    return next(new AppError('Please upload an image', 400));
  }

  const uploadResult = await uploadBufferToCloudinary(
    req.file.buffer,
    'learnhub-avatars',
    [{ width: 200, height: 200, crop: 'fill' }]
  );

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: uploadResult.secure_url },
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