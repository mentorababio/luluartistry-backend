/**
 * utils/response.js
 * Centralized response handling for all API endpoints
 */

const ResponseDTO = require('../src/core/dto/ResponseDTO');

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} options - { data, message, statusCode }
 */
const sendSuccess = (res, options = {}) => {
  const {
    data = null,
    message = 'Operation successful',
    statusCode = 200
  } = options;

  const response = new ResponseDTO({
    success: true,
    statusCode,
    message,
    data
  });

  return res.status(statusCode).json(response.toJSON());
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Object} error - Error object or string
 * @param {Number} statusCode - HTTP status code
 */
const sendError = (res, error, statusCode = 500) => {
  // If error is an AppError instance
  if (error.statusCode) {
    statusCode = error.statusCode;
  }

  const response = new ResponseDTO({
    success: false,
    statusCode,
    message: error.message || 'An error occurred',
    errors: error.errors || null
  });

  return res.status(statusCode).json(response.toJSON());
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Object} paginatedData - { data, total, page, pages }
 * @param {String} message - Success message
 * @param {Number} statusCode - HTTP status code
 */
const sendPaginated = (res, paginatedData, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    statusCode,
    message,
    data: paginatedData.data,
    pagination: {
      total: paginatedData.total,
      page: paginatedData.page,
      pages: paginatedData.pages,
      limit: paginatedData.data.length
    },
    timestamp: new Date().toISOString()
  };

  return res.status(statusCode).json(response);
};

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated
};
