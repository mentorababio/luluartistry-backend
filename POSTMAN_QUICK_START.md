# 🚀 Quick Start - Postman Testing

## Import Collection

1. Open **Postman**
2. Click **Collections** (left sidebar)
3. Click **Import** button
4. Choose **Upload Files**
5. Select `POSTMAN_COLLECTION.json` from this folder
6. Click **Import**

✅ Collection now available in Postman

---

## Setup Variables

1. In Collections, find **Lulu Artistry Backend API**
2. Click **Variables** tab
3. Set these variables:

| Variable | Value | Example |
|----------|-------|---------|
| `baseUrl` | Your API base URL | `https://luluartistry-backend.onrender.com/api` |
| `token` | Leave blank (auto-filled after login) | Will be: `eyJhbGc...` |
| `orderId` | Leave blank (auto-filled after order) | Will be: `507f1f77bcf86...` |
| `productId` | Leave blank (copy from products list) | Will be: `507f1f77bcf86...` |
| `addressId` | Leave blank (auto-filled after add address) | Will be: `507f1f77bcf86...` |
| `categoryId` | Leave blank (copy from categories list) | Will be: `507f1f77bcf86...` |

---

## Quick Test Order

### 1️⃣ Register (Postman Folder: 🔐 Authentication)
- **Request:** `Register New User`
- **Method:** POST to `/auth/register`
- **Body:** Pre-filled with test user
- **Click:** Send
- **Expected:** 201 Created + Token
- **✅ Token auto-saved** (check Tests tab)

### 2️⃣ Login (Postman Folder: 🔐 Authentication)
- **Request:** `Login User`
- **Method:** POST to `/auth/login`
- **Click:** Send
- **Expected:** 200 OK + Token
- **Note:** Use same email/password from registration

### 3️⃣ Get Products (Postman Folder: 🛍️ Products & Categories)
- **Request:** `Get All Products`
- **Method:** GET `/products`
- **No auth needed**
- **Click:** Send
- **✅ Copy a product ID** and set `{{productId}}`

### 4️⃣ Get Categories (Postman Folder: 🛍️ Products & Categories)
- **Request:** `Get All Categories`
- **Method:** GET `/categories`
- **Click:** Send
- **✅ Copy a category ID** and set `{{categoryId}}`

### 5️⃣ Test User Profile (Postman Folder: 👤 User Profile & Addresses)
- **Request:** `Get profile`
- **Method:** GET `/users/me`
- **Headers:** Auto includes `Authorization: Bearer {{token}}`
- **Click:** Send
- **Expected:** 200 OK + Your user data

### 6️⃣ Add Address (Postman Folder: 👤 User Profile & Addresses)
- **Request:** `Add address`
- **Method:** POST `/users/me/addresses`
- **Body:** Pre-filled with test data
- **Click:** Send
- **Expected:** 201 Created
- **✅ Copy address ID** and set `{{addressId}}`

### 7️⃣ Create Order (Postman Folder: 🛒 Orders - User)
- **Request:** `Create Order`
- **Method:** POST `/orders`
- **Body:** Uses `{{productId}}` from step 3
- **Click:** Send
- **Expected:** 201 Created
- **✅ Copy order ID** and set `{{orderId}}`

### 8️⃣ Get My Orders (Postman Folder: 🛒 Orders - User)
- **Request:** `Get My Orders`
- **Method:** GET `/orders/my`
- **Click:** Send
- **Expected:** 200 OK + Your orders list
- **✅ Check:** Your created order is visible

### 9️⃣ Get Order Details (Postman Folder: 🛒 Orders - User)
- **Request:** `Get Order Details`
- **Method:** GET `/orders/my/{{orderId}}`
- **Click:** Send
- **Expected:** 200 OK + Full order details

### 🔟 Test Admin Orders (Postman Folder: 📊 Orders - Admin Dashboard)
- **Requires:** Admin user token
- **Request:** `Get All Orders (Dashboard)`
- **Method:** GET `/orders/admin`
- **Headers:** Auto includes admin token
- **Click:** Send
- **Expected:** 200 OK (if admin user) OR 403 Forbidden (if regular user)

---

## Test Different Request Types

### ✅ Test GET Request
Example: `GET /api/products`
- Click request
- Click **Send**
- View response in bottom panel

