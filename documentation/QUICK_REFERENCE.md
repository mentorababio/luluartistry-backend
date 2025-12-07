# 🚀 Quick Reference Guide - OOP Architecture Implementation

A quick reference for developers implementing features using this OOP architecture.

---

## 📋 Quick Checklist for New Features

When adding a new feature, follow this exact order:

```
1. ✅ Create Model (schema definition)
2. ✅ Create DTOs (request/response)
3. ✅ Create Interface (contract)
4. ✅ Create Repository (data access)
5. ✅ Create Service (business logic)
6. ✅ Create Controller (HTTP handling)
7. ✅ Create Routes (endpoints)
8. ✅ Mount Routes (in server.js)
9. ✅ Create Tests
10. ✅ Seed Test Data
```

---

## 🏗️ Architecture Layers (Quick Reference)

### Layer 1: Routes
**File Location:** `src/modules/[feature]/routes/[feature]Routes.js`

**Responsibility:** Define HTTP endpoints

```javascript
const express = require('express');
const Controller = require('../controllers/FeatureController');
const { protect, authorize } = require('../../../middleware/auth');

const router = express.Router();
const controller = new Controller();

// Public route
router.get('/', (req, res, next) => controller.getAll(req, res, next));

// Protected route (logged in users only)
router.post('/', protect, (req, res, next) => controller.create(req, res, next));

// Admin-only route
router.delete('/:id', protect, authorize('admin'), (req, res, next) => 
  controller.delete(req, res, next));

module.exports = router;
```

**Mount in server.js:**
```javascript
const featureRoutes = require('./src/modules/feature/routes/featureRoutes');
app.use('/api/features', featureRoutes);
```

---

### Layer 2: Controllers
**File Location:** `src/modules/[feature]/controllers/[Feature]Controller.js`

**Responsibility:** Parse HTTP requests, call services, format responses

```javascript
const FeatureService = require('../services/FeatureService');
const FeatureRequestDTO = require('../dto/FeatureRequestDTO');
const FeatureResponseDTO = require('../dto/FeatureResponseDTO');
const { sendSuccess, sendError } = require('../../../utils/response');

class FeatureController {
  constructor(featureService = null) {
    this.featureService = featureService || new FeatureService();
  }

  async getAll(req, res, next) {
    try {
      const features = await this.featureService.getAll();
      const responseDTOs = features.map(f => new FeatureResponseDTO(f));
      return sendSuccess(res, { data: responseDTOs });
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    try {
      const requestDTO = new FeatureRequestDTO(req.body);
      const feature = await this.featureService.create(requestDTO);
      const responseDTO = new FeatureResponseDTO(feature);
      return sendSuccess(res, { 
        data: responseDTO, 
        message: 'Feature created',
        statusCode: 201 
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      await this.featureService.delete(req.params.id);
      return sendSuccess(res, { message: 'Feature deleted' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = FeatureController;
```

**Key Points:**
- Always wrap in try-catch
- Create DTOs from request data
- Call service methods
- Convert response to DTO
- Use `sendSuccess()` or `sendError()`
- Pass errors to `next(error)`

---

### Layer 3: Services
**File Location:** `src/modules/[feature]/services/[Feature]Service.js`

**Responsibility:** Business logic and validation

```javascript
const IFeatureService = require('../interfaces/IFeatureService');
const FeatureRepository = require('../repositories/FeatureRepository');
const ValidationError = require('../../../src/core/errors/ValidationError');
const NotFoundError = require('../../../src/core/errors/NotFoundError');

class FeatureService extends IFeatureService {
  constructor(featureRepository = null) {
    super();
    this.featureRepository = featureRepository || new FeatureRepository();
  }

  async create(featureDTO) {
    // 1. Validate
    featureDTO.validate();

    // 2. Check for duplicates
    const exists = await this.featureRepository.exists({ email: featureDTO.email });
    if (exists) {
      throw new ConflictError('Feature already exists');
    }

    // 3. Process data
    const processedData = this.processFeatureData(featureDTO);

    // 4. Save via repository
    const feature = await this.featureRepository.create(processedData);

    // 5. Return
    return feature;
  }

  async getAll() {
    return await this.featureRepository.findAll();
  }

  async delete(id) {
    const exists = await this.featureRepository.findById(id);
    if (!exists) {
      throw new NotFoundError('Feature not found');
    }
    return await this.featureRepository.delete(id);
  }

  processFeatureData(dto) {
    // Your business logic here
    return { /* processed data */ };
  }
}

module.exports = FeatureService;
```

