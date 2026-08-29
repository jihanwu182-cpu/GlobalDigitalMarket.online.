const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// ============================================================
// GET TOKEN FROM REQUEST
// ============================================================

const getTokenFromRequest = (req) => {
  const authorization =
    req.headers.authorization;

  if (!authorization) {
    return null;
  }

  const parts =
    authorization.trim().split(/\s+/);

  if (
    parts.length !== 2 ||
    parts[0].toLowerCase() !== 'bearer'
  ) {
    return null;
  }

  return parts[1];
};

// ============================================================
// VERIFY JWT
// ============================================================

const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET is not configured on the server.'
    );
  }

  return jwt.verify(
    token,
    process.env.JWT_SECRET
  );
};

// ============================================================
// REQUIRED AUTHENTICATION
// ============================================================

const authMiddleware = (
  req,
  res,
  next
) => {
  try {
    const token =
      getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required.',
        message:
          'Please provide a valid Bearer token.',
      });
    }

    const decoded =
      verifyToken(token);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        error: 'Invalid token.',
        message:
          'The authentication token is invalid.',
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    logger.error(
      'Token verification failed:',
      error.message
    );

    if (
      error.name ===
      'TokenExpiredError'
    ) {
      return res.status(401).json({
        error: 'Token expired.',
        message:
          'Your login session has expired. Please login again.',
      });
    }

    if (
      error.name ===
      'JsonWebTokenError'
    ) {
      return res.status(401).json({
        error: 'Invalid token.',
        message:
          'The authentication token is invalid.',
      });
    }

    return res.status(500).json({
      error:
        'Authentication service error.',
      message:
        'Unable to verify authentication.',
    });
  }
};

// ============================================================
// OPTIONAL AUTHENTICATION
// ============================================================

const optionalAuth = (
  req,
  res,
  next
) => {
  try {
    const token =
      getTokenFromRequest(req);

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded =
      verifyToken(token);

    if (
      decoded &&
      decoded.id
    ) {
      req.user = decoded;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    logger.warn(
      'Optional authentication failed:',
      error.message
    );

    // Optional authentication must not
    // block the request.
    req.user = null;

    next();
  }
};

// ============================================================
// ADMIN AUTHENTICATION
// ============================================================

const adminMiddleware = (
  req,
  res,
  next
) => {
  try {
    const token =
      getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        error:
          'Authentication required.',
        message:
          'Please login as an administrator.',
      });
    }

    const decoded =
      verifyToken(token);

    if (
      !decoded ||
      !decoded.id
    ) {
      return res.status(401).json({
        error: 'Invalid token.',
      });
    }

    // Only administrator accounts
    // can access admin routes.
    const role = String(
      decoded.role || ''
    ).toLowerCase();

    if (
      role !== 'admin' &&
      role !== 'administrator' &&
      role !== 'superadmin'
    ) {
      logger.warn(
        `Unauthorized admin access attempt by user ${decoded.id}`
      );

      return res.status(403).json({
        error:
          'Administrator access required.',
        message:
          'You do not have permission to access this area.',
      });
    }

    req.user = decoded;

    next();
  } catch (error) {
    logger.error(
      'Admin authentication failed:',
      error.message
    );

    if (
      error.name ===
      'TokenExpiredError'
    ) {
      return res.status(401).json({
        error: 'Token expired.',
        message:
          'Your administrator session has expired. Please login again.',
      });
    }

    return res.status(401).json({
      error: 'Invalid administrator token.',
    });
  }
};

// ============================================================
// ROLE CHECKER
// ============================================================

const requireRole = (
  ...allowedRoles
) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error:
          'Authentication required.',
      });
    }

    const userRole = String(
      req.user.role || ''
    ).toLowerCase();

    const roles =
      allowedRoles.map((role) =>
        String(role).toLowerCase()
      );

    if (
      !roles.includes(userRole)
    ) {
      return res.status(403).json({
        error:
          'Insufficient permissions.',
        message:
          'You do not have permission to perform this action.',
      });
    }

    next();
  };
};

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  authMiddleware,
  optionalAuth,
  adminMiddleware,
  requireRole,
};
