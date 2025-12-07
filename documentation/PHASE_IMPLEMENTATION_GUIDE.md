# 🎯 Phase Implementation Guide - Lulu Artistry E-commerce

## Overview

This document provides step-by-step implementation guides for each phase of the OOP architecture migration.

---

## 📋 Phase Checklist

- [x] **Phase 0**: Base Layer Foundation (COMPLETED) ✅
  - Error classes
  - Base interfaces
  - Base DTOs
  - Base repository
  - Base service
  - Response utilities

- [ ] **Phase 1**: User Module (IN PROGRESS)
- [ ] **Phase 2**: Category & Product Module  
- [ ] **Phase 3**: Cart & Order Module
- [ ] **Phase 4**: Transaction Module
- [ ] **Phase 5**: Payment Module

---

## 🚀 Phase 0: Base Layer Foundation

### Status: ✅ COMPLETED

### What Was Created:

1. **Error Classes** (`src/core/errors/`)
   - `AppError.js` - Base error class
   - `ValidationError.js` - 400 errors
   - `NotFoundError.js` - 404 errors
   - `AuthenticationError.js` - 401 errors
   - `AuthorizationError.js` - 403 errors
   - `ConflictError.js` - 409 errors

2. **Interfaces** (`src/core/interfaces/`)
   - `IBaseService.js` - Service contract
   - `IBaseRepository.js` - Repository contract

3. **DTOs** (`src/core/dto/`)
   - `BaseDTO.js` - Base class for all DTOs
   - `PaginationDTO.js` - Pagination handling
   - `ResponseDTO.js` - Standard API responses

4. **Base Classes**
   - `BaseRepository.js` - Common CRUD operations
   - `BaseService.js` - Common business logic

5. **Utilities**
   - `utils/response.js` - Response formatting
   - Enhanced `middleware/errorHandler.js`

### How It All Works Together:

```
User Request
    ↓
Routes layer (Express)
    ↓
Controllers layer (Request parsing)
    ↓
Services layer (Business logic)
    ↓
Repositories layer (Data access)
    ↓
Models layer (Mongoose schemas)
    ↓
Database
    ↓
Response (formatted by ResponseDTO)
```

### Using Base Classes:

```javascript
// Example: UserRepository extends BaseRepository
const BaseRepository = require('../src/core/repositories/BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User); // Pass Mongoose model
  }

  // Automatically get all these methods:
  // - findById(id)
  // - findAll(filters, options)
  // - create(data)
  // - update(id, data)
  // - delete(id)
  // - exists(query)
  // - count(query)
}
```

---

## 👤 Phase 1: User Module

### Objective
Implement complete user management with proper OOP structure, including registration, authentication, and profile management.

### Timeline: Week 2

### Deliverables

#### 1. User DTOs

Create `src/modules/user/dto/`:

```javascript
// UserRequestDTO.js - For incoming requests
const BaseDTO = require('../../../src/core/dto/BaseDTO');

class UserRequestDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.password = data.password;
  }

  validate() {
    this.validateRequired(['firstName', 'lastName', 'email', 'phone', 'password']);
    this.sanitizeStrings(['firstName', 'lastName', 'email']);
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      const ValidationError = require('../../../src/core/errors/ValidationError');
      throw new ValidationError('Invalid email format');
    }
  }
}

module.exports = UserRequestDTO;
```

```javascript
// UserResponseDTO.js - For outgoing responses
const BaseDTO = require('../../../src/core/dto/BaseDTO');

class UserResponseDTO extends BaseDTO {
  constructor(user) {
    super();
    this.id = user._id;
    this.firstName = user.firstName;
    this.lastName = user.lastName;
    this.email = user.email;
    this.phone = user.phone;
    this.role = user.role;
    this.avatar = user.avatar || null;
    this.isVerified = user.isVerified;
    this.createdAt = user.createdAt;
    // NEVER include password
  }
}

module.exports = UserResponseDTO;
```

#### 2. User Interface

Create `src/modules/user/interfaces/IUserService.js`:

```javascript
const IBaseService = require('../../../src/core/interfaces/IBaseService');

class IUserService extends IBaseService {
  async registerUser(userDTO) { throw new Error('Not implemented'); }
  async loginUser(email, password) { throw new Error('Not implemented'); }
  async getUserProfile(userId) { throw new Error('Not implemented'); }
  async updateUserProfile(userId, updateDTO) { throw new Error('Not implemented'); }
  async changePassword(userId, oldPassword, newPassword) { throw new Error('Not implemented'); }
  async getUserByEmail(email) { throw new Error('Not implemented'); }
}

module.exports = IUserService;
```

