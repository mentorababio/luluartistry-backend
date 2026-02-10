# 🧪 Quick Test Guide - Route Fixes Verification

## Overview
The backend API had a **routing priority issue** where generic routes (like `/:id`) were intercepting specific routes (like `/admin` and `/my`). This has been fixed.

---

## Quick Setup

### 1. Get a JWT Token
```bash
# First, register a user
curl -X POST https://luluartistry-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "08012345678",
    "password": "TestPassword123"
  }'

# Then login
curl -X POST https://luluartistry-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'

# Save the returned token
export TOKEN="your_jwt_token_here"
```

---

## Test Cases - Should All Work Now ✅

### 1. Public Routes (No Token Needed)
```bash
# Get all products
curl https://luluartistry-backend.onrender.com/api/products

# Get featured products
curl https://luluartistry-backend.onrender.com/api/products/featured/all

# Get products by category
curl https://luluartistry-backend.onrender.com/api/products/category/CATEGORY_ID

# Get all categories
curl https://luluartistry-backend.onrender.com/api/categories

# Check booking availability (PUBLIC)
curl https://luluartistry-backend.onrender.com/api/bookings/availability
```

### 2. Protected Routes (User Routes - Token Required)
```bash
# Get MY orders (should work now!)
curl -H "Authorization: Bearer $TOKEN" \
  https://luluartistry-backend.onrender.com/api/orders/my

# Get specific order
curl -H "Authorization: Bearer $TOKEN" \
  https://luluartistry-backend.onrender.com/api/orders/my/ORDER_ID

# Get user profile
curl -H "Authorization: Bearer $TOKEN" \
  https://luluartistry-backend.onrender.com/api/users/me

# Get user wishlist
curl -H "Authorization: Bearer $TOKEN" \
  https://luluartistry-backend.onrender.com/api/users/me/wishlist

# Get user addresses
curl -H "Authorization: Bearer $TOKEN" \
  https://luluartistry-backend.onrender.com/api/users/me/addresses
```

### 3. Admin Routes (Token + Admin Role Required)
For these to work, the user must have `role: 'admin'` in the database.

```bash
# Get ALL orders (Admin only)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://luluartistry-backend.onrender.com/api/orders/admin

# Get specific admin order details
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://luluartistry-backend.onrender.com/api/orders/admin/ORDER_ID

# Get order history (Admin only)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://luluartistry-backend.onrender.com/api/orders/admin/ORDER_ID/history

# Get all bookings (Admin only)
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://luluartistry-backend.onrender.com/api/bookings/admin/all

# Update booking status (Admin only)
curl -X PUT -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"confirmed"}' \
  https://luluartistry-backend.onrender.com/api/bookings/BOOKING_ID/status
```

---

## Expected Error Responses

### ✅ When Missing Token (Protected Route)
```json
{
  "success": false,
  "error": "Not authorized to access this route",
  "statusCode": 401
}
```
This is **EXPECTED and CORRECT** for protected routes without a token.

### ✅ When User is Not Admin (Admin Route)
```json
{
  "success": false,
  "error": "User role 'customer' is not authorized to access this route",
  "statusCode": 403
}
```
This is **EXPECTED and CORRECT** when a non-admin tries to access admin-only routes.

### ✅ When Token is Invalid
```json
{
  "success": false,
  "error": "Not authorized to access this route",
  "statusCode": 401
}
```
This is **EXPECTED and CORRECT** for malformed or expired tokens.

---

## What Was Fixed 🔧

### Before (Broken) ❌
```
GET /api/orders/admin  →  Matched as "admin" = ID  →  Error "User not found"
GET /api/orders/my     →  Matched as "my" = ID     →  Error "User not found"
GET /api/bookings/admin/all  →  Matched as "admin" = ID  →  Wrong response
```

### After (Fixed) ✅
```
GET /api/orders/admin  →  Matches /admin first  →  Admin orders returned
GET /api/orders/my     →  Matches /my first     →  User's orders returned
GET /api/bookings/admin/all  →  Matches /admin/all first  →  All bookings returned
```

---

## Using Postman

1. **Set Collection Variables:**
   - `baseUrl`: `https://luluartistry-backend.onrender.com/api`
   - `token`: [Your JWT token from login]

2. **Test a Protected Route:**
   - Click any request that requires auth
   - In the **Headers** tab, ensure:
     ```
     Authorization: Bearer {{token}}
     ```
   - Click **Send**
   - Should return data (NOT an authorization error)

3. **Test an Admin Route:**
   - Ensure the token belongs to an admin user
   - Send the request
   - Should return admin data

---

## Frontend Implementation Tips

### JavaScript/Fetch Example
```javascript
// Get user's orders
const response = await fetch('https://luluartistry-backend.onrender.com/api/orders/my', {
  headers: {
    'Authorization': `Bearer ${jwtToken}`
  }
});

const data = await response.json();
console.log(data);  // Should have {"success": true, "data": [...]}
```

### React Example
```javascript
const getMyOrders = async () => {
  const token = localStorage.getItem('authToken');
  
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/orders/my`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    console.error('Failed to fetch orders');
    return;
  }

  const data = await response.json();
  setOrders(data.data);
};
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Still getting "Not authorized" on `/orders/my` | Pull latest code, clear node_modules, reinstall |
| Admin routes not working | Check user role is "admin" in database |
| Token expires | Re-login and get new token |
| CORS errors | Check frontend URL is in corsOptions in server.js |
| Routes still broken after pull | Restart the server/redeploy |

---

## Routes Summary

### ✅ Now Working Correctly
- `GET /api/orders/my` - User's orders
- `GET /api/orders/admin` - All orders (admin)
- `GET /api/bookings/admin/all` - All bookings (admin)
- `GET /api/bookings/availability` - Booking slots (public)
- `GET /api/products/featured/all` - Featured products (public)
- All other protected and admin routes

### Files Changed
1. [orderRoutes.js](orderRoutes.js) - Reordered for correct matching
2. [bookingRoutes.js](bookingRoutes.js) - Reordered for correct matching
3. [productRoutes.js](productRoutes.js) - Reordered for correct matching
4. [server.js](server.js) - Removed conflicting debug route

---

**Questions?** Check the [ROUTING_FIXES_GUIDE.md](ROUTING_FIXES_GUIDE.md) for detailed technical explanation.
