const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateDetails,
  updatePassword,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const { registerValidator, loginValidator } = require('../validators/auth.validator');

// Public routes
router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);

// Protected routes
router.get('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;