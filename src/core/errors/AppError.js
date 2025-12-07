/**
 * src/core/errors/AppError.js
 * Base error class for all application errors
 */

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      success: false,
      statusCode: this.statusCode,
      message: this.message,
      timestamp: this.timestamp
    };
  }
}

module.exports = AppError;
