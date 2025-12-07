class ApiResponse {
  static success(data, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
      timestamp: new Date().toISOString()
    };
  }

  static error(message, statusCode = 500, errors = null) {
    return {
      success: false,
      statusCode,
      message,
      errors,
      timestamp: new Date().toISOString()
    };
  }

  static paginated(data, pagination, message = 'Success', statusCode = 200) {
    return {
      success: true,
      statusCode,
      message,
      data,
      pagination,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = ApiResponse;