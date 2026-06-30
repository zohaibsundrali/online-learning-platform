const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Enrollment = require('../models/Enrollment.model');
const Course = require('../models/Course.model');
const User = require('../models/User.model');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

// @desc    Generate course completion certificate
// @route   GET /api/certificates/:enrollmentId
// @access  Private
const generateCertificate = catchAsync(async (req, res, next) => {
  const { enrollmentId } = req.params;

  const enrollment = await Enrollment.findById(enrollmentId)
    .populate('user', 'name email')
    .populate('course', 'title instructorName');

  if (!enrollment) {
    return next(new AppError('Enrollment not found', 404));
  }

  // Check if user owns this enrollment
  if (enrollment.user._id.toString() !== req.user.id) {
    return next(new AppError('Unauthorized', 403));
  }

  // Check if course is completed
  if (enrollment.progress < 100) {
    return next(new AppError('Course not completed yet', 400));
  }

  // Generate PDF
  const doc = new PDFDocument({
    layout: 'landscape',
    size: 'A4',
  });

  // Set response headers
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename=certificate-${enrollment.course.slug || 'course'}.pdf`
  );

  doc.pipe(res);

  // Certificate Design
  const { user, course } = enrollment;
  const completionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Background
  doc.rect(0, 0, 842, 595).fill('#4A3F40');

  // Border
  doc
    .rect(40, 40, 762, 515)
    .stroke('#8AA39B')
    .lineWidth(3);

  // Inner Border
  doc
    .rect(50, 50, 742, 495)
    .stroke('#8AA39B')
    .lineWidth(1.5);

  // Title
  doc
    .fontSize(48)
    .font('Helvetica-Bold')
    .fillColor('#8AA39B')
    .text('Certificate of Completion', 0, 120, {
      align: 'center',
    });

  // Decorative line
  doc
    .moveTo(250, 180)
    .lineTo(592, 180)
    .stroke('#C08B5C')
    .lineWidth(2);

  // Body text
  doc
    .fontSize(18)
    .font('Helvetica')
    .fillColor('#DBE2DC')
    .text('This certificate is proudly presented to', 0, 220, {
      align: 'center',
    });

  // User name
  doc
    .fontSize(36)
    .font('Helvetica-Bold')
    .fillColor('#E07A5F')
    .text(user.name, 0, 260, {
      align: 'center',
    });

  doc
    .fontSize(18)
    .font('Helvetica')
    .fillColor('#DBE2DC')
    .text('for successfully completing the course', 0, 320, {
      align: 'center',
    });

  // Course title
  doc
    .fontSize(28)
    .font('Helvetica-Bold')
    .fillColor('#8AA39B')
    .text(course.title, 0, 360, {
      align: 'center',
    });

  // Instructor
  doc
    .fontSize(14)
    .font('Helvetica')
    .fillColor('#DBE2DC')
    .text(`Instructor: ${course.instructorName || 'LearnHub'}`, 0, 420, {
      align: 'center',
    });

  // Date
  doc
    .fontSize(12)
    .font('Helvetica')
    .fillColor('#DBE2DC')
    .text(`Date: ${completionDate}`, 0, 460, {
      align: 'center',
    });

  // Footer
  doc
    .fontSize(10)
    .font('Helvetica')
    .fillColor('#DBE2DC')
    .opacity(0.4)
    .text('LearnHub - Empowering Learners Worldwide', 0, 530, {
      align: 'center',
    });

  doc.end();
});

module.exports = { generateCertificate };