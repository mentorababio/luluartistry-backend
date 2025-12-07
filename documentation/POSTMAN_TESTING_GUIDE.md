# 📮 Postman Testing Guide - Lulu Artistry API

## 🚀 Quick Start

### 1. Import Collection
1. Open Postman
2. Click "Import" (top left)
3. Choose file: `POSTMAN_COLLECTION.json`
4. Collection imported ✅

### 2. Setup Environment
1. Create new Environment: "Lulu Artistry Dev"
2. Add these variables:
   ```
   baseUrl = http://localhost:5000/api
   token = (empty - filled after login)
   userId = (empty - filled after login)
   orderId = (empty - filled after creating order)
   bookingId = (empty - filled after creating booking)
   ```

### 3. Start Testing
1. Start your server: `npm run dev`
2. Run **Register** or **Login** first
3. Token automatically saved
4. Test other endpoints

---

## 🔐 Authentication Flow

### Step 1: Register New User
```
POST /api/auth/register
Body: {
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "12345678901",
  "password": "password123"
}
```
**Expected Response:**
```json
{
  "success": true,
  "token": "eyJhbGci...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "email": "john@example.com",
    "role": "customer"
  }
}
```

### Step 2: Extract & Save Token
After Register/Login, copy the `token` value:
1. Go to "Environments" (top right)
2. Select "Lulu Artistry Dev"
3. Paste token in `token` variable
4. Save

### Step 3: All Protected Routes Now Work
Any endpoint with header:
```
Authorization: Bearer {{token}}
```
Will automatically use your saved token.

---

## 📁 Endpoint Organization

### 🔑 Authentication (8 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Create new user account |
| POST | `/auth/login` | ❌ | Login with email/password |
| GET | `/auth/logout` | ✅ | Logout user |
| GET | `/auth/me` | ✅ | Get current user profile |
| PUT | `/auth/update-profile` | ✅ | Update user profile |
| PUT | `/auth/update-password` | ✅ | Change password |
| POST | `/auth/forgot-password` | ❌ | Request password reset |
| PUT | `/auth/reset-password/:token` | ❌ | Reset password with token |

### 📦 Products (7 endpoints)
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/products` | ❌ | - | Get all products |
| GET | `/products/featured/all` | ❌ | - | Get featured products |
| GET | `/products/category/:id` | ❌ | - | Get by category |
| GET | `/products/:id` | ❌ | - | Get single product |
| POST | `/products` | ✅ | admin | Create product |
| PUT | `/products/:id` | ✅ | admin | Update product |
| DELETE | `/products/:id` | ✅ | admin | Delete product |

### 🏷️ Categories (5 endpoints)
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/categories` | ❌ | - | Get all categories |
| GET | `/categories/:id` | ❌ | - | Get single category |
| POST | `/categories` | ✅ | admin | Create category |
| PUT | `/categories/:id` | ✅ | admin | Update category |
| DELETE | `/categories/:id` | ✅ | admin | Delete category |

### 🛒 Orders (6 endpoints)
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/orders` | ✅ | - | Get user orders |
| POST | `/orders` | ✅ | - | Create order |
| GET | `/orders/:id` | ✅ | - | Get single order |
| GET | `/orders/admin/all` | ✅ | admin | Get all orders |
| PUT | `/orders/:id/status` | ✅ | admin | Update status |
| PUT | `/orders/:id/cancel` | ✅ | - | Cancel order |

### 💳 Payments (5 endpoints)
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/payment/initialize` | ✅ | - | Start payment |
| GET | `/payment/verify/:ref` | ❌ | - | Verify payment |
| POST | `/payment/verify-order/:id` | ✅ | - | Verify order payment |
| PUT | `/payment/confirm-bank-transfer/:id` | ✅ | admin | Confirm transfer |
| POST | `/payment/refund` | ✅ | admin | Process refund |

### 📅 Bookings (7 endpoints)
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/bookings` | ✅ | - | Get user bookings |
| POST | `/bookings` | ✅ | - | Create booking |
| GET | `/bookings/availability` | ❌ | - | Check slots |
| GET | `/bookings/:id` | ✅ | - | Get booking |
| GET | `/bookings/admin/all` | ✅ | admin | Get all |
| PUT | `/bookings/:id/status` | ✅ | admin | Update status |
| PUT | `/bookings/:id/cancel` | ✅ | - | Cancel booking |

### 🏥 Health (2 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | ❌ | Server health check |
| GET | `/payment/debug` | ❌ | Payment route test |

**Total: 45 Endpoints**

---

## 🧪 Common Testing Workflows

### Workflow 1: Complete User Registration & Profile
```
1. POST /auth/register
   ↓ (Token saved automatically)
2. GET /auth/me
   ↓
3. PUT /auth/update-profile
   ↓
