const pool = require('../config/database');
const logger = require('../utils/logger');

const {
  generateAccessToken,
  generateRefreshToken,
} = require('../utils/jwt');

const {
  hashPassword,
  comparePassword,
} = require('../utils/bcrypt');


// ============================================================
// REGISTER
// ============================================================

const register = async (req, res, next) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: 'Please provide email, password, first name and last name.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    logger.info(
      `New registration attempt for email: ${normalizedEmail}`
    );

    // Check if user already exists
    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const result = await pool.query(
      `
      INSERT INTO users
        (
          email,
          password_hash,
          first_name,
          last_name
        )
      VALUES
        ($1, $2, $3, $4)
      RETURNING
        id,
        email,
        first_name,
        last_name,
        role,
        status,
        email_verified,
        created_at
      `,
      [
        normalizedEmail,
        passwordHash,
        firstName.trim(),
        lastName.trim(),
      ]
    );

    const databaseUser = result.rows[0];

    // Format user for frontend
    const user = {
      id: databaseUser.id,
      email: databaseUser.email,
      firstName: databaseUser.first_name,
      lastName: databaseUser.last_name,
      role: databaseUser.role,
      status: databaseUser.status,
      emailVerified: databaseUser.email_verified,
      createdAt: databaseUser.created_at,
    };

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
    });

    return res.status(201).json({
      message: 'Account created successfully.',
      user,
      accessToken,
      refreshToken,
    });

  } catch (error) {
    logger.error('Registration error:', error);
    return next(error);
  }
};


// ============================================================
// LOGIN
// ============================================================

const login = async (req, res, next) => {
  try {
    const {
      email,
      password,
    } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    logger.info(
      `Login attempt for email: ${normalizedEmail}`
    );

    // Find user
    const result = await pool.query(
      `
      SELECT
        id,
        email,
        password_hash,
        first_name,
        last_name,
        role,
        status,
        email_verified,
        created_at
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [normalizedEmail]
    );

    // Do not reveal whether the email exists
    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const databaseUser = result.rows[0];

    // Check password
    const passwordMatches = await comparePassword(
      password,
      databaseUser.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    // Check account status if the database has one
    if (
      databaseUser.status &&
      ['blocked', 'suspended', 'disabled'].includes(
        String(databaseUser.status).toLowerCase()
      )
    ) {
      return res.status(403).json({
        message: 'Your account is currently unavailable. Please contact support.',
      });
    }

    // Format user for frontend
    const user = {
      id: databaseUser.id,
      email: databaseUser.email,
      firstName: databaseUser.first_name,
      lastName: databaseUser.last_name,
      role: databaseUser.role,
      status: databaseUser.status,
      emailVerified: databaseUser.email_verified,
      createdAt: databaseUser.created_at,
    };

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
    });

    logger.info(
      `Successful login for email: ${normalizedEmail}`
    );

    return res.status(200).json({
      message: 'Login successful.',
      user,
      accessToken,
      refreshToken,
    });

  } catch (error) {
    logger.error('Login error:', error);
    return next(error);
  }
};


// ============================================================
// LOGOUT
// ============================================================

const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      message: 'Logout successful.',
    });
  } catch (error) {
    return next(error);
  }
};


// ============================================================
// REFRESH TOKEN
// ============================================================

const refreshToken = async (req, res, next) => {
  try {
    const token =
      req.body.refreshToken ||
      req.body.token;

    if (!token) {
      return res.status(401).json({
        message: 'Refresh token is required.',
      });
    }

    /*
     * The refresh-token verification should normally be handled
     * by your JWT utility.
     *
     * If your existing jwt.js exports verifyRefreshToken,
     * we will connect it here.
     *
     * For now, return a clear response instead of pretending
     * that refresh-token functionality is working.
     */

    return res.status(501).json({
      message: 'Refresh token verification is not configured yet.',
    });

  } catch (error) {
    logger.error('Refresh token error:', error);
    return next(error);
  }
};


// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
