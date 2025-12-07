# 🚀 Lulu Artistry Backend - Project Improvement Roadmap

## 📊 Current Status Assessment
**Overall Score: 7/10** - Good foundation but missing several industry standards

### ✅ Strengths
- Well-organized MVC pattern
- Comprehensive security middleware
- Proper authentication system
- Good error handling
- Clean database schemas

### 🔴 Critical Issues
- Server configuration conflicts
- Missing file extensions
- No service layer pattern
- Missing testing infrastructure
- Incomplete documentation

---

## 🎯 PRIORITY 1: CRITICAL FIXES (Do These First)

### 1.1 Fix Server.js Configuration Issues

**Problem**: Duplicate CORS configuration and syntax errors
```javascript
// Current problematic code in server.js (lines ~115-120)
import cors from "cors"; // ❌ Using import in CommonJS
app.use(cors({ origin: "*" })); // ❌ Conflicting CORS config
```

**Solution**:
```javascript
// Remove the duplicate import and conflicting CORS setup
// Keep only the original corsOptions configuration
```

**Files to modify**: `server.js`

### 1.2 Fix Missing File Extensions

**Problem**: `controllers/productController` is missing `.js` extension

**Solution**: 
```bash
# Rename file to proper extension
mv controllers/productController controllers/productController.js
```

**Files affected**: `controllers/productController`

### 1.3 Create Environment Configuration Template

**Create**: `.env.example`
```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/luluartistry

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRE=30d

# Email Configuration (NodeMailer)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URLs
FRONTEND_URL=http://localhost:3000
ADMIN_DASHBOARD_URL=http://localhost:3001

# Payment Gateway (if using)
STRIPE_SECRET_KEY=sk_test_your_stripe_key
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### 1.4 Add Environment Validation

**Create**: `utils/validateEnv.js`
```javascript
const validateEnv = () => {
  const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_EXPIRE'
  ];

  const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);
  
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:', missing.join(', '));
    process.exit(1);
  }
  
  console.log('✅ Environment variables validated successfully');
};

module.exports = validateEnv;
```

**Update**: `server.js` - Add at the top after dotenv config:
```javascript
const validateEnv = require('./utils/validateEnv');
validateEnv();
```

---

## 🎯 PRIORITY 2: SERVICE LAYER IMPLEMENTATION

### 2.1 Create Base Service Class

**Create**: `services/BaseService.js`
```javascript
class BaseService {
  constructor(model) {
    this.model = model;
  }

  async create(data) {
    try {
      return await this.model.create(data);
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      return await this.model.findById(id);
    } catch (error) {
      throw error;
    }
  }

