const { ClerkExpressRequireAuth } = require('@clerk/clerk-sdk-node');
const logger = require('../config/logger');

// Middleware to protect routes and extract user info
const protect = ClerkExpressRequireAuth();

const extractUser = (req, res, next) => {
  if (req.auth && req.auth.userId) {
    req.userId = req.auth.userId;
    next();
  } else {
    logger.warn('Unauthorized access attempt');
    res.status(401).json({ error: 'Unauthorized' });
  }
};

module.exports = {
  protect,
  extractUser
};
