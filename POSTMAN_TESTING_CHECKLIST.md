# 🧪 Complete Postman Testing Guide

## Prerequisites
1. Postman installed
2. Latest POSTMAN_COLLECTION.json imported
3. Base variables set up

---

## STEP 1: Setup Variables in Postman

In Postman, open **Collections** → Select **Lulu Artistry** → **Variables** tab

Set these:
```
baseUrl: https://luluartistry-backend.onrender.com/api
token: (will be set after login)
userId: (will be set after getting profile)
orderId: (will be set after creating/getting order)
productId: (copy any product ID from GET products)
categoryId: (copy any category ID from GET categories)
addressId: (will be set after adding address)
```

---

## STEP 2: Initial Setup - Register & Login

### 2.1 Register New User
**Request:** POST `/auth/register`

```json
{
  "firstName": "Test",
  "lastName": "User",
  "email": "testuser@example.com",
  "phone": "08012345678",
  "password": "TestPassword123"
}
```

**Expected Response:** 201 Created
```json
{
  "success": true,
  "token": "eyJhbGc..."
}
```

✅ **Action:** Copy token, set `{{token}}` variable

### 2.2 Login User
**Request:** POST `/auth/login`

```json
{
  "email": "testuser@example.com",
  "password": "TestPassword123"
}
```

**Expected Response:** 200 OK
```json
{
  "success": true,
  "token": "eyJhbGc..."
}
```

✅ **Action:** Update `{{token}}` variable with new token

---

## STEP 3: Test User Profile Endpoints

### 3.1 Get Current User Profile
**Request:** GET `/auth/me`  
**Headers:** `Authorization: Bearer {{token}}`

**Expected:** 200 OK with user data

✅ **Check:** User ID matches, email correct, role field present

---

## STEP 4: Test User Address Endpoints

### 4.1 Get My Profile
**Request:** GET `/users/me`  
**Headers:** `Authorization: Bearer {{token}}`

**Expected:** 200 OK

✅ **Check:** Profile data returned

### 4.2 Get All Addresses
**Request:** GET `/users/me/addresses`  
**Headers:** `Authorization: Bearer {{token}}`

**Expected:** 200 OK with array of addresses

### 4.3 Add New Address
**Request:** POST `/users/me/addresses`  
**Headers:** `Authorization: Bearer {{token}}`

```json
{
  "street": "123 Main Street",
  "city": "Lagos",
  "state": "Lagos State",
  "landmark": "Near Market",
  "isDefault": true
}
```

**Expected:** 201 Created

✅ **Action:** Copy returned address ID, set `{{addressId}}` variable

### 4.4 Update Address
**Request:** PUT `/users/me/addresses/{{addressId}}`  
**Headers:** `Authorization: Bearer {{token}}`

```json
{
  "street": "456 New Street",
  "city": "Abuja"
}
```

**Expected:** 200 OK

### 4.5 Delete Address
**Request:** DELETE `/users/me/addresses/{{addressId}}`  
**Headers:** `Authorization: Bearer {{token}}`

**Expected:** 200 OK

---

## STEP 5: Test Product & Category Endpoints (Public)

### 5.1 Get All Products
**Request:** GET `/products?page=1&limit=10`  
**Headers:** None required

**Expected:** 200 OK with products array

✅ **Action:** Copy a product ID, set `{{productId}}` variable

### 5.2 Get Featured Products
**Request:** GET `/products/featured/all`

**Expected:** 200 OK with featured products

### 5.3 Get Single Product
**Request:** GET `/products/{{productId}}`

**Expected:** 200 OK with product details

### 5.4 Get All Categories
**Request:** GET `/categories`

**Expected:** 200 OK with categories array

✅ **Action:** Copy a category ID, set `{{categoryId}}` variable

### 5.5 Get Products by Category
**Request:** GET `/products/category/{{categoryId}}`

**Expected:** 200 OK with filtered products

---

## STEP 6: Test User Order Endpoints

### 6.1 Create Order
**Request:** POST `/orders`  
**Headers:** 
- `Authorization: Bearer {{token}}`
- `Content-Type: application/json`

```json
{
  "items": [
    {
      "product": "{{productId}}",
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
    "firstName": "Test",
    "lastName": "User",
    "email": "testuser@example.com",
    "phone": "08012345678"
  },
  "paymentMethod": "paystack"
}
```

