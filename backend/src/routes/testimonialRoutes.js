const express = require('express');

const {
  authMiddleware,
  adminMiddleware,
} = require('../middleware/auth');

const {
  getPublicTestimonials,
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} = require('../controllers/testimonialController');

const router = express.Router();

// ============================================================
// PUBLIC TESTIMONIALS
// ============================================================

// GET /api/testimonials
// Public — only published testimonials are returned.

router.get(
  '/',
  getPublicTestimonials
);

// ============================================================
// ADMIN TESTIMONIALS
// ============================================================

// GET /api/testimonials/admin
// Protected — administrator only.

router.get(
  '/admin',
  adminMiddleware,
  getAdminTestimonials
);

// POST /api/testimonials/admin
// Create testimonial.

router.post(
  '/admin',
  adminMiddleware,
  createTestimonial
);

// PATCH /api/testimonials/admin/:id
// Update testimonial.

router.patch(
  '/admin/:id',
  adminMiddleware,
  updateTestimonial
);

// DELETE /api/testimonials/admin/:id
// Delete testimonial.

router.delete(
  '/admin/:id',
  adminMiddleware,
  deleteTestimonial
);

module.exports = router;