**Key Points:**
- All business logic here
- Validate DTOs
- Check constraints
- Process data
- Use repository for data access
- Throw appropriate errors

---

### Layer 4: Repositories
**File Location:** `src/modules/[feature]/repositories/[Feature]Repository.js`

**Responsibility:** Data access only

```javascript
const BaseRepository = require('../../../src/core/repositories/BaseRepository');
const Feature = require('../../../models/Feature');

class FeatureRepository extends BaseRepository {
  constructor() {
    super(Feature);
  }

  // Custom queries go here
  async findByEmail(email) {
    return await this.model.findOne({ email });
  }

  async findActiveFeatures() {
    return await this.findAll({ isActive: true });
  }

  async findWithRelations(id) {
    return await this.model.findById(id)
      .populate('user', 'firstName lastName')
      .populate('category', 'name');
  }

  // Inherited methods:
  // - findById(id)
  // - findAll(filters, options)
  // - create(data)
  // - update(id, data)
  // - delete(id)
  // - exists(query)
  // - count(query)
}

module.exports = FeatureRepository;
```

**Key Points:**
- Only database operations
- NO business logic
- Use `this.model` for Mongoose queries
- Extend BaseRepository for CRUD
- Write custom queries as needed

---

### Layer 5: DTOs
**File Location:** `src/modules/[feature]/dto/`

**Responsibility:** Define data shapes

**RequestDTO - Input validation:**
```javascript
const BaseDTO = require('../../../src/core/dto/BaseDTO');

class FeatureRequestDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.name = data.name;
    this.email = data.email;
    this.description = data.description;
  }

  validate() {
    this.validateRequired(['name', 'email']);
    this.sanitizeStrings(['name', 'description']);
    
    // Custom validation
    if (this.name.length < 3) {
      throw new ValidationError('Name too short');
    }
  }
}

module.exports = FeatureRequestDTO;
```

**ResponseDTO - Output formatting:**
```javascript
const BaseDTO = require('../../../src/core/dto/BaseDTO');

class FeatureResponseDTO extends BaseDTO {
  constructor(feature) {
    super();
    this.id = feature._id;
    this.name = feature.name;
    this.email = feature.email;
    this.description = feature.description;
    this.createdAt = feature.createdAt;
    // NEVER include sensitive data like passwords, tokens, etc.
  }
}

module.exports = FeatureResponseDTO;
```

**Key Points:**
- RequestDTO validates incoming data
- ResponseDTO never exposes sensitive info
- Use BaseDTO for common utilities
- Always sanitize strings
- Validate required fields

---

### Layer 6: Models
**File Location:** `models/[Feature].js`

**Responsibility:** Mongoose schema definition

```javascript
const mongoose = require('mongoose');

const FeatureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  description: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
FeatureSchema.index({ email: 1 });
FeatureSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feature', FeatureSchema);
```

**Key Points:**
- Define all fields
- Add validation
- Set indexes
- Use timestamps

---

## 🔑 Error Handling Quick Reference

### Error Types Available

```javascript
// Import errors
const AppError = require('../src/core/errors/AppError');
const ValidationError = require('../src/core/errors/ValidationError');
const NotFoundError = require('../src/core/errors/NotFoundError');
const AuthenticationError = require('../src/core/errors/AuthenticationError');
const AuthorizationError = require('../src/core/errors/AuthorizationError');
const ConflictError = require('../src/core/errors/ConflictError');

// Usage
throw new ValidationError('Invalid input'); // 400
throw new NotFoundError('Resource not found'); // 404
throw new AuthenticationError('Not authenticated'); // 401
throw new AuthorizationError('No permission'); // 403
throw new ConflictError('Already exists'); // 409
throw new AppError('Custom message', 500); // Custom status
```

---

## ✅ Response Formatting Quick Reference

### Standard Responses

```javascript
const { sendSuccess, sendError, sendPaginated } = require('../utils/response');

// Success Response
sendSuccess(res, {
  data: responseDTO,
  message: 'Operation successful',
  statusCode: 200
});

// Error Response
sendError(res, error, 400);

// Paginated Response
sendPaginated(res, {
  data: features,
  total: 100,
  page: 1,
  pages: 10
}, 'Features retrieved');
```

### Response Format

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Operation successful",
  "data": { /* response data */ },
  "errors": null,
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

---

## 📝 DTO Template

```javascript
// Always start with BaseDTO
const BaseDTO = require('../../../src/core/dto/BaseDTO');

class [Feature]DTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.field1 = data.field1;
    this.field2 = data.field2;
  }

  // For RequestDTO
  validate() {
    this.validateRequired(['field1', 'field2']);
    this.sanitizeStrings(['field1', 'field2']);
    // Custom validation
  }

  // For ResponseDTO - no validate() needed
}

module.exports = [Feature]DTO;
```

