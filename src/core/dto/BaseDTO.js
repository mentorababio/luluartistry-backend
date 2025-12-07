/**
 * src/core/dto/BaseDTO.js
 * Base DTO class with common functionality
 */

class BaseDTO {
  /**
   * Convert DTO to plain object
   * @returns {Object}
   */
  toObject() {
    const obj = {};
    for (const key in this) {
      if (this.hasOwnProperty(key)) {
        obj[key] = this[key];
      }
    }
    return obj;
  }

  /**
   * Convert DTO to JSON string
   * @returns {String}
   */
  toJSON() {
    return JSON.stringify(this.toObject());
  }

  /**
   * Validate required fields
   * @param {Array} requiredFields - Array of required field names
   * @throws {ValidationError}
   */
  validateRequired(requiredFields) {
    const missing = requiredFields.filter(field => !this[field]);
    if (missing.length > 0) {
      const ValidationError = require('../errors/ValidationError');
      throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
    }
  }

  /**
   * Sanitize string fields (trim whitespace)
   * @param {Array} stringFields - Array of field names to sanitize
   */
  sanitizeStrings(stringFields) {
    stringFields.forEach(field => {
      if (typeof this[field] === 'string') {
        this[field] = this[field].trim();
      }
    });
  }
}

module.exports = BaseDTO;
