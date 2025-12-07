/**
 * src/core/errors/ConflictError.js
 * Error thrown when there's a conflict (e.g., duplicate email)
 */

const AppError = require('./AppError');

class ConflictError extends AppError {
  constructor(message = 'Resource already exists') {
    super(message, 409);
    this.name = 'ConflictError';
  }
}

module.exports = ConflictError;
