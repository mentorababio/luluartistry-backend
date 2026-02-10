# 📘 Lulu Artistry Backend - API Documentation for Frontend Developers

**Version:** 2.0  
**Last Updated:** February 4, 2026  
**Status:** Production Ready ✅

---

## 🚀 Quick Start Guide

### Base URL
```
https://luluartistry-backend.onrender.com/api
```

### Authentication
All protected endpoints require a Bearer JWT token in the Authorization header:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

### Getting Started
1. **Register**: `POST /auth/register` - Create new account
2. **Login**: `POST /auth/login` - Get JWT token
3. **Use Token**: Add token to all subsequent requests

---

## 🔐 Authentication Endpoints

### 1. Register User
```
POST /auth/register
```
**Description:** Create a new user account

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "08012345678",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "08012345678",
    "role": "customer"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 2. Login User
```
POST /auth/login
```
**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Frontend Implementation:**
```javascript
// Save token to localStorage
localStorage.setItem('token', response.data.token);

// Use in all subsequent requests
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
};
```

---

### 3. Get Current User
```
GET /auth/me
```
**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "08012345678",
    "role": "customer",
    "avatar": {
      "url": "https://cloudinary.com/...",
      "publicId": "..."
    },
    "addresses": [],
    "wishlist": [],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

---

## 👤 User Profile APIs

### 1. Get My Profile
```
GET /users/me
```
**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "08012345678",
    "addresses": [
      {
        "_id": "607f1f77bcf86cd799439012",
        "addressType": "home",
        "street": "123 Main Street",
        "city": "Lagos",
        "state": "Lagos State",
        "isDefault": true
      }
    ],
    "wishlist": ["507f1f77bcf86cd799439013"]
  }
}
```

---

### 2. Update Profile
```
PUT /users/me
```
**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "08087654321"
}
```

---

### 3. Address Management

#### Get All Addresses
```
GET /users/me/addresses
```

#### Add New Address
```
POST /users/me/addresses
```

**Request Body:**
```json
{
  "addressType": "home",
  "street": "123 Main Street, Apt 4B",
  "city": "Lagos",
  "state": "Lagos State",
  "isDefault": true
}
```

**Note:** If `isDefault: true`, other addresses are automatically unmarked as default.

#### Update Address
```
PUT /users/me/addresses/{addressId}
```

#### Delete Address
```
DELETE /users/me/addresses/{addressId}
```

---

### 4. Wishlist Management

#### Get Wishlist
```
GET /users/me/wishlist
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Handmade Necklace",
      "price": 25000,
      "images": ["https://..."],
      "stock": 50
    }
  ]
}
```

#### Add to Wishlist
```
POST /users/me/wishlist/{productId}
```

#### Remove from Wishlist
```
DELETE /users/me/wishlist/{productId}
```

---

## 🛍️ Products Endpoints

