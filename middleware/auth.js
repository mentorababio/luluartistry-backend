const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

// Protect routes - check if user is authenticated
exports.protect = async (req, res, next) => {
  let token;

  // DEBUG: See if the server receives the header at all
  console.log("DEBUG: Authorization Header:", req.headers.authorization);

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) { // Ensure req.cookies exists
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return next(new ErrorResponse('User not found', 404));
    }

    next();
  } catch (err) {
    console.error("DEBUG: JWT Verification Error:", err.message); // Log the actual error
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};
// Optional auth - attach user if token exists but don't require it
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch (err) {
      // Token invalid, continue without user
      req.user = null;
    }
  }

  next();
};