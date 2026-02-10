# 🔗 API Endpoints Quick Reference

**Base URL:** `https://luluartistry-backend.onrender.com/api`  
**Auth:** JWT Bearer Token (except public endpoints)

---

## 🔐 Authentication

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| POST | `/auth/register` | Create new account | ❌ | 201 |
| POST | `/auth/login` | Login & get JWT | ❌ | 200 |
| GET | `/auth/me` | Get current user | ✅ | 200 |
| PUT | `/auth/update-profile` | Update profile | ✅ | 200 |
| PUT | `/auth/update-password` | Change password | ✅ | 200 |
| GET | `/auth/logout` | Logout | ✅ | 200 |
| POST | `/auth/forgot-password` | Request password reset | ❌ | 200 |
| PUT | `/auth/reset-password/:token` | Reset password | ❌ | 200 |

---

## 👤 User Profile & Addresses

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/users/me` | Get profile | ✅ | 200 |
| PUT | `/users/me` | Update profile | ✅ | 200 |
| GET | `/users/me/addresses` | Get all addresses | ✅ | 200 |
| POST | `/users/me/addresses` | Add address | ✅ | 201 |
| PUT | `/users/me/addresses/:id` | Update address | ✅ | 200 |
| DELETE | `/users/me/addresses/:id` | Delete address | ✅ | 200 |

---

## 📌 Wishlist

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/users/me/wishlist` | Get wishlist | ✅ | 200 |
| POST | `/users/me/wishlist/:productId` | Add to wishlist | ✅ | 201 |
| DELETE | `/users/me/wishlist/:productId` | Remove from wishlist | ✅ | 200 |

---

## 🛍️ Products & Categories

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/products` | Get all products (paginated) | ❌ | 200 |
| GET | `/products/featured/all` | Get featured products | ❌ | 200 |
| GET | `/products/:id` | Get product details | ❌ | 200 |
| GET | `/products/category/:categoryId` | Get products by category | ❌ | 200 |
| GET | `/categories` | Get all categories | ❌ | 200 |
| POST | `/products` | Create product (Admin) | ✅🔐 | 201 |
| PUT | `/products/:id` | Update product (Admin) | ✅🔐 | 200 |
| DELETE | `/products/:id` | Delete product (Admin) | ✅🔐 | 200 |

---

## 🛒 Orders - User

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| POST | `/orders` | Create order | ✅ | 201 |
| GET | `/orders/my` | Get my orders | ✅ | 200 |
| GET | `/orders/my/:id` | Get order details | ✅ | 200 |
| PATCH | `/orders/my/:id/payment-reference` | Submit bank transfer ref | ✅ | 200 |
| PUT | `/orders/:id/cancel` | Cancel order | ✅ | 200 |
| GET | `/orders` | Get orders (legacy) | ✅ | 200 |
| GET | `/orders/:id` | Get order (legacy) | ✅ | 200 |

---

## 💳 Payments

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| POST | `/payment/initialize` | Initialize Paystack payment | ✅ | 200 |
| GET | `/payment/verify/:reference` | Verify Paystack payment | ❌ | 200 |
| PUT | `/payment/confirm-bank-transfer/:orderId` | Confirm bank transfer (Admin) | ✅🔐 | 200 |
| POST | `/payment/refund` | Initiate refund (Admin) | ✅🔐 | 200 |
| POST | `/payment/webhook` | Paystack webhook | ❌ | 200 |

---

## 📊 Orders - Admin

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| GET | `/orders/admin` | Get all orders (dashboard) | ✅🔐 | 200 |
| GET | `/orders/admin/:id` | Get order details (Admin) | ✅🔐 | 200 |
| PATCH | `/orders/admin/:id/accept` | Accept order | ✅🔐 | 200 |
| PATCH | `/orders/admin/:id/decline` | Decline order | ✅🔐 | 200 |
| PATCH | `/orders/admin/:id/deliver` | Mark delivered | ✅🔐 | 200 |
| GET | `/orders/admin/:id/history` | Get order timeline | ✅🔐 | 200 |
| PUT | `/orders/:id/status` | Update status (legacy) | ✅🔐 | 200 |
| GET | `/orders/admin/all` | Get all orders (legacy) | ✅🔐 | 200 |

---

## 📚 Bookings

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| POST | `/bookings` | Create booking | ✅ | 201 |
| GET | `/bookings/my` | Get my bookings | ✅ | 200 |
| GET | `/bookings/:id` | Get booking details | ✅ | 200 |
| PUT | `/bookings/:id/deposit` | Pay deposit (Paystack) | ✅ | 200 |
| PUT | `/bookings/:id/balance` | Pay balance (Paystack) | ✅ | 200 |

---

## 📤 Upload

| Method | Endpoint | Description | Auth | Status |
|--------|----------|-------------|------|--------|
| POST | `/uploads` | Upload image | ✅ | 201 |

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | JWT Token Required |
| ❌ | Public (No Auth) |
| 🔐 | Admin Only |
| 201 | Created |
| 200 | Success |

---

## Common Query Parameters

| Endpoint | Parameter | Example |
|----------|-----------|---------|
| `/products` | `page` | `?page=1` |
| `/products` | `limit` | `?limit=10` |
| `/orders/my` | `status` | `?status=processing` |
| `/orders/admin` | `status` | `?status=pending` |

---

## Payment Methods

```json
"paymentMethod": "paystack" // or "transfer"
```

---

## Order Status Values

```
pending → processing → shipped → delivered → [END]
                    ↓
                 cancelled
```

---

## Response Format

**Success (200/201):**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Quick Integration Steps

1. **User Registration**
   ```
   POST /auth/register → Get JWT
   ```

2. **User Login**
   ```
   POST /auth/login → Get JWT
   ```

3. **Get Products**
   ```
   GET /products → Display products
   ```

4. **Create Order**
   ```
   POST /orders → Get order ID
   ```

5. **Initialize Payment**
   ```
   POST /payment/initialize → Get payment URL
   ```

6. **Verify Payment**
   ```
   GET /payment/verify/:reference → Update order
   ```

---

**Last Updated:** February 4, 2026  
**Version:** 2.0 - Production Ready ✅
