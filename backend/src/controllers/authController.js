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
// HELPERS
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
    } = req.body;

    // --------------------------------------------------------
    // REQUIRED FIELDS
    // --------------------------------------------------------

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !username ||
      !country ||
      !preferredCurrency
    ) {
      return res.status(400).json({
        message:
          'Please provide email, password, first name, last name, username, country and preferred currency.',
      });
    }

    const normalizedEmail = normalizeText(
      email
    ).toLowerCase();

    const normalizedFirstName =
      normalizeText(firstName);

    const normalizedLastName =
      normalizeText(lastName);

    const normalizedUsername =
      normalizeText(username);

    const normalizedCountry =
      normalizeText(country);

    const normalizedCurrency =
      normalizeText(preferredCurrency)
        .toUpperCase();

    const normalizedPhone =
      normalizeText(phone);

    const normalizedReferrerCode =
      normalizeText(referrerCode);

    // --------------------------------------------------------
    // BASIC VALIDATION
    // --------------------------------------------------------

    if (!normalizedEmail.includes('@')) {
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

    if (normalizedUsername.length < 3) {
      return res.status(400).json({
        message:
          'Username must contain at least 3 characters.',
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

    // --------------------------------------------------------
    // START DATABASE TRANSACTION
    // --------------------------------------------------------

    await client.query('BEGIN');

    // --------------------------------------------------------
    // CHECK EMAIL
    // --------------------------------------------------------

    const existingEmail =
      await client.query(
        `
        SELECT id
        FROM users
        WHERE email = $1
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

    const existingUsername =
      await client.query(
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
    // VALIDATE REFERRER CODE
    // --------------------------------------------------------

    let validReferrerCode = null;

    if (normalizedReferrerCode) {
      const referrerResult =
        await client.query(
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

    const userResult =
      await client.query(
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
          normalizedPhone || null,
          normalizedCountry,
          normalizedCurrency,
          validReferrerCode,
        ]
      );

    const databaseUser =
      userResult.rows[0];

    // --------------------------------------------------------
    // GENERATE UNIQUE REFERRAL CODE
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

      if (
        referralCheck.rows.length === 0
      ) {
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
          deposit,
          profits,
          available_balance,
          bonus,
          referrer_bonus,
          buying_power,
          margin_available,
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

    // --------------------------------------------------------
    // COMMIT
    // --------------------------------------------------------

    await client.query('COMMIT');

    // --------------------------------------------------------
    // FRONTEND USER OBJECT
    // --------------------------------------------------------

    const user = {
      id: databaseUser.id,
      email: databaseUser.email,
      firstName:
        databaseUser.first_name,
      lastName:
        databaseUser.last_name,
      username:
        databaseUser.username,
      phone:
        databaseUser.phone,
      country:
        databaseUser.country,
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

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

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
          Number(account.balance),
        availableBalance:
          Number(
            account.available_balance
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
    } = req.body;

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

    // --------------------------------------------------------
    // FIND USER
    // --------------------------------------------------------

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

        WHERE u.email = $1

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

    // --------------------------------------------------------
    // PASSWORD
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // ACCOUNT STATUS
    // --------------------------------------------------------

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

    // --------------------------------------------------------
    // USER OBJECT
    // --------------------------------------------------------

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
      role: databaseUser.role,
      status: databaseUser.status,
      emailVerified:
        databaseUser.email_verified,
      identityVerificationStatus:
        databaseUser.identity_verification_status ||
        'PENDING',
      createdAt:
        databaseUser.created_at,
    };

    // --------------------------------------------------------
    // ACCOUNT OBJECT
    // --------------------------------------------------------

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
      req.body.refreshToken ||
      req.body.token;

    if (!token) {
      return res.status(401).json({
        message:
          'Refresh token is required.',
      });
    }

    /*
     * Refresh-token verification is intentionally
     * left disabled until the JWT utility exposes
     * a proper verification function.
     *
     * We do not issue a new token without validating
     * the supplied refresh token.
     */

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
// EXPORTS
// ============================================================

module.exports = {
  register,
  login,
  logout,
  refreshToken,
};
