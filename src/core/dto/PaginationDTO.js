/**
 * src/core/dto/PaginationDTO.js
 * Standard pagination DTO
 */

class PaginationDTO {
  constructor(data = {}) {
    this.page = parseInt(data.page) || 1;
    this.limit = parseInt(data.limit) || 10;
    this.sort = data.sort || { createdAt: -1 };
    this.search = data.search || '';
  }

  /**
   * Calculate skip value for database query
   * @returns {Number}
   */
  getSkip() {
    return (this.page - 1) * this.limit;
  }

  /**
   * Get query options for database
   * @returns {Object}
   */
  getQueryOptions() {
    return {
      skip: this.getSkip(),
      limit: this.limit,
      sort: this.sort
    };
  }

  /**
   * Validate pagination parameters
   * @throws {ValidationError}
   */
  validate() {
    const ValidationError = require('../errors/ValidationError');
    
    if (this.page < 1) {
      throw new ValidationError('Page must be greater than 0');
    }
    
    if (this.limit < 1 || this.limit > 100) {
      throw new ValidationError('Limit must be between 1 and 100');
    }
  }
}

module.exports = PaginationDTO;
