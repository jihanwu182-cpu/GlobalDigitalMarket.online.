const pool = require('../config/database');
const logger = require('../utils/logger');

const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (String(req.user.id) !== String(id)) {
      return res.status(403).json({
        message: 'You are not authorized to access this profile.',
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        email,
        first_name,
        last_name,
        phone,
        date_of_birth,
        address,
        city,
        state,
        postal_code,
        country,
        role,
        status,
        email_verified,
        two_factor_enabled,
        created_at,
        updated_at
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        dateOfBirth: user.date_of_birth,
        address: user.address,
        city: user.city,
        state: user.state,
        postalCode: user.postal_code,
        country: user.country,
        role: user.role,
        status: user.status,
        emailVerified: user.email_verified,
        twoFactorEnabled: user.two_factor_enabled,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    logger.error('Get user profile error:', error);
    next(error);
  }
};


const updateUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (String(req.user.id) !== String(id)) {
      return res.status(403).json({
        message: 'You are not authorized to update this profile.',
      });
    }

    const {
      firstName,
      lastName,
      phone,
      address,
      city,
      state,
      postalCode,
      country,
    } = req.body;

    const result = await pool.query(
      `
      UPDATE users
      SET
        first_name = COALESCE($1, first_name),
        last_name = COALESCE($2, last_name),
        phone = COALESCE($3, phone),
        address = COALESCE($4, address),
        city = COALESCE($5, city),
        state = COALESCE($6, state),
        postal_code = COALESCE($7, postal_code),
        country = COALESCE($8, country),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING
        id,
        email,
        first_name,
        last_name,
        phone,
        address,
        city,
        state,
        postal_code,
        country,
        role,
        status,
        email_verified,
        two_factor_enabled,
        created_at,
        updated_at
      `,
      [
        firstName || null,
        lastName || null,
        phone || null,
        address || null,
        city || null,
        state || null,
        postalCode || null,
        country || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found.',
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      message: 'User profile updated successfully.',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        address: user.address,
        city: user.city,
        state: user.state,
        postalCode: user.postal_code,
        country: user.country,
        role: user.role,
        status: user.status,
        emailVerified: user.email_verified,
        twoFactorEnabled: user.two_factor_enabled,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    logger.error('Update user profile error:', error);
    next(error);
  }
};


const getUserAccounts = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (String(req.user.id) !== String(id)) {
      return res.status(403).json({
        message: 'You are not authorized to access these accounts.',
      });
    }

    const result = await pool.query(
      `
      SELECT
        id,
        account_number,
        account_type,
        account_name,
        balance,
        available_balance,
        buying_power,
        margin_available,
        status,
        created_at,
        updated_at
      FROM accounts
      WHERE user_id = $1
      ORDER BY id ASC
      `,
      [id]
    );

    return res.status(200).json({
      accounts: result.rows,
    });
  } catch (error) {
    logger.error('Get user accounts error:', error);
    next(error);
  }
};


const createTradingAccount = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (String(req.user.id) !== String(id)) {
      return res.status(403).json({
        message: 'You are not authorized to create this account.',
      });
    }

    const {
      accountType = 'standard',
      initialBalance = 0,
    } = req.body;

    const balance = Number(initialBalance);

    if (!Number.isFinite(balance) || balance < 0) {
      return res.status(400).json({
        message: 'Initial balance must be a valid non-negative number.',
      });
    }

    const accountNumber =
      `GDM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    const result = await pool.query(
      `
      INSERT INTO accounts
        (
          user_id,
          account_number,
          account_type,
          account_name,
          balance,
          available_balance,
          buying_power,
          margin_available,
          status
        )
      VALUES
        ($1, $2, $3, $4, $5, $5, $5, 0, 'active')
      RETURNING
        id,
        account_number,
        account_type,
        account_name,
        balance,
        available_balance,
        buying_power,
        margin_available,
        status,
        created_at
      `,
      [
        id,
        accountNumber,
        accountType,
        'Global Digital Market Account',
        balance,
      ]
    );

    return res.status(201).json({
      message: 'Trading account created successfully.',
      account: result.rows[0],
    });
  } catch (error) {
    logger.error('Create trading account error:', error);
    next(error);
  }
};


module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserAccounts,
  createTradingAccount,
};
