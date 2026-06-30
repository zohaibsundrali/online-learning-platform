const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { generateCertificate } = require('../controllers/certificate.controller');

router.get('/:enrollmentId', protect, generateCertificate);

module.exports = router;