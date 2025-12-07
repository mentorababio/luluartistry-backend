/**
 * src/core/errors/ValidationError.js
 * Error thrown when validation fails
 */

const AppError = require('./AppError');

class ValidationError extends AppError {
  constructor(message = 'Validation failed', errors = {}) {
    super(message, 400);
    this.errors = errors;
    this.name = 'ValidationError';
  }

  toJSON() {
    return {
      success: false,
      statusCode: this.statusCode,
      message: this.message,
      errors: this.errors,
      timestamp: this.timestamp
    };
  }
}

module.exports = ValidationError;