**Expected:** 201 Created

✅ **Action:** Copy order ID from response, set `{{orderId}}` variable

### 6.2 Get My Orders
**Request:** GET `/orders/my`  
**Headers:** `Authorization: Bearer {{token}}`

**Expected:** 200 OK with user's orders

✅ **Check:** Your created order appears in list

### 6.3 Get Specific Order Details
**Request:** GET `/orders/my/{{orderId}}`  
**Headers:** `Authorization: Bearer {{token}}`

**Expected:** 200 OK with complete order data

✅ **Check:** Items, shipping address, payment method all present

### 6.4 Submit Bank Transfer Reference
**Request:** PATCH `/orders/my/{{orderId}}/payment-reference`  
**Headers:** `Authorization: Bearer {{token}}`

```json
{
  "reference": "TRF20260306123456"
}
```

**Expected:** 200 OK

✅ **Check:** Payment reference updated in order

### 6.5 Cancel Order
**Request:** PUT `/orders/{{orderId}}/cancel`  
**Headers:** `Authorization: Bearer {{token}}`

**Expected:** 200 OK

✅ **Check:** Order status changed to cancelled

---

## STEP 7: Test Payment Endpoints

### 7.1 Initialize Paystack Payment
**Request:** POST `/payment/initialize`  
**Headers:** `Authorization: Bearer {{token}}`

```json
{
  "type": "order",
  "referenceId": "{{orderId}}",
  "amount": 52500,
  "email": "testuser@example.com"
}
```

**Expected:** 200 OK
```json
{
  "success": true,
  "data": {
    "authorizationUrl": "https://checkout.paystack.com/...",
    "accessCode": "...",
    "reference": "..."
  }
}
```

✅ **Check:** Authorization URL present

### 7.2 Verify Paystack Payment
**Request:** GET `/payment/verify/ORDER-123-1234567890`  
**Headers:** None required

**Expected:** 200 OK (if payment was verified on Paystack)

---

## STEP 8: Test Admin Endpoints (Admin User Only)

⚠️ **REQUIRES:** Admin user with `role: "admin"` in database

### 8.1 Get All Orders (Admin)
**Request:** GET `/orders/admin?status=pending`  
**Headers:** `Authorization: Bearer {{adminToken}}`

**Expected:** 200 OK with all orders

✅ **Check:** Multiple orders visible (admin scope)

### 8.2 Get Order Details (Admin)
**Request:** GET `/orders/admin/{{orderId}}`  
**Headers:** `Authorization: Bearer {{adminToken}}`

**Expected:** 200 OK with detailed order info

### 8.3 Get Order History Timeline
**Request:** GET `/orders/admin/{{orderId}}/history`  
**Headers:** `Authorization: Bearer {{adminToken}}`

**Expected:** 200 OK with order status timeline

### 8.4 Accept Order
**Request:** PATCH `/orders/admin/{{orderId}}/accept`  
**Headers:** `Authorization: Bearer {{adminToken}}`

**Expected:** 200 OK, order status → `processing`

### 8.5 Decline Order
**Request:** PATCH `/orders/admin/{{orderId}}/decline`  
**Headers:** `Authorization: Bearer {{adminToken}}`

**Expected:** 200 OK, order status → `cancelled`

### 8.6 Mark Order as Delivered
**Request:** PATCH `/orders/admin/{{orderId}}/deliver`  
**Headers:** `Authorization: Bearer {{adminToken}}`

**Expected:** 200 OK, order status → `delivered`

### 8.7 Confirm Bank Transfer Payment (Admin)
**Request:** PUT `/payment/confirm-bank-transfer/{{orderId}}`  
**Headers:** `Authorization: Bearer {{adminToken}}`

```json
{
  "transactionReference": "TRF20260306123456",
  "amountReceived": 52500,
  "notes": "Payment confirmed"
}
```

**Expected:** 200 OK

---

## STEP 9: Test Wishlist Endpoints

### 9.1 Get Wishlist
**Request:** GET `/users/me/wishlist`  
**Headers:** `Authorization: Bearer {{token}}`

**Expected:** 200 OK

### 9.2 Add to Wishlist
**Request:** POST `/users/me/wishlist/{{productId}}`  
**Headers:** `Authorization: Bearer {{token}}`

**Expected:** 201 Created

