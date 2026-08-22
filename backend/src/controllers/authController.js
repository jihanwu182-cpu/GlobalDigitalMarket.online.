const logger = require('../utils/logger');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { hashPassword, comparePassword } = require('../utils/bcrypt');

const register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    logger.info(`New registration attempt for email: ${email}`);

    // TODO: Check if user exists in database
    // TODO: Hash password and store user
    // TODO: Return user data and tokens

    res.status(201).json({
      message: 'User registered successfully',
      user: { email, firstName, lastName },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    logger.info(`Login attempt for email: ${email}`);

    // TODO: Find user in database
    // TODO: Compare password
    // TODO: Generate tokens
    // TODO: Return tokens

    res.status(200).json({
      message: 'Login successful',
      accessToken: 'token_here',
      refreshToken: 'refresh_token_here',
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // TODO: Invalidate token in Redis
    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};

const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    // TODO: Verify refresh token
    // TODO: Generate new access token
    res.status(200).json({ accessToken: 'new_token_here' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