### 1. Get All Products
```
GET /products?page=1&limit=10
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

**Response (200):**
```json
{
  "success": true,
  "count": 10,
  "total": 150,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439013",
      "name": "Handmade Necklace",
      "description": "Beautiful handcrafted necklace",
      "price": 25000,
      "images": ["https://..."],
      "category": "507f1f77bcf86cd799439014",
      "stock": 50,
      "isFeatured": true,
      "isActive": true,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 2. Get Featured Products
```
GET /products/featured/all
```

Perfect for homepage banner/showcase.

---

### 3. Get Product by ID
```
GET /products/{productId}
```

---

### 4. Get Products by Category
```
GET /products/category/{categoryId}
```

---

### 5. Get All Categories
```
GET /categories
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439014",
      "name": "Jewelry",
      "description": "Handmade jewelry collection"
    }
  ]
}
```

---

## 🛒 Orders - User Flow

### 1. Create Order
```
POST /orders
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "items": [
    {
      "product": "507f1f77bcf86cd799439013",
      "quantity": 2,
      "price": 25000
    }
  ],
  "shippingAddress": {
    "street": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos State",
    "landmark": "Near market"
  },
  "deliveryZone": {
    "zone": "Lagos",
    "cost": 2500
  },
  "customerInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "08012345678"
  },
  "coupon": {
    "code": "SAVE10",
    "discountAmount": 5000
  },
  "paymentMethod": "paystack",
  "isGift": false,
  "notes": "Handle with care"
}
```

**Important Notes:**
- `paymentMethod`: "paystack" or "transfer" (bank transfer)
- For bank transfer orders, you'll receive bank details in response
- User's cart is automatically cleared after order creation

**Response (201) - Paystack:**
```json
{
  "success": true,
  "message": "Order created successfully. Please proceed to payment.",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "orderNumber": "ORD-20240115-001",
    "user": "507f1f77bcf86cd799439011",
    "items": [...],
    "orderStatus": "pending",
    "payment": {
      "method": "paystack",
      "status": "pending"
    },
    "pricing": {
      "subtotal": 50000,
      "shippingCost": 2500,
      "discount": 5000,
      "total": 47500
    }
  }
}
```

**Response (201) - Bank Transfer:**
```json
{
  "success": true,
  "message": "Order created successfully. Please complete bank transfer.",
  "data": {...},
  "bankDetails": {
    "bankName": "First Bank",
    "accountNumber": "1234567890",
    "accountName": "Lulu Artistry",
    "amount": 47500
  }
}
```

---

### 2. Get My Orders
```
GET /orders/my?status=processing
```

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `status` - Filter by status: pending, processing, shipped, delivered, cancelled

---

### 3. Get Order Details
```
GET /orders/my/{orderId}
```

**Headers:** `Authorization: Bearer {token}`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "orderNumber": "ORD-20240115-001",
    "items": [
      {
        "product": "507f1f77bcf86cd799439013",
        "productSnapshot": {
          "name": "Handmade Necklace",
          "price": 25000,
          "image": "https://..."
        },
        "quantity": 2,
        "price": 25000,
        "subtotal": 50000
      }
    ],
    "orderStatus": "processing",
    "payment": {
      "method": "paystack",
      "status": "paid",
      "paystackReference": "pay_xxx",
      "paidAt": "2024-01-15T11:00:00Z"
    },
    "tracking": {
      "trackingNumber": "TRK123456",
      "carrier": "DHL",
      "estimatedDelivery": "2024-01-20T00:00:00Z"
    },
    "statusHistory": [
      {
        "status": "pending",
        "updatedAt": "2024-01-15T10:30:00Z"
      },
      {
        "status": "processing",
        "updatedAt": "2024-01-15T11:00:00Z",
        "note": "Order accepted by admin"
      }
    ]
  }
}
```

---

### 4. Submit Bank Transfer Reference
```
PATCH /orders/my/{orderId}/payment-reference
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "reference": "TRF202401151230"
}
```

**Use Case:** After customer makes bank transfer, they submit the receipt/reference number so admin can verify.

---

### 5. Cancel Order
```
PUT /orders/{orderId}/cancel
```

**Headers:** `Authorization: Bearer {token}`

**Constraints:**
- Only pending orders can be cancelled
- Product stock will be restored

---

## 💳 Payment Endpoints

### 1. Initialize Paystack Payment
```
POST /payment/initialize
```

**Headers:** `Authorization: Bearer {token}`

**Request Body:**
```json
{
  "type": "order",
  "referenceId": "507f1f77bcf86cd799439015",
  "amount": 47500,
  "email": "john@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "n94w8jdsj",
    "reference": "order-507f1f77bcf86cd799439015-1705329000000"
  }
}
```

**Frontend Implementation:**
```javascript
// 1. Initialize payment
const response = await axios.post('/payment/initialize', {
  type: 'order',
  referenceId: orderId,
  amount: totalAmount,
  email: userEmail
});

// 2. Redirect to Paystack
window.location.href = response.data.data.authorizationUrl;

// 3. After payment, verify
const verifyResponse = await axios.get(
  `/payment/verify/${paymentReference}`
);
// Order status automatically updates to processing
```

---

### 2. Verify Paystack Payment
```
GET /payment/verify/{reference}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment verified successfully",
  "data": {
    "reference": "pay_xxx",
    "amount": 4750000,
    "status": "success"
  }
}
```

---

### 3. Confirm Bank Transfer (Admin Only)
```
PUT /payment/confirm-bank-transfer/{orderId}
```

**Headers:** `Authorization: Bearer {token}` (Admin token)

**Request Body:**
```json
{
  "transactionReference": "TRF202401151230",
  "amountReceived": 47500,
  "notes": "Payment confirmed from FirstBank account"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bank transfer payment confirmed successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "payment": {
      "method": "transfer",
      "status": "paid",
      "reference": "TRF202401151230",
      "paidAt": "2024-01-15T11:00:00Z"
    },
    "orderStatus": "processing"
  }
}
```

---

## 📊 Admin - Orders Dashboard

### 1. Get All Orders (Dashboard)
```
GET /orders/admin?status=pending
```

**Headers:** `Authorization: Bearer {admin_token}`

**Query Parameters:**
- `status` - Filter by: pending, processing, shipped, delivered, cancelled

**Response (200):**
```json
{
  "success": true,
  "count": 25,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439015",
      "orderNumber": "ORD-20240115-001",
      "customer": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      },
      "total": 47500,
      "orderStatus": "pending",
      "payment": {
        "method": "paystack",
        "status": "pending"
      },
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 2. Get Order Details (Admin)
```
GET /orders/admin/{orderId}
```

