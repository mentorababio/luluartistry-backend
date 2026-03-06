# 📋 Postman Testing - Command Reference

## All Endpoints with Examples

---

## 🔐 AUTHENTICATION

### Register New User
```bash
curl -X POST https://luluartistry-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User", 
    "email": "testuser@example.com",
    "phone": "08012345678",
    "password": "TestPassword123"
  }'
```
📊 Expected: **201 Created** with token

---

### Login User
```bash
curl -X POST https://luluartistry-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPassword123"
  }'
```
📊 Expected: **200 OK** with token

⚠️ Save token as: `TOKEN="eyJhbGc..."`

---

### Get Current User
```bash
curl -X GET https://luluartistry-backend.onrender.com/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```
📊 Expected: **200 OK** with user profile

---

## 👤 USER PROFILE & ADDRESSES

### Get My Profile
```bash
curl -X GET https://luluartistry-backend.onrender.com/api/users/me \
  -H "Authorization: Bearer $TOKEN"
```
📊 Expected: **200 OK**

---

### Get All Addresses
```bash
curl -X GET https://luluartistry-backend.onrender.com/api/users/me/addresses \
  -H "Authorization: Bearer $TOKEN"
```
📊 Expected: **200 OK** with addresses array

---

### Add New Address
```bash
curl -X POST https://luluartistry-backend.onrender.com/api/users/me/addresses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "street": "123 Main Street",
    "city": "Lagos",
    "state": "Lagos State",
    "landmark": "Near Market",
    "isDefault": true
  }'
```
📊 Expected: **201 Created** with address ID

⚠️ Save address ID: `ADDRESS_ID="507f1f..."`

---

### Update Address
```bash
curl -X PUT https://luluartistry-backend.onrender.com/api/users/me/addresses/$ADDRESS_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "street": "456 New Street",
    "city": "Abuja"
  }'
```
📊 Expected: **200 OK**

---

### Delete Address
```bash
curl -X DELETE https://luluartistry-backend.onrender.com/api/users/me/addresses/$ADDRESS_ID \
  -H "Authorization: Bearer $TOKEN"
```
📊 Expected: **200 OK**

---

## 🛍️ PRODUCTS & CATEGORIES (PUBLIC)

### Get All Products
```bash
curl https://luluartistry-backend.onrender.com/api/products?page=1&limit=10
```
📊 Expected: **200 OK** with products array

⚠️ Save product ID: `PRODUCT_ID="507f1f..."`

---

### Get Featured Products
```bash
curl https://luluartistry-backend.onrender.com/api/products/featured/all
```
📊 Expected: **200 OK**

---

### Get Single Product
```bash
curl https://luluartistry-backend.onrender.com/api/products/$PRODUCT_ID
```
📊 Expected: **200 OK** with product details

---

### Get All Categories
```bash
curl https://luluartistry-backend.onrender.com/api/categories
```
📊 Expected: **200 OK** with categories array

⚠️ Save category ID: `CATEGORY_ID="507f1f..."`

---

### Get Products by Category
```bash
curl https://luluartistry-backend.onrender.com/api/products/category/$CATEGORY_ID
```
📊 Expected: **200 OK** with filtered products

---

## ❤️ WISHLIST

### Get Wishlist
```bash
curl -X GET https://luluartistry-backend.onrender.com/api/users/me/wishlist \
  -H "Authorization: Bearer $TOKEN"
```
📊 Expected: **200 OK**

---

### Add to Wishlist
```bash
curl -X POST https://luluartistry-backend.onrender.com/api/users/me/wishlist/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN"
```
📊 Expected: **201 Created**

---

### Remove from Wishlist
```bash
curl -X DELETE https://luluartistry-backend.onrender.com/api/users/me/wishlist/$PRODUCT_ID \
  -H "Authorization: Bearer $TOKEN"
```
📊 Expected: **200 OK**

---

## 🛒 USER ORDERS

### Create Order
```bash
curl -X POST https://luluartistry-backend.onrender.com/api/orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "product": "'$PRODUCT_ID'",
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
  }'
```
📊 Expected: **201 Created** with order data

⚠️ Save order ID: `ORDER_ID="507f1f..."`

---

### Get My Orders
```bash
curl -X GET https://luluartistry-backend.onrender.com/api/orders/my \
  -H "Authorization: Bearer $TOKEN"
```
📊 Expected: **200 OK** with orders array

---

### Get Order Details
```bash
curl -X GET https://luluartistry-backend.onrender.com/api/orders/my/$ORDER_ID \
  -H "Authorization: Bearer $TOKEN"
```
📊 Expected: **200 OK** with complete order data

---

### Add Payment Reference (Bank Transfer)
```bash
curl -X PATCH https://luluartistry-backend.onrender.com/api/orders/my/$ORDER_ID/payment-reference \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "TRF20260306123456"
  }'
```
📊 Expected: **200 OK**

