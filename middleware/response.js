const ApiResponse = require('../utils/ApiResponse');

const responseMiddleware = (req, res, next) => {
  res.apiSuccess = (data, message, statusCode) => {
    return res.status(statusCode || 200).json(
      ApiResponse.success(data, message, statusCode)
    );
  };

  res.apiError = (message, statusCode, errors) => {
    return res.status(statusCode || 500).json(
      ApiResponse.error(message, statusCode, errors)
    );
  };

  res.apiPaginated = (data, pagination, message, statusCode) => {
    return res.status(statusCode || 200).json(
      ApiResponse.paginated(data, pagination, message, statusCode)
    );
  };

  next();
};

module.exports = responseMiddleware;