**Headers:** `Authorization: Bearer {admin_token}`

---

### 3. Accept Order
```
PATCH /orders/admin/{orderId}/accept
```

**Headers:** `Authorization: Bearer {admin_token}`

**Effect:** Moves order from pending → processing

---

### 4. Decline Order
```
PATCH /orders/admin/{orderId}/decline
```

**Headers:** `Authorization: Bearer {admin_token}`

**Effect:** Cancels order, restores product stock

---

### 5. Mark Order as Delivered
```
PATCH /orders/admin/{orderId}/deliver
```

**Headers:** `Authorization: Bearer {admin_token}`

**Effect:** Moves order to delivered, records delivery time

---

### 6. Get Order History Timeline
```
GET /orders/admin/{orderId}/history
```

**Headers:** `Authorization: Bearer {admin_token}`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "status": "pending",
      "updatedAt": "2024-01-15T10:30:00Z",
      "note": "Order created"
    },
    {
      "status": "processing",
      "updatedAt": "2024-01-15T11:00:00Z",
      "note": "Order accepted by admin"
    },
    {
      "status": "shipped",
      "updatedAt": "2024-01-16T09:00:00Z",
      "note": "Order shipped with DHL"
    }
  ]
}
```

---

## 🔄 Order Status Lifecycle

```
pending
  ↓
processing (after admin accept or payment confirmed)
  ↓
shipped
  ↓
delivered
  ↓
[END]

OR

pending → cancelled (if admin declines or user cancels)
```

---

## 🚨 Error Handling

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (not allowed)
- `404` - Not Found
- `500` - Server Error

**Example Error Response:**
```json
{
  "success": false,
  "message": "Invalid payment method. Must be \"paystack\" or \"transfer\""
}
```

---

## 💡 Frontend Integration Tips

### 1. Token Management
```javascript
// Save token after login
localStorage.setItem('token', response.data.token);

// Retrieve for requests
const token = localStorage.getItem('token');

// Clear on logout
localStorage.removeItem('token');
```

### 2. API Interceptor Setup
```javascript
// Axios interceptor to add token to all requests
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 3. Order Flow Example
```javascript
// 1. Create order
const orderResponse = await axios.post('/orders', {
  items: [...],
  shippingAddress: {...},
  paymentMethod: 'paystack',
  // ...
});

const orderId = orderResponse.data.data._id;

// 2. For Paystack: Initialize payment
if (paymentMethod === 'paystack') {
  const paymentResponse = await axios.post('/payment/initialize', {
    type: 'order',
    referenceId: orderId,
    amount: totalAmount,
    email: userEmail
  });
  
  // Redirect to Paystack
  window.location.href = paymentResponse.data.data.authorizationUrl;
}

// 3. For Bank Transfer: Show bank details
else if (paymentMethod === 'transfer') {
  console.log('Bank Details:', orderResponse.data.bankDetails);
  // Show to user to make transfer
}
```

---

## 📱 Testing the API

### Using cURL
```bash
# Login
curl -X POST https://luluartistry-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Get Profile
curl -X GET https://luluartistry-backend.onrender.com/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Using Postman
1. Import the POSTMAN_COLLECTION.json file
2. Set `baseUrl` variable to base URL
3. Login first (token is auto-saved)
4. Use other endpoints

---

## 🎯 Key Implementation Notes

✅ **Order Status Lifecycle:**
- Use `pending`, `processing`, `shipped`, `delivered`, `cancelled`
- NOT `pending_payment` or `pending_verification`

✅ **Payment Methods:**
- Use `paystack` or `transfer` (not `bank_transfer`)

✅ **Route Precedence:**
- `/orders/my` routes MUST come before `/orders/:id` routes
- This prevents "my" from being treated as an ID

✅ **Cart Management:**
- Automatically cleared after order creation
- No manual cart clear needed on frontend

✅ **Webhook:**
- Paystack sends webhooks to `/payment/webhook`
- Automatically updates order status
- Don't call this endpoint manually

✅ **Default Address:**
- Setting `isDefault: true` automatically unsets other defaults
- Only one default address per user

---

## 📞 Support

For API issues or questions:
1. Check POSTMAN_COLLECTION.json for examples
2. Review error messages in response
3. Ensure JWT token is valid and not expired
4. Verify request body format matches documentation

---

**Happy Coding! 🚀**
