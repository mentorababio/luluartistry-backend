const logger = require('../config/logger');
const { v4: uuidv4 } = require('uuid');

const requestLogger = (req, res, next) => {
  req.id = uuidv4();
  
  const start = Date.now();
  
  logger.info('Request started', {
    requestId: req.id,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('Request completed', {
      requestId: req.id,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`
    });
  });

  next();
};

module.exports = requestLogger;