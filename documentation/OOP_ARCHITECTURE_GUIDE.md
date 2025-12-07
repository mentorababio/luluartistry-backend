# 🏗️ OOP Architecture Guide - Lulu Artistry E-commerce Platform

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Core Concepts](#core-concepts)
3. [Implementation Phases](#implementation-phases)
4. [Layer Breakdown](#layer-breakdown)
5. [Best Practices](#best-practices)
6. [Quick Start Guide](#quick-start-guide)

---

## Architecture Overview

This guide implements a **clean, layered OOP architecture** following industry standards. The application is structured into distinct layers to maintain separation of concerns, improve testability, and enable scalability.

### Architecture Layers:

```
┌─────────────────────────────────────────┐
│         API Routes Layer                │  (HTTP endpoints)
├─────────────────────────────────────────┤
│       Controllers/Handlers               │  (Request/Response handling)
├─────────────────────────────────────────┤
│         Services Layer                   │  (Business logic)
├─────────────────────────────────────────┤
│      Repositories/DAL Layer             │  (Data access)
├─────────────────────────────────────────┤
│      Domain Models/Entities              │  (Database models)
└─────────────────────────────────────────┘
```

### Supporting Components:
- **DTOs (Data Transfer Objects)**: Define request/response shapes
- **Interfaces**: Define contracts for services and repositories
- **Error Handling**: Centralized error handling
- **Validators**: Input validation
- **Middleware**: Cross-cutting concerns (auth, logging, etc.)

---

## Core Concepts

### 1. **Layered Architecture**

Each layer has a specific responsibility:

| Layer | Responsibility | Example |
|-------|---------------|---------| 
| **Routes** | Define HTTP endpoints | `GET /api/users/:id` |
| **Controllers** | Parse requests, call services, format responses | Extract query params, call UserService |
| **Services** | Business logic, orchestration | Validate user data, hash password, send email |
| **Repositories** | Data access, queries | `User.findById()`, `User.create()` |
| **Models** | Database schema definition | Mongoose schemas |

### 2. **DTOs (Data Transfer Objects)**

DTOs define the shape of data flowing in and out of APIs:

```javascript
// Example: UserRequestDTO
class UserRequestDTO {
  constructor(data) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    // Password NOT included in response DTOs
  }
}

// Example: UserResponseDTO
class UserResponseDTO {
  constructor(user) {
    this.id = user._id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    // Password never exposed
  }
}
```

### 3. **Interfaces**

Interfaces define contracts that services must implement:

```javascript
// IUserService.js - Interface/Contract
class IUserService {
  async createUser(userDTO) { throw new Error('Not implemented'); }
  async getUserById(id) { throw new Error('Not implemented'); }
  async updateUser(id, userDTO) { throw new Error('Not implemented'); }
  async deleteUser(id) { throw new Error('Not implemented'); }
}

// UserService.js - Implementation
class UserService extends IUserService {
  async createUser(userDTO) {
    // Implementation
  }
  // ... other methods
}
```

### 4. **Repositories**

Repositories abstract database operations:

```javascript
class UserRepository {
  async findById(id) { /* query */ }
  async findByEmail(email) { /* query */ }
  async create(userData) { /* insert */ }
  async update(id, userData) { /* update */ }
  async delete(id) { /* delete */ }
}
```

### 5. **Services**

Services contain business logic and use repositories:

```javascript
class UserService {
  constructor(userRepository, emailService) {
    this.userRepository = userRepository;
    this.emailService = emailService;
  }

  async registerUser(userDTO) {
    // 1. Validate input
    // 2. Check if user exists
    // 3. Hash password
    // 4. Create user via repository
    // 5. Send welcome email
    // 6. Return response DTO
  }
}
```

---

## Implementation Phases

### 📍 **Phase 1: Base/Foundation Layer (Week 1)**

Establish the core OOP infrastructure that all modules inherit from.

**Deliverables:**
- Base interfaces and DTOs
- Error handling system
- Base repository class
- Base service class
- Response formatting middleware

**Files to Create:**
```
src/core/
├── interfaces/
│   ├── IBaseService.js
│   ├── IBaseRepository.js
│   └── IResponse.js
├── errors/
│   ├── AppError.js
│   ├── ValidationError.js
│   ├── AuthenticationError.js
│   └── AuthorizationError.js
├── dto/
│   ├── BaseDTO.js
│   ├── PaginationDTO.js
│   └── ResponseDTO.js
├── repositories/
│   └── BaseRepository.js
└── services/
    └── BaseService.js
```

---

### 👤 **Phase 2: User Module (Week 2)**

Implement complete user management following OOP standards.

**Deliverables:**
- User DTOs (Request/Response)
- User interface
- User repository with all CRUD operations
- User service with business logic
- User controller with request handling
- User routes with authentication
- **Testing**: Database seeding with test users

**Key Features:**
- User registration
- User login (JWT)
- User profile management
- Password management
- Address management
- Role-based access control (Customer/Admin)

**Database Schema:**
```javascript
User {
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: String (enum: [customer, admin]),
  avatar: { url, publicId },
  addresses: Array,
  wishlist: Array (Product refs),
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 🏪 **Phase 3: Product & Category Module (Week 3)**

Implement product management. **Only admins can perform create/update/delete**.

**Deliverables:**
- Category DTOs and CRUD operations
- Product DTOs and CRUD operations
- Category repository and service
- Product repository and service
- Product controller and routes
- Category controller and routes
- Admin-only middleware enforcement
- **Testing**: Seed sample products and categories

**Key Features:**
- Category management (admin)
- Product creation with variants (admin)
- Product search and filtering (public)
- Stock management
- Featured products

**Database Schema:**
```javascript
Category {
  _id: ObjectId,
  name: String,
  slug: String (unique),
  description: String,
  image: { url, publicId },
  displayOrder: Number,
  isActive: Boolean,
  createdAt: Date
}

Product {
  _id: ObjectId,
  name: String,
  slug: String (unique),
  description: String,
  price: Number,
  comparePrice: Number,
  category: ObjectId (ref: Category),
  images: Array,
  variants: Array,
  stock: Number,
  isFeatured: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

### 🛒 **Phase 4: Cart & Order Module (Week 4)**

Implement shopping cart and order management.

**Deliverables:**
- Cart DTOs and operations
- Order DTOs and operations
- Cart repository and service
- Order repository and service
- Order controller and routes
- Order status management
- **Testing**: Seed test orders with various statuses

**Database Schema:**
```javascript
Cart {
  _id: ObjectId,
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    quantity: Number,
    priceAtTime: Number,
    variant: Object
  }],
  coupon: ObjectId (ref: Coupon),
  discount: Number,
  total: Number,
  createdAt: Date,
  updatedAt: Date
}

Order {
  _id: ObjectId,
  orderNumber: String (unique),
  user: ObjectId (ref: User),
  items: Array,
  subtotal: Number,
  tax: Number,
  discount: Number,
  total: Number,
  status: String (enum: [pending, confirmed, shipped, delivered, cancelled]),
  shippingAddress: Object,
  paymentMethod: String,
  paymentStatus: String (enum: [pending, paid, failed]),
  createdAt: Date,
  updatedAt: Date
}
```

---

### 💳 **Phase 5: Transaction Module (Week 5)**

Implement transaction tracking for payment preparation.

**Deliverables:**
- Transaction DTOs and operations
- Transaction repository and service
- Transaction tracking and logging
- **Test Command Support**: `try` command for DB entry without actual payment
- **Testing**: Seed test transactions with various statuses

**Key Features:**
- Transaction creation and tracking
- Payment method tracking
- Transaction status updates
- Audit logging

**Database Schema:**
```javascript
Transaction {
  _id: ObjectId,
  order: ObjectId (ref: Order),
  user: ObjectId (ref: User),
  amount: Number,
  currency: String (default: 'NGN'),
  paymentMethod: String,
  status: String (enum: [pending, processing, completed, failed, refunded]),
  transactionRef: String,
  provider: String (paystack, flutterwave, etc),
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

**Test Command:**
```javascript
// Command: POST /api/transactions/try
// Creates a test transaction entry in DB without processing actual payment
// Response: { success: true, data: transaction, message: "Test transaction created" }
```

---

### 💰 **Phase 6: Payment Module (Week 6)**

Implement actual payment processing after all prior phases are tested.

**Deliverables:**
- Payment DTOs and operations
- Payment provider integration (Paystack, Flutterwave, etc.)
- Payment service with retry logic
- Payment controller and routes
- Webhook handling
- Refund management
- **Testing**: Integration tests with payment providers

**Key Features:**
- Payment initialization
- Payment verification
- Webhook handling
- Refund processing
- Payment status tracking

**Database Schema:**
```javascript
Payment {
  _id: ObjectId,
  transaction: ObjectId (ref: Transaction),
  order: ObjectId (ref: Order),
  user: ObjectId (ref: User),
  amount: Number,
  reference: String (provider's reference),
  status: String (enum: [pending, success, failed]),
  provider: String,
  providerResponse: Object,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Layer Breakdown

### 1️⃣ **Routes Layer**

```javascript
// Example: routes/userRoutes.js
const express = require('express');
const UserController = require('../controllers/UserController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();
const userController = new UserController();

router.post('/register', (req, res, next) => userController.register(req, res, next));
router.post('/login', (req, res, next) => userController.login(req, res, next));
router.get('/:id', protect, (req, res, next) => userController.getProfile(req, res, next));
router.put('/:id', protect, (req, res, next) => userController.updateProfile(req, res, next));

module.exports = router;
```

### 2️⃣ **Controllers Layer**

```javascript
// Example: controllers/UserController.js
const UserService = require('../services/UserService');
const UserRequestDTO = require('../dto/UserRequestDTO');
const UserResponseDTO = require('../dto/UserResponseDTO');
const { sendSuccess, sendError } = require('../utils/response');

class UserController {
  constructor() {
    this.userService = new UserService();
  }

  async register(req, res, next) {
    try {
      // 1. Create DTO from request
      const userDTO = new UserRequestDTO(req.body);
      
      // 2. Call service
      const user = await this.userService.registerUser(userDTO);
      
      // 3. Format response
      const responseDTO = new UserResponseDTO(user);
      
      // 4. Send response
      return sendSuccess(res, { data: responseDTO, statusCode: 201 });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await this.userService.getUserById(req.user.id);
      const responseDTO = new UserResponseDTO(user);
      return sendSuccess(res, { data: responseDTO });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
```

### 3️⃣ **Services Layer**

```javascript
// Example: services/UserService.js
const IUserService = require('../interfaces/IUserService');
const UserRepository = require('../repositories/UserRepository');
const ValidationError = require('../errors/ValidationError');
const bcrypt = require('bcryptjs');

class UserService extends IUserService {
  constructor() {
    this.userRepository = new UserRepository();
  }

  async registerUser(userDTO) {
    try {
      // 1. Validate
      this.validateUserData(userDTO);
      
      // 2. Check if user exists
      const existingUser = await this.userRepository.findByEmail(userDTO.email);
      if (existingUser) {
        throw new ValidationError('User with this email already exists');
      }
      
      // 3. Hash password
      const hashedPassword = await bcrypt.hash(userDTO.password, 10);
      userDTO.password = hashedPassword;
      
      // 4. Create user
      const user = await this.userRepository.create(userDTO);
      
      // 5. Send welcome email (handled separately)
      
      return user;
    } catch (error) {
      throw error;
    }
  }

  async getUserById(id) {
    const user = await this.userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  validateUserData(userDTO) {
    if (!userDTO.email || !userDTO.firstName || !userDTO.lastName) {
      throw new ValidationError('Missing required fields');
    }
  }
}

module.exports = UserService;
```

### 4️⃣ **Repositories Layer**

```javascript
// Example: repositories/UserRepository.js
const IBaseRepository = require('../interfaces/IBaseRepository');
const User = require('../models/User');

class UserRepository extends IBaseRepository {
  constructor() {
    this.model = User;
  }

  async findById(id) {
    return await this.model.findById(id);
  }

  async findByEmail(email) {
    return await this.model.findOne({ email });
  }

  async create(userData) {
    const user = new this.model(userData);
    await user.save();
    return user;
  }

  async update(id, userData) {
    return await this.model.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true
    });
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
    const skip = (page - 1) * limit;
    
    return await this.model
      .find(filters)
      .sort(sort)
      .skip(skip)
      .limit(limit);
  }
}

module.exports = UserRepository;
```

### 5️⃣ **DTOs Layer**

```javascript
// Example: dto/UserRequestDTO.js
class UserRequestDTO {
  constructor(data = {}) {
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;
  }
}

module.exports = UserRequestDTO;

// Example: dto/UserResponseDTO.js
class UserResponseDTO {
  constructor(user) {
    this.id = user._id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.phone = user.phone;
    this.role = user.role;
    this.avatar = user.avatar;
    this.createdAt = user.createdAt;
    // Password NEVER included
  }
}

module.exports = UserResponseDTO;
```

### 6️⃣ **Models/Entities Layer**

```javascript
// Example: models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  avatar: { url: String, publicId: String },
  addresses: [{ /* address schema */ }],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  isVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Password encryption
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Methods
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
```

---

## Best Practices

### ✅ **Do's**

1. **Single Responsibility**: Each class should have one reason to change
   ```javascript
   // ✅ Good: Separated concerns
   class UserService { /* Business logic */ }
   class UserRepository { /* Data access */ }
   class UserController { /* HTTP handling */ }
   ```

2. **Dependency Injection**: Pass dependencies to constructors
   ```javascript
   // ✅ Good
   class UserService {
     constructor(userRepository, emailService) {
       this.userRepository = userRepository;
       this.emailService = emailService;
     }
   }

   // ❌ Bad
   class UserService {
     constructor() {
       this.userRepository = new UserRepository(); // Hard to test
     }
   }
   ```

3. **DTOs for I/O**: Use DTOs for all requests and responses
   ```javascript
   // ✅ Good
   const userDTO = new UserRequestDTO(req.body);
   const response = new UserResponseDTO(user);

   // ❌ Bad
   const user = req.body; // No validation shape
   res.json(user); // Might leak sensitive data
   ```

4. **Error Handling**: Use custom error classes
   ```javascript
   // ✅ Good
   throw new ValidationError('Invalid email');
   throw new NotFoundError('User not found');
   throw new AuthorizationError('Admin only');

   // ❌ Bad
   throw new Error('Something went wrong');
   ```

5. **Repository Pattern**: All data access through repositories
   ```javascript
   // ✅ Good
   const user = await this.userRepository.findById(id);

   // ❌ Bad
   const user = await User.findById(id); // In service layer
   ```

### ❌ **Don'ts**

1. **Don't mix layers**: Services shouldn't directly handle HTTP
   ```javascript
   // ❌ Bad: Service handling HTTP
   class UserService {
     register(req, res) {
       const user = await User.create(req.body);
       res.json(user);
     }
   }
   ```

2. **Don't expose passwords**: Never return passwords in DTOs
   ```javascript
   // ❌ Bad
   class UserResponseDTO {
     constructor(user) {
       this.password = user.password; // NEVER!
     }
   }
   ```

3. **Don't hard-code dependencies**: Use injection
   ```javascript
   // ❌ Bad
   const emailService = require('./EmailService');
   class UserService {
     constructor() {
       this.emailService = emailService;
     }
   }
   ```

4. **Don't skip validation**: Always validate at service layer
   ```javascript
   // ❌ Bad
   class UserService {
     async createUser(data) {
       return await this.userRepository.create(data); // No validation!
     }
   }
   ```

---

## Quick Start Guide

### How to Add a New Module

Follow this step-by-step guide to add a new feature (e.g., Reviews):

#### Step 1: Create Model
```javascript
// models/Review.js
const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, maxlength: 1000 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Review', ReviewSchema);
```

#### Step 2: Create DTOs
```javascript
// dto/ReviewRequestDTO.js
class ReviewRequestDTO {
  constructor(data = {}) {
    this.productId = data.productId;
    this.rating = data.rating;
    this.comment = data.comment;
  }
}

// dto/ReviewResponseDTO.js
class ReviewResponseDTO {
  constructor(review) {
    this.id = review._id;
    this.product = review.product;
    this.user = review.user;
    this.rating = review.rating;
    this.comment = review.comment;
    this.createdAt = review.createdAt;
  }
}
```

#### Step 3: Create Interface
```javascript
// interfaces/IReviewService.js
class IReviewService {
  async createReview(reviewDTO, userId) { throw new Error('Not implemented'); }
  async getReviewsByProduct(productId) { throw new Error('Not implemented'); }
  async deleteReview(reviewId, userId) { throw new Error('Not implemented'); }
}
```

#### Step 4: Create Repository
```javascript
// repositories/ReviewRepository.js
const IBaseRepository = require('../interfaces/IBaseRepository');
const Review = require('../models/Review');

class ReviewRepository extends IBaseRepository {
  constructor() {
    this.model = Review;
  }

  async findByProductId(productId) {
    return await this.model.find({ product: productId }).populate('user', 'firstName lastName avatar');
  }

  async create(reviewData) {
    const review = new this.model(reviewData);
    await review.save();
    return review.populate('user', 'firstName lastName avatar');
  }

  async delete(id) {
    return await this.model.findByIdAndDelete(id);
  }
}

module.exports = ReviewRepository;
```

#### Step 5: Create Service
```javascript
// services/ReviewService.js
const IReviewService = require('../interfaces/IReviewService');
const ReviewRepository = require('../repositories/ReviewRepository');
const ValidationError = require('../errors/ValidationError');

class ReviewService extends IReviewService {
  constructor() {
    this.reviewRepository = new ReviewRepository();
  }

  async createReview(reviewDTO, userId) {
    // Validate
    if (!reviewDTO.productId || !reviewDTO.rating) {
      throw new ValidationError('Product ID and rating are required');
    }

    if (reviewDTO.rating < 1 || reviewDTO.rating > 5) {
      throw new ValidationError('Rating must be between 1 and 5');
    }

    // Create
    const reviewData = {
      product: reviewDTO.productId,
      user: userId,
      rating: reviewDTO.rating,
      comment: reviewDTO.comment
    };

    return await this.reviewRepository.create(reviewData);
  }

  async getReviewsByProduct(productId) {
    return await this.reviewRepository.findByProductId(productId);
  }

  async deleteReview(reviewId, userId) {
    const review = await this.reviewRepository.findById(reviewId);
    
    if (!review) {
      throw new NotFoundError('Review not found');
    }

    if (review.user.toString() !== userId && req.user.role !== 'admin') {
      throw new AuthorizationError('You can only delete your own reviews');
    }

    return await this.reviewRepository.delete(reviewId);
  }
}

module.exports = ReviewService;
```

#### Step 6: Create Controller
```javascript
// controllers/ReviewController.js
const ReviewService = require('../services/ReviewService');
const ReviewRequestDTO = require('../dto/ReviewRequestDTO');
const ReviewResponseDTO = require('../dto/ReviewResponseDTO');
const { sendSuccess } = require('../utils/response');

class ReviewController {
  constructor() {
    this.reviewService = new ReviewService();
  }

  async createReview(req, res, next) {
    try {
      const reviewDTO = new ReviewRequestDTO(req.body);
      const review = await this.reviewService.createReview(reviewDTO, req.user.id);
      const responseDTO = new ReviewResponseDTO(review);
      return sendSuccess(res, { data: responseDTO, statusCode: 201 });
    } catch (error) {
      next(error);
    }
  }

  async getReviews(req, res, next) {
    try {
      const reviews = await this.reviewService.getReviewsByProduct(req.params.productId);
      const responseDTOs = reviews.map(r => new ReviewResponseDTO(r));
      return sendSuccess(res, { data: responseDTOs });
    } catch (error) {
      next(error);
    }
  }

  async deleteReview(req, res, next) {
    try {
      await this.reviewService.deleteReview(req.params.id, req.user.id);
      return sendSuccess(res, { message: 'Review deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ReviewController;
```

#### Step 7: Create Routes
```javascript
// routes/reviewRoutes.js
const express = require('express');
const ReviewController = require('../controllers/ReviewController');
const { protect } = require('../middleware/auth');

const router = express.Router();
const reviewController = new ReviewController();

router.get('/product/:productId', (req, res, next) => 
  reviewController.getReviews(req, res, next));

router.post('/', protect, (req, res, next) => 
  reviewController.createReview(req, res, next));

router.delete('/:id', protect, (req, res, next) => 
  reviewController.deleteReview(req, res, next));

module.exports = router;
```

#### Step 8: Mount Routes
```javascript
// server.js
const reviewRoutes = require('./routes/reviewRoutes');
app.use('/api/reviews', reviewRoutes);
```

---

## Summary

This architecture provides:
- ✅ **Separation of Concerns**: Each layer has specific responsibility
- ✅ **Testability**: Easy to mock dependencies and test
- ✅ **Scalability**: Easy to add new features following the same pattern
- ✅ **Maintainability**: Clear structure and conventions
- ✅ **Reusability**: Base classes and utilities reduce code duplication
- ✅ **Security**: Centralized error handling and input validation

Following these patterns will make your codebase professional, maintainable, and scalable!

