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

const {
  sendEmail,
} = require('../utils/email');

const jwt = require('jsonwebtoken');

// ============================================================
// SUPPORTED CURRENCIES
// ============================================================

const SUPPORTED_CURRENCIES = [
  'USD',
  'EUR',
  'GBP',
  'ZAR',
  'NGN',
  'KES',
  'GHS',
  'CAD',
  'AUD',
  'CHF',
  'JPY',
  'CNY',
  'AED',
  'SAR',
  'INR',
];

// ============================================================
// HELPERS
// ============================================================

const normalizeText = (value) => {
  if (value === undefined || value === null) {
    return '';
  }

  return String(value).trim();
};

const generateReferralCode = (userId) => {
  const randomPart = Math.random()
    .toString(36)
    .substring(2, 8)
    .toUpperCase();

  return `GDM${userId}${randomPart}`;
};

const generateAccountNumber = (userId) => {
  const timestamp = Date.now()
    .toString()
    .slice(-8);

  return `GDM-${userId}-${timestamp}`;
};

// ============================================================
// REGISTER
// ============================================================

const register = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const {
      email,
      password,
      firstName,
      lastName,
      username,
      country,
      preferredCurrency,
      phone,
      referrerCode,
    } = req.body || {};

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !username ||
      !phone ||
      !country ||
      !preferredCurrency
    ) {
      return res.status(400).json({
        message:
          'Please provide email, password, first name, last name, username, phone number, country and preferred currency.',
      });
    }

    const normalizedEmail = normalizeText(email).toLowerCase();
    const normalizedFirstName = normalizeText(firstName);
    const normalizedLastName = normalizeText(lastName);
    const normalizedUsername = normalizeText(username);
    const normalizedPhone = normalizeText(phone);
    const normalizedCountry = normalizeText(country);
    const normalizedCurrency =
      normalizeText(preferredCurrency).toUpperCase();
    const normalizedReferrerCode =
      normalizeText(referrerCode);

    if (
      !normalizedEmail.includes('@') ||
      !normalizedEmail.includes('.')
    ) {
      return res.status(400).json({
        message: 'Please provide a valid email address.',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message:
          'Password must contain at least 8 characters.',
      });
    }

    if (normalizedFirstName.length < 2) {
      return res.status(400).json({
        message: 'Please provide a valid first name.',
      });
    }

    if (normalizedLastName.length < 2) {
      return res.status(400).json({
        message: 'Please provide a valid last name.',
      });
    }

    if (normalizedUsername.length < 3) {
      return res.status(400).json({
        message:
          'Username must contain at least 3 characters.',
      });
    }

    if (normalizedPhone.length < 7) {
      return res.status(400).json({
        message: 'Please provide a valid phone number.',
      });
    }

    if (!normalizedCountry) {
      return res.status(400).json({
        message: 'Please select your country.',
      });
    }

    if (
      !SUPPORTED_CURRENCIES.includes(
        normalizedCurrency
      )
    ) {
      return res.status(400).json({
        message:
          'The selected currency is not supported.',
        supportedCurrencies:
          SUPPORTED_CURRENCIES,
      });
    }

    logger.info(
      `New registration attempt for email: ${normalizedEmail}`
    );

    await client.query('BEGIN');

    // --------------------------------------------------------
    // CHECK EMAIL
    // --------------------------------------------------------

    const existingEmail = await client.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(email) = LOWER($1)
      LIMIT 1
      `,
      [normalizedEmail]
    );

    if (existingEmail.rows.length > 0) {
      await client.query('ROLLBACK');

      return res.status(409).json({
        message:
          'An account with this email already exists.',
      });
    }

    // --------------------------------------------------------
    // CHECK USERNAME
    // --------------------------------------------------------

    const existingUsername = await client.query(
      `
      SELECT id
      FROM users
      WHERE LOWER(username) = LOWER($1)
      LIMIT 1
      `,
      [normalizedUsername]
    );

    if (existingUsername.rows.length > 0) {
      await client.query('ROLLBACK');

      return res.status(409).json({
        message:
          'This username is already in use.',
      });
    }

    // --------------------------------------------------------
    // CHECK PHONE
    // --------------------------------------------------------

    const existingPhone = await client.query(
      `
      SELECT id
      FROM users
      WHERE phone = $1
      LIMIT 1
      `,
      [normalizedPhone]
    );

    if (existingPhone.rows.length > 0) {
      await client.query('ROLLBACK');

      return res.status(409).json({
        message:
          'This phone number is already associated with an account.',
      });
    }

    // --------------------------------------------------------
    // REFERRER
    // --------------------------------------------------------

    let validReferrerCode = null;

    if (normalizedReferrerCode) {
      const referrerResult = await client.query(
        `
        SELECT id
        FROM users
        WHERE referral_code = $1
        LIMIT 1
        `,
        [normalizedReferrerCode]
      );

      if (referrerResult.rows.length === 0) {
        await client.query('ROLLBACK');

        return res.status(400).json({
          message:
            'The referrer code you entered is not valid.',
        });
      }

      validReferrerCode =
        normalizedReferrerCode;
    }

    // --------------------------------------------------------
    // HASH PASSWORD
    // --------------------------------------------------------

    const passwordHash =
      await hashPassword(password);

    // --------------------------------------------------------
    // CREATE USER
    // --------------------------------------------------------

    const userResult = await client.query(
      `
      INSERT INTO users
      (
        email,
        password_hash,
        first_name,
        last_name,
        username,
        phone,
        country,
        preferred_currency,
        referrer_code,
        role,
        status,
        email_verified,
        identity_verification_status
      )
      VALUES
      (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        'user',
        'active',
        FALSE,
        'PENDING'
      )
      RETURNING
        id,
        email,
        first_name,
        last_name,
        username,
        phone,
        country,
        preferred_currency,
        referrer_code,
        role,
        status,
        email_verified,
        identity_verification_status,
        created_at
      `,
      [
        normalizedEmail,
        passwordHash,
        normalizedFirstName,
        normalizedLastName,
        normalizedUsername,
        normalizedPhone,
        normalizedCountry,
        normalizedCurrency,
        validReferrerCode,
      ]
    );

    const databaseUser =
      userResult.rows[0];

    // --------------------------------------------------------
    // REFERRAL CODE
    // --------------------------------------------------------

    let referralCode =
      generateReferralCode(
        databaseUser.id
      );

    let referralAttempts = 0;

    while (referralAttempts < 5) {
      const referralCheck =
        await client.query(
          `
          SELECT id
          FROM users
          WHERE referral_code = $1
          LIMIT 1
          `,
          [referralCode]
        );

      if (referralCheck.rows.length === 0) {
        break;
      }

      referralAttempts += 1;

      referralCode =
        generateReferralCode(
          databaseUser.id
        );
    }

    await client.query(
      `
      UPDATE users
      SET
        referral_code = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [
        referralCode,
        databaseUser.id,
      ]
    );

    // --------------------------------------------------------
    // CREATE ACCOUNT
    // --------------------------------------------------------

    const accountNumber =
      generateAccountNumber(
        databaseUser.id
      );

    const accountResult =
      await client.query(
        `
        INSERT INTO accounts
        (
          user_id,
          account_number,
          account_type,
          account_name,
          currency,
          balance,
          deposit,
          profits,
          available_balance,
          bonus,
          referrer_bonus,
          buying_power,
          margin_available,
          status
        )
        VALUES
        (
          $1,
          $2,
          'standard',
          'Global Digital Market Account',
          $3,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          'active'
        )
        RETURNING
          id,
          account_number,
          account_type,
          account_name,
          currency,
          balance,
          available_balance,
          status,
          created_at
        `,
        [
          databaseUser.id,
          accountNumber,
          normalizedCurrency,
        ]
      );

    const account =
      accountResult.rows[0];

    await client.query('COMMIT');

    // --------------------------------------------------------
    // WELCOME EMAIL
    // --------------------------------------------------------

    try {
      await sendEmail({
        to: normalizedEmail,

        subject:
          'Welcome to Global Digital Market',

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 600px;
              margin: 0 auto;
              padding: 30px;
            "
          >
            <h2>
              Welcome to Global Digital Market
            </h2>

            <p>
              Hello ${normalizedFirstName},
            </p>

            <p>
              Your Global Digital Market account
              has been created successfully.
            </p>

            <p>
              <strong>Username:</strong>
              ${normalizedUsername}
            </p>

            <p>
              <strong>Email:</strong>
              ${normalizedEmail}
            </p>

            <p>
              You can now log in to your account
              using the credentials you created.
            </p>

            <p>
              Thank you for choosing
              Global Digital Market.
            </p>

            <p>
              Regards,<br>
              Global Digital Market Support
            </p>
          </div>
        `,

        text: `
Welcome to Global Digital Market.

Hello ${normalizedFirstName},

Your Global Digital Market account has been created successfully.

Username: ${normalizedUsername}
Email: ${normalizedEmail}

You can now log in to your account using the credentials you created.

Thank you for choosing Global Digital Market.

Regards,
Global Digital Market Support
        `,
      });

      logger.info(
        `Welcome email sent successfully to ${normalizedEmail}`
      );
    } catch (emailError) {
      logger.error(
        `Welcome email failed for ${normalizedEmail}:`,
        emailError
      );
    }

    // --------------------------------------------------------
    // USER OBJECT
    // --------------------------------------------------------

    const user = {
      id: databaseUser.id,
      email: databaseUser.email,
      firstName: databaseUser.first_name,
      lastName: databaseUser.last_name,
      username: databaseUser.username,
      phone: databaseUser.phone,
      country: databaseUser.country,
      preferredCurrency:
        databaseUser.preferred_currency,
      referralCode,
      referrerCode:
        databaseUser.referrer_code,
      role: databaseUser.role,
      status: databaseUser.status,
      emailVerified:
        databaseUser.email_verified,
      identityVerificationStatus:
        databaseUser.identity_verification_status,
      createdAt:
        databaseUser.created_at,
    };

    // --------------------------------------------------------
    // TOKENS
    // --------------------------------------------------------

    const accessToken =
      generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

    const refreshToken =
      generateRefreshToken({
        id: user.id,
        email: user.email,
      });

    logger.info(
      `Successful registration for email: ${normalizedEmail}`
    );

    return res.status(201).json({
      message:
        'Account created successfully.',

      user,

      account: {
        id: account.id,
        accountNumber:
          account.account_number,
        accountType:
          account.account_type,
        accountName:
          account.account_name,
        currency:
          account.currency,
        balance:
          Number(account.balance || 0),
        availableBalance:
          Number(
            account.available_balance || 0
          ),
        status:
          account.status,
        createdAt:
          account.created_at,
      },

      accessToken,
      refreshToken,
    });
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      logger.error(
        'Registration rollback error:',
        rollbackError
      );
    }

    logger.error(
      'Registration error:',
      error
    );

    return next(error);
  } finally {
    client.release();
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
    } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({
        message:
          'Email and password are required.',
      });
    }

    const normalizedEmail =
      normalizeText(email).toLowerCase();

    logger.info(
      `Login attempt for email: ${normalizedEmail}`
    );

    const result =
      await pool.query(
        `
        SELECT
          u.id,
          u.email,
          u.password_hash,
          u.first_name,
          u.last_name,
          u.username,
          u.phone,
          u.country,
          u.preferred_currency,
          u.referral_code,
          u.referrer_code,
          u.role,
          u.status,
          u.email_verified,
          u.identity_verification_status,
          u.created_at,

          a.id AS account_id,
          a.account_number,
          a.currency AS account_currency,
          a.balance,
          a.available_balance

        FROM users u

        LEFT JOIN accounts a
          ON a.user_id = u.id

        WHERE LOWER(u.email) = LOWER($1)

        LIMIT 1
        `,
        [normalizedEmail]
      );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message:
          'Invalid email or password.',
      });
    }

    const databaseUser =
      result.rows[0];

    const passwordMatches =
      await comparePassword(
        password,
        databaseUser.password_hash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          'Invalid email or password.',
      });
    }

    if (
      databaseUser.status &&
      [
        'blocked',
        'suspended',
        'disabled',
      ].includes(
        String(
          databaseUser.status
        ).toLowerCase()
      )
    ) {
      return res.status(403).json({
        message:
          'Your account is currently unavailable. Please contact support.',
      });
    }

    const user = {
      id: databaseUser.id,
      email: databaseUser.email,
      firstName:
        databaseUser.first_name,
      lastName:
        databaseUser.last_name,
      username:
        databaseUser.username || '',
      phone:
        databaseUser.phone || '',
      country:
        databaseUser.country || '',
      preferredCurrency:
        databaseUser.preferred_currency ||
        databaseUser.account_currency ||
        'USD',
      referralCode:
        databaseUser.referral_code || '',
      referrerCode:
        databaseUser.referrer_code || '',
      role:
        databaseUser.role,
      status:
        databaseUser.status,
      emailVerified:
        databaseUser.email_verified,
      identityVerificationStatus:
        databaseUser.identity_verification_status ||
        'PENDING',
      createdAt:
        databaseUser.created_at,
    };

    const account =
      databaseUser.account_id
        ? {
            id:
              databaseUser.account_id,

            accountNumber:
              databaseUser.account_number,

            currency:
              databaseUser.account_currency ||
              user.preferredCurrency,

            balance:
              Number(
                databaseUser.balance || 0
              ),

            availableBalance:
              Number(
                databaseUser.available_balance ||
                0
              ),
          }
        : null;

    const accessToken =
      generateAccessToken({
        id: user.id,
        email: user.email,
        role: user.role,
      });

    const refreshToken =
      generateRefreshToken({
        id: user.id,
        email: user.email,
      });

    logger.info(
      `Successful login for email: ${normalizedEmail}`
    );

    return res.status(200).json({
      message:
        'Login successful.',
      user,
      account,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    logger.error(
      'Login error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// LOGOUT
// ============================================================

const logout = async (
  req,
  res,
  next
) => {
  try {
    return res.status(200).json({
      message:
        'Logout successful.',
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// REFRESH TOKEN
// ============================================================

const refreshToken = async (
  req,
  res,
  next
) => {
  try {
    const token =
      req.body?.refreshToken ||
      req.body?.token;

    if (!token) {
      return res.status(401).json({
        message:
          'Refresh token is required.',
      });
    }

    return res.status(501).json({
      message:
        'Refresh token verification is not configured yet.',
    });
  } catch (error) {
    logger.error(
      'Refresh token error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// GET USER FROM ACCESS TOKEN
// ============================================================

const getAuthenticatedUser = (req) => {
  const authHeader =
    req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token =
    authHeader.substring(7).trim();

  if (!token) {
    return null;
  }

  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      'JWT_SECRET is not configured.'
    );
  }

  try {
    return jwt.verify(
      token,
      secret
    );
  } catch (error) {
    return null;
  }
};

// ============================================================
// CHANGE PASSWORD
// ============================================================

const changePassword = async (
  req,
  res,
  next
) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body || {};

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          'Current password and new password are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message:
          'New password must contain at least 8 characters.',
      });
    }

    if (
      currentPassword === newPassword
    ) {
      return res.status(400).json({
        message:
          'New password must be different from your current password.',
      });
    }

    const authenticatedUser =
      getAuthenticatedUser(req);

    if (!authenticatedUser?.id) {
      return res.status(401).json({
        message:
          'Authentication is required.',
      });
    }

    const result =
      await pool.query(
        `
        SELECT
          id,
          password_hash,
          status
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [authenticatedUser.id]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'User account not found.',
      });
    }

    const user =
      result.rows[0];

    if (
      user.status &&
      [
        'blocked',
        'suspended',
        'disabled',
      ].includes(
        String(
          user.status
        ).toLowerCase()
      )
    ) {
      return res.status(403).json({
        message:
          'Your account is currently unavailable.',
      });
    }

    const passwordMatches =
      await comparePassword(
        currentPassword,
        user.password_hash
      );

    if (!passwordMatches) {
      return res.status(401).json({
        message:
          'Current password is incorrect.',
      });
    }

    const newPasswordHash =
      await hashPassword(
        newPassword
      );

    await pool.query(
      `
      UPDATE users
      SET
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [
        newPasswordHash,
        user.id,
      ]
    );

    logger.info(
      `Password changed successfully for user ID ${user.id}`
    );

    return res.status(200).json({
      message:
        'Password changed successfully.',
    });
  } catch (error) {
    logger.error(
      'Change password error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// FORGOT PASSWORD
// ============================================================

const forgotPassword = async (
  req,
  res,
  next
) => {
  try {
    const {
      email,
    } = req.body || {};

    if (!email) {
      return res.status(400).json({
        message:
          'Please enter your email address.',
      });
    }

    const normalizedEmail =
      normalizeText(email).toLowerCase();

    const result =
      await pool.query(
        `
        SELECT
          id,
          email,
          first_name,
          status
        FROM users
        WHERE LOWER(email) = LOWER($1)
        LIMIT 1
        `,
        [normalizedEmail]
      );

    const safeMessage =
      'If an account exists with this email, a reset link has been sent.';

    if (result.rows.length === 0) {
      return res.status(200).json({
        message: safeMessage,
      });
    }

    const user =
      result.rows[0];

    if (
      user.status &&
      [
        'blocked',
        'suspended',
        'disabled',
      ].includes(
        String(
          user.status
        ).toLowerCase()
      )
    ) {
      return res.status(200).json({
        message: safeMessage,
      });
    }

    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        'JWT_SECRET is not configured.'
      );
    }

    // --------------------------------------------------------
    // RESET TOKEN
    // --------------------------------------------------------

    const resetToken =
      jwt.sign(
        {
          id: user.id,
          email: user.email,
          purpose: 'password-reset',
        },
        secret,
        {
          expiresIn: '30m',
        }
      );

    // --------------------------------------------------------
    // FRONTEND URL
    // --------------------------------------------------------

    const frontendUrl =
      process.env.FRONTEND_URL ||
      'https://www.globaldigitalmarket.online';

    const resetUrl =
      `${frontendUrl}/#/reset-password?token=${encodeURIComponent(
        resetToken
      )}`;

    // --------------------------------------------------------
    // SEND EMAIL
    // --------------------------------------------------------

    try {
      await sendEmail({
        to: user.email,

        subject:
          'Reset Your Global Digital Market Password',

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              line-height: 1.6;
              max-width: 600px;
              margin: 0 auto;
              padding: 30px;
              color: #172033;
            "
          >

            <h2>
              Password Reset Request
            </h2>

            <p>
              Hello ${user.first_name || 'there'},
            </p>

            <p>
              We received a request to reset the
              password for your Global Digital Market
              account.
            </p>

            <p>
              Click the button below to create a
              new password:
            </p>

            <p>
              <a
                href="${resetUrl}"
                style="
                  display: inline-block;
                  padding: 14px 24px;
                  background: #2563eb;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: bold;
                "
              >
                Reset Password
              </a>
            </p>

            <p>
              This link will expire in
              <strong>30 minutes</strong>.
            </p>

            <p>
              If you did not request a password reset,
              you can safely ignore this email.
            </p>

            <p>
              Regards,<br>
              Global Digital Market Support
            </p>

          </div>
        `,

        text: `
Password Reset Request

Hello ${user.first_name || 'there'},

We received a request to reset the password for your Global Digital Market account.

Reset your password here:

${resetUrl}

This link will expire in 30 minutes.

If you did not request a password reset, you can safely ignore this email.

Regards,
Global Digital Market Support
        `,
      });

      logger.info(
        `Password reset email sent to ${user.email}`
      );
    } catch (emailError) {
      logger.error(
        `Password reset email failed for ${user.email}:`,
        emailError
      );
    }

    return res.status(200).json({
      message: safeMessage,
    });
  } catch (error) {
    logger.error(
      'Forgot password error:',
      error
    );

    return next(error);
  }
};