  async findAll(query = {}, options = {}) {
    try {
      const { page = 1, limit = 10, sort = '-createdAt', select } = options;
      const skip = (page - 1) * limit;

      let queryBuilder = this.model.find(query);
      
      if (select) queryBuilder = queryBuilder.select(select);
      if (sort) queryBuilder = queryBuilder.sort(sort);
      
      const results = await queryBuilder.skip(skip).limit(limit);
      const total = await this.model.countDocuments(query);

      return {
        results,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async update(id, data) {
    try {
      return await this.model.findByIdAndUpdate(id, data, { 
        new: true, 
        runValidators: true 
      });
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      return await this.model.findByIdAndDelete(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = BaseService;
```

### 2.2 Create Specific Service Classes

**Create**: `services/UserService.js`
```javascript
const BaseService = require('./BaseService');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

class UserService extends BaseService {
  constructor() {
    super(User);
  }

  async createUser(userData) {
    try {
      const user = await this.create(userData);
      return user;
    } catch (error) {
      if (error.code === 11000) {
        throw new ErrorResponse('User with this email already exists', 400);
      }
      throw error;
    }
  }

  async authenticateUser(email, password) {
    try {
      const user = await User.findOne({ email }).select('+password');
      
      if (!user || !(await user.matchPassword(password))) {
        throw new ErrorResponse('Invalid credentials', 401);
      }

      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserProfile(userId) {
    try {
      const user = await this.findById(userId);
      if (!user) {
        throw new ErrorResponse('User not found', 404);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }

  async updateUserProfile(userId, updateData) {
    try {
      const user = await this.update(userId, updateData);
      if (!user) {
        throw new ErrorResponse('User not found', 404);
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
```

**Create**: `services/ProductService.js`
```javascript
const BaseService = require('./BaseService');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');

class ProductService extends BaseService {
  constructor() {
    super(Product);
  }

  async getProducts(filters = {}, options = {}) {
    try {
      // Add isActive filter for public access
      if (!options.includeInactive) {
        filters.isActive = true;
      }

      const query = this.model.find(filters).populate('category', 'name slug');
      
      // Handle search
      if (filters.search) {
        query.find({ $text: { $search: filters.search } });
        delete filters.search;
      }

      return await this.findAll(filters, options);
    } catch (error) {
      throw error;
    }
  }

  async createProduct(productData) {
    try {
      return await this.create(productData);
    } catch (error) {
      throw error;
    }
  }

  async getProductBySlug(slug) {
    try {
      const product = await this.model
        .findOne({ slug, isActive: true })
        .populate('category', 'name slug')
        .populate('reviews');
      
      if (!product) {
        throw new ErrorResponse('Product not found', 404);
      }
      
      return product;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new ProductService();
```

### 2.3 Update Controllers to Use Services

**Update**: `controllers/authController.js`
```javascript
const UserService = require('../services/UserService');
const { sendEmail } = require('../utils/sendEmail');
const { welcomeEmail } = require('../utils/emailTemplates');

exports.register = async (req, res, next) => {
  try {
    const user = await UserService.createUser(req.body);

    // Send welcome email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Welcome to Lulu Artistry! ✨',
        html: welcomeEmail(user.firstName)
      });
    } catch (err) {
      console.error('Welcome email failed:', err.message);
    }

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserService.authenticateUser(email, password);
    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await UserService.getUserProfile(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};
```

---

## 🎯 PRIORITY 3: STANDARDIZED API RESPONSES

### 3.1 Create API Response Utility

**Create**: `utils/ApiResponse.js`
```javascript
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
```

### 3.2 Create Response Middleware

**Create**: `middleware/response.js`
```javascript
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
```

---

## 🎯 PRIORITY 4: TESTING INFRASTRUCTURE

### 4.1 Install Testing Dependencies

```bash
npm install --save-dev jest supertest mongodb-memory-server
```

### 4.2 Create Test Configuration

**Create**: `jest.config.js`
```javascript
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testMatch: ['<rootDir>/tests/**/*.test.js'],
  collectCoverageFrom: [
    'controllers/**/*.js',
    'services/**/*.js',
    'middleware/**/*.js',
    'models/**/*.js',
    'utils/**/*.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html']
};
```

### 4.3 Create Test Setup

**Create**: `tests/setup.js`
```javascript
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});
```

### 4.4 Sample Test Files

**Create**: `tests/unit/services/UserService.test.js`
```javascript
const UserService = require('../../../services/UserService');
const User = require('../../../models/User');

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '12345678901',
        password: 'password123'
      };

      const user = await UserService.createUser(userData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.firstName).toBe(userData.firstName);
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '12345678901',
        password: 'password123'
      };

      await UserService.createUser(userData);
      
      await expect(UserService.createUser(userData))
        .rejects.toThrow('User with this email already exists');
    });
  });
});
```

**Create**: `tests/integration/auth.test.js`
```javascript
const request = require('supertest');
const app = require('../../server');

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '12345678901',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.token).toBeDefined();
    });

    it('should return validation error for invalid email', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email',
        phone: '12345678901',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('valid email');
    });
  });
});
```

### 4.5 Update package.json Scripts

**Update**: `package.json`
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "seed": "node utils/seeder.js",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 🎯 PRIORITY 5: API DOCUMENTATION

### 5.1 Install Swagger Dependencies

```bash
npm install swagger-jsdoc swagger-ui-express
```

### 5.2 Create Swagger Configuration

**Create**: `config/swagger.js`
```javascript
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lulu Artistry API',
      version: '1.0.0',
      description: 'Lulu Artistry Backend API Documentation',
      contact: {
        name: 'Lulu Artistry',
        email: 'support@luluartistry.com'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.luluartistry.com' 
          : `http://localhost:${process.env.PORT || 5000}`,
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['customer', 'admin'] },
            isVerified: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            comparePrice: { type: 'number' },
            category: { $ref: '#/components/schemas/Category' },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string' },
                  publicId: { type: 'string' },
                  alt: { type: 'string' }
                }
              }
            },
            stock: { type: 'number' },
            isActive: { type: 'boolean' },
            isFeatured: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
