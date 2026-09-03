const pool = require('../config/database');
const logger = require('../utils/logger');

// ============================================================
// ENSURE TESTIMONIAL TABLE
// ============================================================

const ensureTestimonialsTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id SERIAL PRIMARY KEY,

      name VARCHAR(150) NOT NULL,

      country VARCHAR(100)
        NOT NULL DEFAULT 'Global Client',

      rating INTEGER
        NOT NULL DEFAULT 5,

      testimonial TEXT
        NOT NULL,

      photo_url TEXT,

      status VARCHAR(20)
        NOT NULL DEFAULT 'DRAFT',

      created_by INTEGER,

      created_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP,

      updated_at TIMESTAMP
        NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    ALTER TABLE testimonials
    ADD COLUMN IF NOT EXISTS photo_url TEXT
  `);

  await pool.query(`
    ALTER TABLE testimonials
    ADD COLUMN IF NOT EXISTS status VARCHAR(20)
    NOT NULL DEFAULT 'DRAFT'
  `);

  await pool.query(`
    ALTER TABLE testimonials
    ADD COLUMN IF NOT EXISTS created_by INTEGER
  `);

  await pool.query(`
    ALTER TABLE testimonials
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP
    NOT NULL DEFAULT CURRENT_TIMESTAMP
  `);

  await pool.query(`
    ALTER TABLE testimonials
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP
    NOT NULL DEFAULT CURRENT_TIMESTAMP
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_testimonials_status
    ON testimonials(status)
  `);
};

// ============================================================
// HELPERS
// ============================================================

const clean = (value) => {
  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  return String(value).trim();
};

const normalizeStatus = (value) => {
  const status = clean(value).toUpperCase();

  if (status === 'PUBLISHED') {
    return 'PUBLISHED';
  }

  return 'DRAFT';
};

const normalizeRating = (value) => {
  const rating = Number(value);

  if (!Number.isInteger(rating)) {
    return 5;
  }

  return Math.max(
    1,
    Math.min(5, rating)
  );
};

const mapRow = (row) => ({
  id: row.id,

  name: row.name,

  country:
    row.country || 'Global Client',

  rating:
    Number(row.rating),

  testimonial:
    row.testimonial,

  photoUrl:
    row.photo_url || '',

  status:
    row.status,

  createdBy:
    row.created_by,

  createdAt:
    row.created_at,

  updatedAt:
    row.updated_at,
});

// ============================================================
// PUBLIC TESTIMONIALS
// ============================================================

const getPublicTestimonials = async (
  req,
  res,
  next
) => {
  try {
    await ensureTestimonialsTable();

    const result =
      await pool.query(`
        SELECT
          id,
          name,
          country,
          rating,
          testimonial,
          photo_url,
          status,
          created_at,
          updated_at

        FROM testimonials

        WHERE status = 'PUBLISHED'

        ORDER BY
          created_at DESC,
          id DESC
      `);

    return res.status(200).json({
      testimonials:
        result.rows.map(mapRow),
    });
  } catch (error) {
    logger.error(
      'Public testimonials error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// ADMIN — GET ALL TESTIMONIALS
// ============================================================

const getAdminTestimonials = async (
  req,
  res,
  next
) => {
  try {
    await ensureTestimonialsTable();

    const result =
      await pool.query(`
        SELECT
          id,
          name,
          country,
          rating,
          testimonial,
          photo_url,
          status,
          created_by,
          created_at,
          updated_at

        FROM testimonials

        ORDER BY
          created_at DESC,
          id DESC
      `);

    return res.status(200).json({
      testimonials:
        result.rows.map(mapRow),
    });
  } catch (error) {
    logger.error(
      'Admin testimonials error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// ADMIN — CREATE TESTIMONIAL
// ============================================================

const createTestimonial = async (
  req,
  res,
  next
) => {
  try {
    await ensureTestimonialsTable();

    const name =
      clean(req.body?.name);

    const country =
      clean(req.body?.country) ||
      'Global Client';

    const testimonial =
      clean(
        req.body?.testimonial ||
        req.body?.text
      );

    const photoUrl =
      clean(
        req.body?.photoUrl ||
        req.body?.photo_url
      );

    const rating =
      normalizeRating(
        req.body?.rating
      );

    const status =
      normalizeStatus(
        req.body?.status
      );

    if (!name) {
      return res.status(400).json({
        message:
          'Customer name is required.',
      });
    }

    if (!testimonial) {
      return res.status(400).json({
        message:
          'Testimonial text is required.',
      });
    }

    const result =
      await pool.query(
        `
        INSERT INTO testimonials (
          name,
          country,
          rating,
          testimonial,
          photo_url,
          status,
          created_by,
          created_at,
          updated_at
        )

        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP
        )

        RETURNING *
        `,
        [
          name,
          country,
          rating,
          testimonial,
          photoUrl || null,
          status,
          req.user?.id || null,
        ]
      );

    return res.status(201).json({
      message:
        'Testimonial created successfully.',

      testimonial:
        mapRow(result.rows[0]),
    });
  } catch (error) {
    logger.error(
      'Create testimonial error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// ADMIN — UPDATE TESTIMONIAL
// ============================================================

const updateTestimonial = async (
  req,
  res,
  next
) => {
  try {
    await ensureTestimonialsTable();

    const id =
      Number(req.params.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        message:
          'Invalid testimonial ID.',
      });
    }

    const name =
      clean(req.body?.name);

    const country =
      clean(req.body?.country) ||
      'Global Client';

    const testimonial =
      clean(
        req.body?.testimonial ||
        req.body?.text
      );

    const photoUrl =
      clean(
        req.body?.photoUrl ||
        req.body?.photo_url
      );

    const rating =
      normalizeRating(
        req.body?.rating
      );

    const status =
      normalizeStatus(
        req.body?.status
      );

    if (
      !name ||
      !testimonial
    ) {
      return res.status(400).json({
        message:
          'Customer name and testimonial text are required.',
      });
    }

    const result =
      await pool.query(
        `
        UPDATE testimonials

        SET
          name = $1,
          country = $2,
          rating = $3,
          testimonial = $4,
          photo_url = $5,
          status = $6,
          updated_at = CURRENT_TIMESTAMP

        WHERE id = $7

        RETURNING *
        `,
        [
          name,
          country,
          rating,
          testimonial,
          photoUrl || null,
          status,
          id,
        ]
      );

    if (
      result.rows.length === 0
    ) {
      return res.status(404).json({
        message:
          'Testimonial not found.',
      });
    }

    return res.status(200).json({
      message:
        'Testimonial updated successfully.',

      testimonial:
        mapRow(result.rows[0]),
    });
  } catch (error) {
    logger.error(
      'Update testimonial error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// ADMIN — DELETE TESTIMONIAL
// ============================================================

const deleteTestimonial = async (
  req,
  res,
  next
) => {
  try {
    await ensureTestimonialsTable();

    const id =
      Number(req.params.id);

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return res.status(400).json({
        message:
          'Invalid testimonial ID.',
      });
    }

    const result =
      await pool.query(
        `
        DELETE FROM testimonials

        WHERE id = $1

        RETURNING
          id,
          name
        `,
        [id]
      );

    if (
      result.rows.length === 0
    ) {
      return res.status(404).json({
        message:
          'Testimonial not found.',
      });
    }

    return res.status(200).json({
      message:
        'Testimonial deleted successfully.',

      testimonial:
        result.rows[0],
    });
  } catch (error) {
    logger.error(
      'Delete testimonial error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  getPublicTestimonials,
  getAdminTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
