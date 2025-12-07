/**
 * src/core/errors/AuthenticationError.js
 * Error thrown when user is not authenticated
 */

const AppError = require('./AppError');

class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

module.exports = AuthenticationError;
