/**
 * src/core/errors/AuthorizationError.js
 * Error thrown when user lacks permission
 */

const AppError = require('./AppError');

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

module.exports = AuthorizationError;
