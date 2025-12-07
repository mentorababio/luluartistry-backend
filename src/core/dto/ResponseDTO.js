/**
 * src/core/dto/ResponseDTO.js
 * Standard API response DTO
 */

class ResponseDTO {
  constructor(data = {}) {
    this.success = data.success !== undefined ? data.success : true;
    this.statusCode = data.statusCode || 200;
    this.message = data.message || 'Success';
    this.data = data.data || null;
    this.errors = data.errors || null;
    this.timestamp = new Date().toISOString();
  }

  /**
   * Create success response
   * @param {Object} data - Response data
   * @param {String} message - Success message
   * @returns {ResponseDTO}
   */
  static success(data, message = 'Success') {
    return new ResponseDTO({
      success: true,
      statusCode: 200,
      message,
      data
    });
  }

  /**
   * Create error response
   * @param {String} message - Error message
   * @param {Number} statusCode - HTTP status code
   * @param {Object} errors - Error details
   * @returns {ResponseDTO}
   */
  static error(message, statusCode = 500, errors = null) {
    return new ResponseDTO({
      success: false,
      statusCode,
      message,
      errors
    });
  }

  /**
   * Convert to JSON
   * @returns {Object}
   */
  toJSON() {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      errors: this.errors,
      timestamp: this.timestamp
    };
  }
}

module.exports = ResponseDTO;
