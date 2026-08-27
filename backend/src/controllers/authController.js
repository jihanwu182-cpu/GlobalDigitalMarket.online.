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

// =====================================
// REGISTER
// =====================================

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        message: 'All fields are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    logger.info(
      `New registration attempt for email: ${normalizedEmail}`
    );

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'An account with this email already exists.',
      });
    }

    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      `
      INSERT INTO users
        (email, password_hash, first_name, last_name)
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

    const user = result.rows[0];

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
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Registration error:', error);
    return next(error);
  }
};

// =====================================
// LOGIN
// =====================================

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required.',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    logger.info(
      `Login attempt for email: ${normalizedEmail}`
    );

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
        email_verified
      FROM users
      WHERE email = $1
      LIMIT 1
      `,
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

    const user = result.rows[0];

    // Check account status if your database provides it.
    if (
      user.status &&
      !['active', 'ACTIVE'].includes(user.status)
    ) {
      return res.status(403).json({
        message: 'This account is not active.',
      });
    }

    const passwordIsValid = await comparePassword(
      password,
      user.password_hash
    );

    if (!passwordIsValid) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      });
    }

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
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error('Login error:', error);
    return next(error);
  }
};

// =====================================
// LOGOUT
// =====================================

const logout = async (req, res, next) => {
  try {
    return res.status(200).json({
      message: 'Logout successful.',
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================
// REFRESH TOKEN
// =====================================

const refreshToken = async (req, res, next) => {
  try {
    return res.status(501).json({
      message: 'Refresh token is not implemented yet.',
    });
  } catch (error) {
    return next(error);
  }
};

// =====================================
// EXPORTS
// =====================================

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