#### 3. User Repository

Create `src/modules/user/repositories/UserRepository.js`:

```javascript
const BaseRepository = require('../../../src/core/repositories/BaseRepository');
const User = require('../../../models/User');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.model.findOne({ email }).select('+password');
  }

  async findByPhoneAndEmail(phone, email) {
    return await this.model.findOne({
      $or: [{ phone }, { email }]
    });
  }

  async getUserWithoutPassword(id) {
    return await this.model.findById(id).select('-password');
  }

  async getActiveUsers(options = {}) {
    return await this.findAll(
      { isVerified: true },
      options
    );
  }
}

module.exports = UserRepository;
```

#### 4. User Service

Create `src/modules/user/services/UserService.js`:

```javascript
const IUserService = require('../interfaces/IUserService');
const UserRepository = require('../repositories/UserRepository');
const ValidationError = require('../../../src/core/errors/ValidationError');
const ConflictError = require('../../../src/core/errors/ConflictError');
const AuthenticationError = require('../../../src/core/errors/AuthenticationError');
const NotFoundError = require('../../../src/core/errors/NotFoundError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserService extends IUserService {
  constructor(userRepository = null) {
    super();
    this.userRepository = userRepository || new UserRepository();
  }

  async registerUser(userDTO) {
    // 1. Validate input
    userDTO.validate();

    // 2. Check if user already exists
    const existingUser = await this.userRepository.findByEmail(userDTO.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(userDTO.password, 10);

    // 4. Create user
    const userData = {
      firstName: userDTO.firstName,
      lastName: userDTO.lastName,
      email: userDTO.email,
      phone: userDTO.phone,
      password: hashedPassword,
      role: 'customer'
    };

    const user = await this.userRepository.create(userData);

    // 5. Return user (without password)
    return user;
  }

  async loginUser(email, password) {
    // 1. Validate input
    if (!email || !password) {
      throw new ValidationError('Email and password are required');
    }

    // 2. Find user with password
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // 3. Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    return user;
  }

  async getUserProfile(userId) {
    const user = await this.userRepository.getUserWithoutPassword(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  }

  async updateUserProfile(userId, updateDTO) {
    // Don't allow updating sensitive fields
    const allowedFields = ['firstName', 'lastName', 'phone', 'avatar'];
    const updateData = {};

    allowedFields.forEach(field => {
      if (updateDTO[field] !== undefined) {
        updateData[field] = updateDTO[field];
      }
    });

    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new NotFoundError('User not found');
    }

    return updatedUser;
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify old password
    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    const updated = await this.userRepository.update(userId, {
      password: hashedPassword
    });

    return updated;
  }

  async getUserByEmail(email) {
    return await this.userRepository.findByEmail(email);
  }

  generateAuthToken(user) {
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
    return token;
  }
}

module.exports = UserService;
```

#### 5. User Controller

Create `src/modules/user/controllers/UserController.js`:

```javascript
const UserService = require('../services/UserService');
const UserRequestDTO = require('../dto/UserRequestDTO');
const UserResponseDTO = require('../dto/UserResponseDTO');
const { sendSuccess, sendError } = require('../../../utils/response');

class UserController {
  constructor(userService = null) {
    this.userService = userService || new UserService();
  }

  async register(req, res, next) {
    try {
      const userDTO = new UserRequestDTO(req.body);
      const user = await this.userService.registerUser(userDTO);
      const token = this.userService.generateAuthToken(user);
      const responseDTO = new UserResponseDTO(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return sendSuccess(res, {
        data: { user: responseDTO, token },
        message: 'User registered successfully',
        statusCode: 201
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await this.userService.loginUser(email, password);
      const token = this.userService.generateAuthToken(user);
      const responseDTO = new UserResponseDTO(user);

      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return sendSuccess(res, {
        data: { user: responseDTO, token },
        message: 'Logged in successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await this.userService.getUserProfile(req.user.id);
      const responseDTO = new UserResponseDTO(user);
      return sendSuccess(res, { data: responseDTO });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const user = await this.userService.updateUserProfile(req.user.id, req.body);
      const responseDTO = new UserResponseDTO(user);
      return sendSuccess(res, {
        data: responseDTO,
        message: 'Profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      await this.userService.changePassword(req.user.id, oldPassword, newPassword);
      return sendSuccess(res, { message: 'Password changed successfully' });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      res.clearCookie('token');
      return sendSuccess(res, { message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;
```

