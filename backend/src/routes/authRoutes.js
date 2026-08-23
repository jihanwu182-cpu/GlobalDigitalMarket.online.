const pool = require('../config/database');
const logger = require('../utils/logger');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { hashPassword } = require('../utils/bcrypt');

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const normalizedEmail = email.trim().toLowerCase();

    logger.info(`New registration attempt for email: ${normalizedEmail}`);

    // Check whether the email already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    // Hash the password before storing it
    const passwordHash = await hashPassword(password);

    // Create the user
    const result = await pool.query(
      `
      INSERT INTO users
        (email, password_hash, first_name, last_name)
      VALUES
        ($1, $2, $3, $4)
      RETURNING id, email, first_name, last_name, role, status, email_verified, created_at
      `,
      [
        normalizedEmail,
        passwordHash,
        firstName.trim(),
        lastName.trim(),
      ]
    );

    const user = result.rows[0];

    // Generate authentication tokens
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
      message: 'User registered successfully.',
      user,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    logger.info(`Login attempt for email: ${email}`);

    // Login will be implemented after registration is working.
    return res.status(501).json({
      message: 'Login endpoint is not implemented yet.',
    });
  } catch (error) {
    return next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      message: 'Logout successful',
    });
  } catch (error) {
    return next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    return res.status(501).json({
      message: 'Refresh token endpoint is not implemented yet.',
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
