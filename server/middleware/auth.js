const jwt = require('jsonwebtoken');
const { isInMemory, memoryStore } = require('../utils/db');

const JWT_SECRET = process.env.JWT_SECRET || 'kisansetu_secure_jwt_secret_key_prod_892347';

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. Please login.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (isInMemory()) {
      const user = memoryStore.users.find(u => u._id === decoded.id || u.phone === decoded.phone);
      if (!user) {
        return res.status(401).json({ success: false, message: 'User session expired or not found.' });
      }
      req.user = user;
      return next();
    }

    const User = require('../models/User');
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User session expired or not found.' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired authorization token.' });
  }
};

const optionalAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (isInMemory()) {
      const user = memoryStore.users.find(u => u._id === decoded.id || u.phone === decoded.phone);
      if (user) req.user = user;
    } else {
      const User = require('../models/User');
      const user = await User.findById(decoded.id).select('-password');
      if (user) req.user = user;
    }
  } catch (e) {
    // Ignore invalid token on optional routes
  }
  next();
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role ${req.user ? req.user.role : 'GUEST'} is not authorized for this resource.`
      });
    }
    next();
  };
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Administrative credentials required.'
    });
  }
  next();
};

module.exports = {
  protect,
  optionalAuth,
  authorize,
  requireAdmin
};