```

### 5.3 Add Swagger to Server

**Update**: `server.js`
```javascript
const { swaggerUi, specs } = require('./config/swagger');

// API Documentation
if (process.env.NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
}
```

### 5.4 Add Swagger Comments to Routes

**Example for authRoutes.js**:
```javascript
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 */
router.post('/register', registerValidation, validate, register);
```

---

## 🎯 PRIORITY 6: ENHANCED LOGGING

### 6.1 Install Winston

```bash
npm install winston winston-daily-rotate-file
```

### 6.2 Create Logger Configuration

**Create**: `config/logger.js`
```javascript
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const transports = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  })
];

if (process.env.NODE_ENV === 'production') {
  transports.push(
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports
});

module.exports = logger;
```

### 6.3 Create Request Logging Middleware

**Create**: `middleware/requestLogger.js`
```javascript
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
```

---

## 🎯 PRIORITY 7: DOCKER CONTAINERIZATION

### 7.1 Create Dockerfile

**Create**: `Dockerfile`
```dockerfile
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
```

### 7.2 Create Docker Compose

**Create**: `docker-compose.yml`
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
      - MONGO_URI=mongodb://mongo:27017/luluartistry
    depends_on:
      - mongo
    volumes:
      - ./logs:/usr/src/app/logs
    restart: unless-stopped

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    environment:
      - MONGO_INITDB_DATABASE=luluartistry
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

volumes:
  mongo-data:
  redis-data:
```

### 7.3 Create .dockerignore

**Create**: `.dockerignore`
```
node_modules
npm-debug.log
.git
.gitignore
README.md
.nyc_output
coverage
.env
.env.local
.env.example
logs
```

---

## 🎯 PRIORITY 8: PERFORMANCE OPTIMIZATIONS

### 8.1 Add Redis Caching

```bash
npm install redis ioredis
```

**Create**: `config/redis.js`
```javascript
const Redis = require('ioredis');
const logger = require('./logger');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  enableReadyCheck: true,
  maxRetriesPerRequest: null
});

redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('❌ Redis connection error:', error);
});

module.exports = redis;
```

### 8.2 Create Cache Middleware

**Create**: `middleware/cache.js`
```javascript
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
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase 1: Critical Fixes (Week 1)
- [ ] Fix server.js CORS configuration
- [ ] Add missing file extensions
- [ ] Create .env.example file
- [ ] Add environment validation
- [ ] Test all API endpoints

### Phase 2: Architecture Improvements (Week 2)
- [ ] Implement Service Layer pattern
- [ ] Create BaseService class
- [ ] Update all controllers to use services
- [ ] Implement standardized API responses
- [ ] Add response middleware

### Phase 3: Testing & Documentation (Week 3)
- [ ] Set up Jest testing framework
- [ ] Create unit tests for services
- [ ] Create integration tests for APIs
- [ ] Implement Swagger documentation
- [ ] Add API documentation to all routes

### Phase 4: Enhanced Features (Week 4)
- [ ] Add Winston logging
- [ ] Implement request logging middleware
- [ ] Set up Docker containerization
- [ ] Add Redis caching
- [ ] Implement cache middleware

### Phase 5: Production Ready (Week 5)
- [ ] Add database indexes optimization
- [ ] Implement rate limiting per user
- [ ] Add monitoring and health checks
- [ ] Set up CI/CD pipeline
- [ ] Performance testing and optimization

---

## 📊 Success Metrics

After implementing all improvements, your project should achieve:

- **Code Quality**: 9/10
- **Security**: 9/10  
- **Performance**: 8/10
- **Maintainability**: 9/10
- **Documentation**: 9/10
- **Testing Coverage**: >80%

## 🔗 Additional Resources

- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Performance Best Practices](https://docs.mongodb.com/manual/administration/analyzing-mongodb-performance/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

## 🚀 Getting Started

1. **Start with Priority 1** - Fix critical issues first
2. **Follow the phases sequentially** - Don't skip ahead
3. **Test after each phase** - Ensure stability
4. **Update documentation** - Keep README.md current
5. **Monitor progress** - Use this checklist to track completion

Remember: **Quality over speed**. It's better to implement features properly than to rush and create technical debt.