// ============================================================
// RESET PASSWORD
// ============================================================

const resetPassword = async (
  req,
  res,
  next
) => {
  try {
    const {
      token,
      newPassword,
    } = req.body || {};

    if (!token || !newPassword) {
      return res.status(400).json({
        message:
          'Reset token and new password are required.',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message:
          'New password must contain at least 8 characters.',
      });
    }

    const secret =
      process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        'JWT_SECRET is not configured.'
      );
    }

    // --------------------------------------------------------
    // VERIFY RESET TOKEN
    // --------------------------------------------------------

    let decoded;

    try {
      decoded =
        jwt.verify(
          token,
          secret
        );
    } catch (tokenError) {
      return res.status(400).json({
        message:
          'This password reset link is invalid or has expired. Please request a new one.',
      });
    }

    if (
      decoded?.purpose !==
      'password-reset'
    ) {
      return res.status(400).json({
        message:
          'Invalid password reset token.',
      });
    }

    if (!decoded?.id) {
      return res.status(400).json({
        message:
          'Invalid password reset token.',
      });
    }

    // --------------------------------------------------------
    // FIND USER
    // --------------------------------------------------------

    const result =
      await pool.query(
        `
        SELECT
          id,
          email,
          password_hash,
          status
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [decoded.id]
      );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'User account not found.',
      });
    }

    const user =
      result.rows[0];

    // --------------------------------------------------------
    // ACCOUNT STATUS
    // --------------------------------------------------------

    if (
      user.status &&
      [
        'blocked',
        'suspended',
        'disabled',
      ].includes(
        String(
          user.status
        ).toLowerCase()
      )
    ) {
      return res.status(403).json({
        message:
          'Your account is currently unavailable.',
      });
    }

    // --------------------------------------------------------
    // PREVENT SAME PASSWORD
    // --------------------------------------------------------

    const samePassword =
      await comparePassword(
        newPassword,
        user.password_hash
      );

    if (samePassword) {
      return res.status(400).json({
        message:
          'Please choose a different password from your previous password.',
      });
    }

    // --------------------------------------------------------
    // HASH NEW PASSWORD
    // --------------------------------------------------------

    const newPasswordHash =
      await hashPassword(
        newPassword
      );

    // --------------------------------------------------------
    // UPDATE PASSWORD
    // --------------------------------------------------------

    await pool.query(
      `
      UPDATE users
      SET
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [
        newPasswordHash,
        user.id,
      ]
    );

    logger.info(
      `Password reset successfully for user ID ${user.id}`
    );

    return res.status(200).json({
      message:
        'Password reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    logger.error(
      'Reset password error:',
      error
    );

    return next(error);
  }
};
// ============================================================
// SEND EMAIL VERIFICATION
// ============================================================