### ✅ Test POST Request
Example: `POST /api/orders`
- Click request
- View **Body** tab (pre-filled)
- Can edit JSON data before sending
- Click **Send**

### ✅ Test PATCH Request
Example: `PATCH /api/orders/my/:id/payment-reference`
- Click request
- Update body with your data
- Click **Send**

### ✅ Test DELETE Request
Example: `DELETE /api/users/me/wishlist/:productId`
- Click request
- Click **Send**
- Response shows success/error

---

## View Responses

After sending a request, you see:

**Top Section:**
- Status code (200, 201, 401, 404, etc.)
- Response time
- Response size

**Bottom Section:**
- **Body** tab: Response JSON
- **Headers** tab: Response headers
- **Test Results** tab: Test pass/fail
- **Console** tab: Logs

---

## Authorization Header

All protected endpoints automatically get:
```
Authorization: Bearer {{token}}
```

This is set in the collection's **Pre-request Script**.

If you get "Not authorized" error:
1. ✅ Check token is set in variables
2. ✅ Check request has authorization header
3. ✅ Verify token is valid (re-login if needed)

---

## Examples of Expected Responses

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "firstName": "Test",
    "lastName": "User"
  }
}
```

### Error Response - No Auth
```json
{
  "success": false,
  "error": "Not authorized to access this route"
}
```

### Error Response - Forbidden (Not Admin)
```json
{
  "success": false,
  "error": "User role 'customer' is not authorized to access this route"
}
```

### Error Response - Not Found
```json
{
  "success": false,
  "error": "Order not found"
}
```

---

## Commands by Endpoint Type

### User Authentication
1. **Register** → `POST /auth/register`
2. **Login** → `POST /auth/login`
3. **Get Me** → `GET /auth/me`

### User Profile & Addresses
4. **Get Profile** → `GET /users/me`
5. **Get Addresses** → `GET /users/me/addresses`
6. **Add Address** → `POST /users/me/addresses`
7. **Update Address** → `PUT /users/me/addresses/:id`
8. **Delete Address** → `DELETE /users/me/addresses/:id`

### Wishlist
9. **Get Wishlist** → `GET /users/me/wishlist`
10. **Add to Wishlist** → `POST /users/me/wishlist/:productId`
11. **Remove from Wishlist** → `DELETE /users/me/wishlist/:productId`

### Products & Categories (Public)
12. **Get Products** → `GET /products`
13. **Get Featured Products** → `GET /products/featured/all`
14. **Get Product by ID** → `GET /products/:id`
15. **Get Products by Category** → `GET /products/category/:id`
16. **Get Categories** → `GET /categories`

### User Orders
17. **Create Order** → `POST /orders`
18. **Get My Orders** → `GET /orders/my`
19. **Get Order** → `GET /orders/my/:id`
20. **Add Payment Reference** → `PATCH /orders/my/:id/payment-reference`
21. **Cancel Order** → `PUT /orders/:id/cancel`

### Admin Orders
22. **Get All Orders** → `GET /orders/admin`
23. **Get Order Details** → `GET /orders/admin/:id`
24. **Get Order History** → `GET /orders/admin/:id/history`
25. **Accept Order** → `PATCH /orders/admin/:id/accept`
26. **Decline Order** → `PATCH /orders/admin/:id/decline`
27. **Mark Delivered** → `PATCH /orders/admin/:id/deliver`

### Payments
28. **Initialize Paystack** → `POST /payment/initialize`
29. **Verify Payment** → `GET /payment/verify/:reference`
30. **Confirm Bank Transfer** → `PUT /payment/confirm-bank-transfer/:orderId`

---

## Troubleshooting

### "Not authorized to access this route"
- ✅ Re-login to get fresh token
- ✅ Check token is set in variables
- ✅ Verify Authorization header present

### "Cannot POST /api/orders/my/ORDER_ID/payment-reference"
- ✅ Use PATCH method, not POST
- ✅ Replace `ORDER_ID` with actual order ID

### "Order not found"
- ✅ Check order ID is correct
- ✅ Verify order belongs to your user
- ✅ Order might have been deleted

### 403 Forbidden on `/orders/admin`
- ✅ Check if your user is admin (role: "admin")
- ✅ Only admin users can access `/admin` routes
- ✅ Use admin token if available

---

**You're ready to test!** Start with Register → Login → Get Products → Create Order. Check the detailed guide for comprehensive testing.