#### 6. User Routes

Create `src/modules/user/routes/userRoutes.js`:

```javascript
const express = require('express');
const UserController = require('../controllers/UserController');
const { protect } = require('../../../middleware/auth');

const router = express.Router();
const userController = new UserController();

// Public routes
router.post('/register', (req, res, next) => userController.register(req, res, next));
router.post('/login', (req, res, next) => userController.login(req, res, next));

// Protected routes
router.get('/profile', protect, (req, res, next) => userController.getProfile(req, res, next));
router.put('/profile', protect, (req, res, next) => userController.updateProfile(req, res, next));
router.put('/change-password', protect, (req, res, next) => userController.changePassword(req, res, next));
router.post('/logout', protect, (req, res, next) => userController.logout(req, res, next));

module.exports = router;
```

#### 7. Update server.js

```javascript
// Add this line to server.js
const userRoutes = require('./src/modules/user/routes/userRoutes');

// Mount route
app.use('/api/users', userRoutes);
```

#### 8. Testing Phase 1

Create `seed-test-users.js`:

```javascript
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function seedUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing users (optional)
    await User.deleteMany({});

    const testUsers = [
      {
        firstName: 'John',
        lastName: 'Customer',
        email: 'john@example.com',
        phone: '08012345678',
        password: 'password123',
        role: 'customer'
      },
      {
        firstName: 'Jane',
        lastName: 'Customer',
        email: 'jane@example.com',
        phone: '08087654321',
        password: 'password123',
        role: 'customer'
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@luluartistry.com',
        phone: '08011111111',
        password: 'admin123456',
        role: 'admin'
      }
    ];

    const created = await User.insertMany(testUsers);
    console.log(`✅ Created ${created.length} test users`);

    created.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedUsers();
```

Run: `node seed-test-users.js`

### Verification Checklist

- [ ] Can register new user via POST `/api/users/register`
- [ ] Can login user via POST `/api/users/login`
- [ ] Can get user profile via GET `/api/users/profile` (protected)
- [ ] Can update profile via PUT `/api/users/profile` (protected)
- [ ] Can change password via PUT `/api/users/change-password` (protected)
- [ ] Password is never exposed in responses
- [ ] Errors are formatted properly
- [ ] Test users seeded successfully

---

## 📁 File Structure After Phase 1

```
src/
├── core/
│   ├── dto/
│   │   ├── BaseDTO.js
│   │   ├── PaginationDTO.js
│   │   └── ResponseDTO.js
│   ├── errors/
│   │   ├── AppError.js
│   │   ├── ValidationError.js
│   │   ├── NotFoundError.js
│   │   ├── AuthenticationError.js
│   │   ├── AuthorizationError.js
│   │   └── ConflictError.js
│   ├── interfaces/
│   │   ├── IBaseService.js
│   │   └── IBaseRepository.js
│   ├── repositories/
│   │   └── BaseRepository.js
│   └── services/
│       └── BaseService.js
└── modules/
    └── user/
        ├── controllers/
        │   └── UserController.js
        ├── dto/
        │   ├── UserRequestDTO.js
        │   └── UserResponseDTO.js
        ├── interfaces/
        │   └── IUserService.js
        ├── repositories/
        │   └── UserRepository.js
        ├── routes/
        │   └── userRoutes.js
        └── services/
            └── UserService.js
```

---

## Next Steps

After completing Phase 1:

1. **Test thoroughly** before moving to Phase 2
2. Document any modifications needed
3. Create test cases (Jest)
4. Setup CI/CD pipeline
5. Continue with Phase 2: Product & Category Module

---

## Key Takeaways

✅ **Phase 0 Foundation** provides:
- Reusable error handling
- Standardized DTOs
- Base repository with CRUD
- Base service with business logic
- Consistent response formatting

✅ **Phase 1 User Module** demonstrates:
- How to structure a complete module
- DTOs for request/response validation
- Service layer business logic
- Repository for data access
- Controller for HTTP handling
- Routes configuration

✅ **Phase 1 also establishes**:
- Authentication (JWT)
- Password hashing
- Role-based foundation (customer/admin)
- Email validation
- Standardized error responses