const sendVerificationEmail = async (
  req,
  res,
  next
) => {
  try {
    const authenticatedUser =
      getAuthenticatedUser(req);

    if (!authenticatedUser?.id) {
      return res.status(401).json({
        message:
          'Authentication is required.',
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        email,
        first_name,
        email_verified,
        status
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [authenticatedUser.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'User account not found.',
      });
    }

    const user = result.rows[0];

    if (user.email_verified) {
      return res.status(400).json({
        message:
          'Your email address is already verified.',
      });
    }

    if (
      user.status &&
      [
        'blocked',
        'suspended',
        'disabled',
      ].includes(
        String(user.status).toLowerCase()
      )
    ) {
      return res.status(403).json({
        message:
          'Your account is currently unavailable.',
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        'JWT_SECRET is not configured.'
      );
    }

    const verificationToken =
      jwt.sign(
        {
          id: user.id,
          email: user.email,
          purpose: 'email-verification',
        },
        secret,
        {
          expiresIn: '24h',
        }
      );

    const frontendUrl =
      process.env.FRONTEND_URL ||
      'https://www.globaldigitalmarket.online';

    const verificationUrl =
      `${frontendUrl}/#/verify-email?token=${encodeURIComponent(
        verificationToken
      )}`;

    await sendEmail({
      to: user.email,

      subject:
        'Verify Your Global Digital Market Email',

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            line-height: 1.6;
            max-width: 600px;
            margin: 0 auto;
            padding: 30px;
            color: #172033;
          "
        >
          <h2>
            Verify Your Email Address
          </h2>

          <p>
            Hello ${user.first_name || 'there'},
          </p>

          <p>
            Please verify your email address
            to complete your Global Digital Market
            account setup.
          </p>

          <p>
            <a
              href="${verificationUrl}"
              style="
                display: inline-block;
                padding: 14px 24px;
                background: #2563eb;
                color: #ffffff;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
              "
            >
              Verify Email
            </a>
          </p>

          <p>
            This verification link will expire
            in <strong>24 hours</strong>.
          </p>

          <p>
            If you did not create this account,
            you can safely ignore this email.
          </p>

          <p>
            Regards,<br>
            Global Digital Market Support
          </p>
        </div>
      `,

      text: `
Verify Your Global Digital Market Email

Hello ${user.first_name || 'there'},

Please verify your email address to complete your Global Digital Market account setup.

Verify your email here:

${verificationUrl}

This verification link will expire in 24 hours.

If you did not create this account, you can safely ignore this email.

Regards,
Global Digital Market Support
      `,
    });

    logger.info(
      `Verification email sent to ${user.email}`
    );

    return res.status(200).json({
      message:
        'Verification email sent successfully.',
    });

  } catch (error) {
    logger.error(
      'Send verification email error:',
      error
    );

    return next(error);
  }
};


// ============================================================
// VERIFY EMAIL
// ============================================================

const verifyEmail = async (
  req,
  res,
  next
) => {
  try {
    const { token } = req.body || {};

    if (!token) {
      return res.status(400).json({
        message:
          'Verification token is required.',
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error(
        'JWT_SECRET is not configured.'
      );
    }

    let decoded;

    try {
      decoded = jwt.verify(
        token,
        secret
      );
    } catch (tokenError) {
      return res.status(400).json({
        message:
          'This verification link is invalid or has expired. Please request a new verification email.',
      });
    }

    if (
      decoded?.purpose !==
      'email-verification'
    ) {
      return res.status(400).json({
        message:
          'Invalid email verification token.',
      });
    }

    if (!decoded?.id) {
      return res.status(400).json({
        message:
          'Invalid email verification token.',
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        email,
        email_verified,
        status
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message:
          'User account not found.',
      });
    }

    const user = result.rows[0];

    if (
      user.status &&
      [
        'blocked',
        'suspended',
        'disabled',
      ].includes(
        String(user.status).toLowerCase()
      )
    ) {
      return res.status(403).json({
        message:
          'Your account is currently unavailable.',
      });
    }

    if (user.email_verified) {
      return res.status(200).json({
        message:
          'Your email address is already verified.',
      });
    }

    await pool.query(
      `
      UPDATE users
      SET
        email_verified = TRUE,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [user.id]
    );

    logger.info(
      `Email verified successfully for user ID ${user.id}`
    );

    return res.status(200).json({
      message:
        'Email verified successfully. You can now continue using your account.',
    });

  } catch (error) {
    logger.error(
      'Verify email error:',
      error
    );

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
  changePassword,
  forgotPassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