---

## 🧪 Testing Structure

```javascript
// Basic test file structure
const FeatureService = require('../src/modules/feature/services/FeatureService');
const FeatureRepository = require('../src/modules/feature/repositories/FeatureRepository');

describe('FeatureService', () => {
  let featureService;
  let mockRepository;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn()
    };
    featureService = new FeatureService(mockRepository);
  });

  test('should create feature', async () => {
    const dto = new FeatureRequestDTO({ name: 'Test' });
    const result = await featureService.create(dto);
    expect(result).toBeDefined();
    expect(mockRepository.create).toHaveBeenCalled();
  });

  test('should throw on duplicate', async () => {
    mockRepository.exists.mockResolvedValue(true);
    const dto = new FeatureRequestDTO({ email: 'test@test.com' });
    
    await expect(featureService.create(dto))
      .rejects.toThrow('already exists');
  });
});
```

---

## 🔐 Authorization Template

```javascript
// Public route
router.get('/', getFeatures);

// Protected (logged in users only)
router.post('/', protect, createFeature);

// Admin only
router.delete('/:id', protect, authorize('admin'), deleteFeature);

// Custom authorization
router.put('/:id', protect, (req, res, next) => {
  if (req.params.id !== req.user.id && req.user.role !== 'admin') {
    throw new AuthorizationError('Can only edit own resource');
  }
  updateFeature(req, res, next);
});
```

---

## 📊 Directory Structure Checklist

```
✅ src/
  ✅ core/
    ✅ dto/
    ✅ errors/
    ✅ interfaces/
    ✅ repositories/
    ✅ services/
  ✅ modules/
    ✅ [feature]/
      ✅ controllers/
      ✅ dto/
      ✅ interfaces/
      ✅ repositories/
      ✅ routes/
      ✅ services/

✅ models/
✅ middleware/
✅ utils/
✅ config/
```

---

## 🎯 Common Patterns

### Pattern 1: Create with Validation

```javascript
async create(featureDTO) {
  featureDTO.validate(); // ← Validate first
  const exists = await this.repository.exists(/* check */);
  if (exists) throw new ConflictError(/* message */);
  return await this.repository.create(featureDTO.toObject());
}
```

### Pattern 2: Update with Authorization

```javascript
async update(id, userId, featureDTO) {
  const feature = await this.repository.findById(id);
  if (!feature) throw new NotFoundError();
  
  // Check ownership
  if (feature.userId !== userId) {
    throw new AuthorizationError('Cannot update others\' resource');
  }
  
  featureDTO.validate();
  return await this.repository.update(id, featureDTO.toObject());
}
```

### Pattern 3: Delete with Constraint

```javascript
async delete(id) {
  const feature = await this.repository.findById(id);
  if (!feature) throw new NotFoundError();
  
  // Check if can delete
  if (feature.hasRelatedData) {
    throw new ValidationError('Cannot delete feature with related data');
  }
  
  return await this.repository.delete(id);
}
```

### Pattern 4: Fetch with Pagination

```javascript
async getAll(paginationDTO) {
  paginationDTO.validate();
  return await this.repository.findAll(
    { isActive: true },
    paginationDTO.getQueryOptions()
  );
}
```

---

## 🚨 Common Mistakes to Avoid

| ❌ Don't | ✅ Do |
|---------|------|
| Business logic in controllers | Put logic in services |
| Direct Mongoose queries in services | Use repository pattern |
| Exposing passwords in responses | Use ResponseDTO without sensitive fields |
| Hard-coding status codes | Use error classes with built-in codes |
| Mixing concerns in one class | Follow single responsibility |
| Skipping validation | Always validate DTOs |
| Not handling errors | Always use try-catch and next(error) |
| Direct database in routes | Route → Controller → Service → Repository → DB |

---

## 📞 Quick Troubleshooting

**Q: "Cannot find module" error**
- Ensure file path is correct
- Check file naming conventions
- Verify exports at end of file

**Q: Endpoint returns null**
- Check if repository returns data
- Verify service processes correctly
- Check DTO conversion

**Q: "Not authenticated" on protected route**
- Verify `protect` middleware added
- Check JWT token format
- Ensure token in Authorization header

**Q: "Insufficient permissions" on admin route**
- Check `authorize('admin')` middleware
- Verify user.role is 'admin'
- Check database user record

**Q: Validation not working**
- Ensure `validate()` called in service
- Check DTO validation logic
- Verify error thrown

