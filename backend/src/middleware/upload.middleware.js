const multer = require('multer');
const AppError = require('../utils/AppError');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype && file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }

    cb(new AppError('Only image files are allowed', 400), false);
  },
});

module.exports = upload;