---

### Cancel Order
```bash
curl -X PUT https://luluartistry-backend.onrender.com/api/orders/$ORDER_ID/cancel \
  -H "Authorization: Bearer $TOKEN"
```
📊 Expected: **200 OK**

---

## 💳 PAYMENTS

### Initialize Paystack Payment
```bash
curl -X POST https://luluartistry-backend.onrender.com/api/payment/initialize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "order",
    "referenceId": "'$ORDER_ID'",
    "amount": 52500,
    "email": "testuser@example.com"
  }'
```
📊 Expected: **200 OK** with authorization URL

---

### Verify Paystack Payment
```bash
curl https://luluartistry-backend.onrender.com/api/payment/verify/ORDER-123-1234567890
```
📊 Expected: **200 OK** (if verified) or **400 Bad Request**

---

## 📊 ADMIN ORDERS (Requires Admin Token)

### Get All Orders
```bash
curl -X GET https://luluartistry-backend.onrender.com/api/orders/admin?status=pending \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
📊 Expected: **200 OK** (admin) or **403 Forbidden** (non-admin)

---

### Get Order Details (Admin)
```bash
curl -X GET https://luluartistry-backend.onrender.com/api/orders/admin/$ORDER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
📊 Expected: **200 OK**

---

### Get Order History
```bash
curl -X GET https://luluartistry-backend.onrender.com/api/orders/admin/$ORDER_ID/history \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
📊 Expected: **200 OK** with timeline

---

### Accept Order
```bash
curl -X PATCH https://luluartistry-backend.onrender.com/api/orders/admin/$ORDER_ID/accept \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
📊 Expected: **200 OK**, status → processing

---

### Decline Order
```bash
curl -X PATCH https://luluartistry-backend.onrender.com/api/orders/admin/$ORDER_ID/decline \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
📊 Expected: **200 OK**, status → cancelled

---

### Mark Order as Delivered
```bash
curl -X PATCH https://luluartistry-backend.onrender.com/api/orders/admin/$ORDER_ID/deliver \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```
📊 Expected: **200 OK**, status → delivered

---

### Confirm Bank Transfer Payment (Admin)
```bash
curl -X PUT https://luluartistry-backend.onrender.com/api/payment/confirm-bank-transfer/$ORDER_ID \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionReference": "TRF20260306123456",
    "amountReceived": 52500,
    "notes": "Payment confirmed"
  }'
```
📊 Expected: **200 OK**

---

## ERROR TESTING

### Test Missing Auth (Should fail)
```bash
curl https://luluartistry-backend.onrender.com/api/orders/my
```
📊 Expected: **401 Unauthorized**
```json
{"success":false,"error":"Not authorized to access this route"}
```

---

### Test Non-Admin User on Admin Route
```bash
curl -X GET https://luluartistry-backend.onrender.com/api/orders/admin \
  -H "Authorization: Bearer $REGULAR_USER_TOKEN"
```
📊 Expected: **403 Forbidden**
```json
{"success":false,"error":"User role 'customer' is not authorized to access this route"}
```

---

### Test Invalid Product ID
```bash
curl https://luluartistry-backend.onrender.com/api/products/invalid123
```
📊 Expected: **404 Not Found**

---

### Test Invalid Email in Registration
```bash
curl -X POST https://luluartistry-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "invalid-email",
    "phone": "08012345678",
    "password": "TestPassword123"
  }'
```
📊 Expected: **400 Bad Request**

---

## QUICK TEST SCRIPT

Save as `test.sh` and run with `bash test.sh`:

```bash
#!/bin/bash

API="https://luluartistry-backend.onrender.com/api"

# 1. Register
echo "1️⃣ Registering..."
REGISTER=$(curl -s -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test'$(date +%s)'@example.com",
    "phone": "08012345678",
    "password": "TestPassword123"
  }')
TOKEN=$(echo $REGISTER | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

# 2. Get Products
echo "2️⃣ Getting products..."
curl -s $API/products | jq '.' | head -20

# 3. Get My Orders
echo "3️⃣ Getting my orders..."
curl -s -X GET $API/orders/my \
  -H "Authorization: Bearer $TOKEN" | jq '.'

echo "✅ Tests complete!"
```

---

## Summary

**All 30+ Endpoints covered:**
- ✅ Authentication (3)
- ✅ User Profile (8)
- ✅ Products & Categories (5)
- ✅ User Orders (5)
- ✅ Wishlist (3)
- ✅ Payments (3)
- ✅ Admin Orders (6)

**Test in Postman:**
1. Import `POSTMAN_COLLECTION.json`
2. Follow the examples above
3. Check responses match expected status codes