4. GET /auth/me (verify update)
```

### Workflow 2: Browse & Filter Products
```
1. GET /categories
2. GET /categories/:id (pick one)
3. GET /products/category/:categoryId
4. GET /products/:productId (pick one)
5. GET /products/featured/all
```

### Workflow 3: Complete Order Process
```
1. POST /orders (create)
2. GET /orders/:id (verify created)
3. POST /payment/initialize (start payment)
4. GET /payment/verify/:reference (verify payment)
5. GET /orders/:id (check updated status)
```

### Workflow 4: Admin Operations
```
1. POST /products (create new)
2. PUT /products/:id (update)
3. GET /products/:id (verify)
4. POST /categories (add category)
5. GET /orders/admin/all (view all orders)
```

---

## 🔍 Testing Tips & Tricks

### 1. Use Environment Variables
Instead of hardcoding IDs:
```
POST /api/products/{{productId}}
```
Then set `productId` in environment.

### 2. Pre-request Scripts
Auto-add timestamp to requests:
```javascript
pm.request.headers.upsert({
  key: "X-Request-Time",
  value: new Date().toISOString()
});
```

### 3. Tests Scripts (Validate Responses)
After each request, validate:
```javascript
pm.test("Status is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.token).to.exist;
});
```

### 4. Save Response to Variable
In Tests tab:
```javascript
var jsonData = pm.response.json();
pm.environment.set("userId", jsonData.user.id);
pm.environment.set("token", jsonData.token);
```

### 5. Bulk Test Collection
Click "Runner" → Select collection → Run all endpoints

---

## 📊 Response Format Guide

### Success Response
```json
{
  "success": true,
  "data": { /* actual data */ },
  "message": "Operation successful",
  "timestamp": "2025-12-07T10:30:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email format" }
  ],
  "timestamp": "2025-12-07T10:30:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  },
  "timestamp": "2025-12-07T10:30:00.000Z"
}
```

---

## 🛡️ Common Issues & Solutions

### ❌ "Invalid token" Error
**Solution:** 
- Make sure you're logged in first
- Check token is not expired (JWT_EXPIRE=30d)
- Verify Authorization header format: `Bearer {{token}}`

### ❌ "Validation error"
**Solution:**
- Check all required fields are provided
- Email must be unique for registration
- Phone must be 11 digits

### ❌ "Unauthorized (Admin only)"
**Solution:**
- Create admin user in database
- Update user role to "admin"
- Login again with admin account

### ❌ "Not found" (404)
**Solution:**
- Verify ID is correct (copy from response)
- Check if resource was deleted
- Try listing all to find valid ID

### ❌ "CORS error"
**Solution:**
- Check CORS is enabled in server.js
- Verify frontend URL in corsOptions
- Check credentials: true in Postman

---

## 📝 Testing Checklist

### Authentication
- [ ] Register new user
- [ ] Login with credentials
- [ ] Get logged-in user profile
- [ ] Update profile successfully
- [ ] Update password successfully
- [ ] Request password reset
- [ ] Logout

### Products
- [ ] Get all products (paginated)
- [ ] Get featured products
- [ ] Get products by category
- [ ] Get single product
- [ ] Create new product (admin)
- [ ] Update product (admin)
- [ ] Delete product (admin)

### Categories
- [ ] Get all categories
- [ ] Get single category
- [ ] Create category (admin)
- [ ] Update category (admin)
- [ ] Delete category (admin)

### Orders
- [ ] Create new order
- [ ] Get user orders
- [ ] Get single order
- [ ] Get all orders (admin)
- [ ] Update order status (admin)
- [ ] Cancel order

### Payments
- [ ] Initialize payment
- [ ] Verify payment
- [ ] Verify order payment
- [ ] Confirm bank transfer (admin)
- [ ] Initiate refund (admin)

### Bookings
- [ ] Check availability
- [ ] Create booking
- [ ] Get user bookings
- [ ] Get single booking
- [ ] Get all bookings (admin)
- [ ] Update booking status (admin)
- [ ] Cancel booking

---

## 🚀 Advanced Features

### Collection Variables
Store frequently used values:
```
authToken = (auto-saved after login)
defaultEmail = test@example.com
defaultPassword = password123
```

### Environments
Create multiple environments:
- **Development** (localhost:5000)
- **Staging** (staging.api.com)
- **Production** (api.luluartistry.com)

Switch between them in dropdown (top right).

### Postman Interceptor
Monitor real requests:
1. Download Postman Interceptor extension
2. Enable in Postman
3. Set requests in browser & Postman captures them

---

## 📚 Resources

- [Postman Documentation](https://learning.postman.com/)
- [API Authentication Guide](../docs/AUTH.md)
- [Error Codes Reference](../docs/ERRORS.md)
- [Rate Limiting Info](../docs/RATE_LIMIT.md)

---

**Last Updated:** December 7, 2025  
**API Version:** 1.0.0  
**Status:** ✅ Ready for Testing