### 9.3 Remove from Wishlist
**Request:** DELETE `/users/me/wishlist/{{productId}}`  
**Headers:** `Authorization: Bearer {{token}}`

**Expected:** 200 OK

---

## STEP 10: Error Testing - Verify Authorization Works

### 10.1 Test Missing Token
**Request:** GET `/orders/my`  
**Headers:** None

**Expected:** 401 Unauthorized
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

✅ **Good:** Route properly protected

### 10.2 Test Invalid Token
**Request:** GET `/orders/my`  
**Headers:** `Authorization: Bearer invalid_token_xyz`

**Expected:** 401 Unauthorized

### 10.3 Test Non-Admin Accessing Admin Route
**Request:** GET `/orders/admin`  
**Headers:** `Authorization: Bearer {{userToken}}`  (non-admin user)

**Expected:** 403 Forbidden
```json
{
  "success": false,
  "error": "User role 'customer' is not authorized to access this route"
}
```

---

## Testing Checklist

### Public Endpoints ✅
- [ ] GET `/products` - List products
- [ ] GET `/products/featured/all` - Featured products
- [ ] GET `/products/:id` - Single product
- [ ] GET `/products/category/:id` - Products by category
- [ ] GET `/categories` - All categories

### Authentication ✅
- [ ] POST `/auth/register` - Register
- [ ] POST `/auth/login` - Login
- [ ] GET `/auth/me` - Current user (needs token)

### User Profile ✅
- [ ] GET `/users/me` - Get profile
- [ ] GET `/users/me/addresses` - List addresses
- [ ] POST `/users/me/addresses` - Add address
- [ ] PUT `/users/me/addresses/:id` - Update address
- [ ] DELETE `/users/me/addresses/:id` - Delete address
- [ ] GET `/users/me/wishlist` - Get wishlist
- [ ] POST `/users/me/wishlist/:productId` - Add to wishlist
- [ ] DELETE `/users/me/wishlist/:productId` - Remove from wishlist

### User Orders ✅
- [ ] POST `/orders` - Create order
- [ ] GET `/orders/my` - My orders
- [ ] GET `/orders/my/:id` - Order details
- [ ] PATCH `/orders/my/:id/payment-reference` - Add payment ref
- [ ] PUT `/orders/:id/cancel` - Cancel order

### Payments ✅
- [ ] POST `/payment/initialize` - Initialize payment
- [ ] GET `/payment/verify/:reference` - Verify payment
- [ ] PUT `/payment/confirm-bank-transfer/:orderId` - Confirm transfer (admin)

### Admin Orders ✅
- [ ] GET `/orders/admin` - All orders
- [ ] GET `/orders/admin/:id` - Order details
- [ ] GET `/orders/admin/:id/history` - Order history
- [ ] PATCH `/orders/admin/:id/accept` - Accept order
- [ ] PATCH `/orders/admin/:id/decline` - Decline order
- [ ] PATCH `/orders/admin/:id/deliver` - Mark delivered

---

## Quick Testing Flow

### Normal User Flow:
```
1. Register → 2. Login → 3. Get Profile → 4. Add Address 
→ 5. Get Products → 6. Create Order → 7. View Order 
→ 8. Submit Payment Reference
```

### Admin Flow:
```
1. Login (admin account) → 2. Get All Orders 
→ 3. View Order Details → 4. Accept/Decline Order 
→ 5. Mark as Delivered → 6. Confirm Payment (if bank transfer)
```

---

## Tips for Testing

1. **Use Environment Variables:** Set `{{baseUrl}}`, `{{token}}`, `{{orderId}}` etc.
2. **Run Requests in Order:** Tests often depend on data from previous requests
3. **Check Status Codes:** Each endpoint should return the expected HTTP status
4. **Verify Response Structure:** Check that response has `success`, `data`, etc.
5. **Test Error Cases:** Try requests without auth, with invalid data, etc.
6. **Save Responses:** Use Postman's test scripts to auto-set variables

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check token is valid and in Bearer format |
| 403 Forbidden | Check user role (need admin for admin routes) |
| 404 Not Found | Check object ID exists (product, order, etc.) |
| 400 Bad Request | Check required fields in request body |
| Route not working | Verify endpoint matches collection exactly |

---

**Ready to test!** Start with Step 2 (Register & Login) and work through each section.
