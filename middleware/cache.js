const redis = require('../config/redis');
const logger = require('../config/logger');

const cache = (duration = 300) => {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `cache:${req.originalUrl}`;
    
    try {
      const cached = await redis.get(key);
      
      if (cached) {
        logger.info(`Cache hit for ${key}`);
        return res.json(JSON.parse(cached));
      }
      
      // Store original res.json
      const originalJson = res.json;
      
      res.json = function(data) {
        // Cache successful responses
        if (res.statusCode === 200) {
          redis.setex(key, duration, JSON.stringify(data));
          logger.info(`Cached response for ${key}`);
        }
        
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache middleware error:', error);
      next();
    }
  };
};

module.exports = cache;