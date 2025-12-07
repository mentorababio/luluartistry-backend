# 📦 Complete Phase Implementation Roadmap

This document details **Phase 2 through Phase 6** implementations.

---

## 🏭 Phase 2: Category & Product Module

### Timeline: Week 3

### Objective
Implement product management system with admin-only restrictions, following the same OOP pattern as User module.

### Module Structure

```
src/modules/
├── category/
│   ├── controllers/
│   │   └── CategoryController.js
│   ├── dto/
│   │   ├── CategoryRequestDTO.js
│   │   └── CategoryResponseDTO.js
│   ├── interfaces/
│   │   └── ICategoryService.js
│   ├── repositories/
│   │   └── CategoryRepository.js
│   ├── routes/
│   │   └── categoryRoutes.js
│   └── services/
│       └── CategoryService.js
└── product/
    ├── controllers/
    │   └── ProductController.js
    ├── dto/
    │   ├── ProductRequestDTO.js
    │   └── ProductResponseDTO.js
    ├── interfaces/
    │   └── IProductService.js
    ├── repositories/
    │   └── ProductRepository.js
    ├── routes/
    │   └── productRoutes.js
    └── services/
        └── ProductService.js
```

### Key Features

**Categories:**
- CRUD operations (admin only)
- Slug generation
- Display ordering
- Active/inactive status

**Products:**
- CRUD operations (admin only)
- Category association
- Variant management (sizes, colors, etc.)
- Stock management
- Price comparison
- Featured products
- Search and filtering (public)
- Slug generation

### Important Rules

```
Admin Can:
✅ Create categories
✅ Create products
✅ Update products
✅ Delete products
✅ Manage stock
✅ Feature products

Public Can:
✅ View active categories
✅ View active products
✅ Search products
✅ Filter by category
✅ View featured products

Customers Can:
✅ All public permissions
❌ Cannot create/edit/delete products
```

### Database Schema Updates

```javascript
// Category Model
Category {
  _id: ObjectId,
  name: String (required, unique),
  slug: String (required, unique, auto-generated),
  description: String,
  image: { url, publicId },
  displayOrder: Number,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}

// Product Model (updated)
Product {
  _id: ObjectId,
  name: String (required),
  slug: String (required, unique),
  description: String (required),
  shortDescription: String,
  
  // Pricing
  price: Number (required, min: 0),
  comparePrice: Number,
  costPrice: Number,
  discount: Number (calculated or stored),
  
  // Category
  category: ObjectId (ref: Category, required),
  subcategory: String (optional),
  
  // Images
  images: [{
    url: String,
    publicId: String,
    alt: String,
    isPrimary: Boolean
  }],
  
  // Variants (for size, color, etc.)
  variants: [{
    name: String (e.g., "Size"),
    values: [{
      value: String (e.g., "Medium"),
      sku: String,
      stock: Number,
      priceAdjustment: Number
    }]
  }],
  
  // Stock Management
  stock: Number (total available),
  lowStockThreshold: Number,
  stockKeepingUnit: String (SKU),
  
  // Metadata
  tags: [String],
  isFeatured: Boolean (default: false),
  rating: Number,
  reviewCount: Number,
  
  // Admin
  isActive: Boolean (default: true),
  createdBy: ObjectId (ref: User),
  
  timestamps: true
}
```

### Sample Implementation Files

**CategoryRequestDTO.js:**

```javascript
const BaseDTO = require('../../../src/core/dto/BaseDTO');

class CategoryRequestDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.name = data.name;
    this.description = data.description;
    this.image = data.image;
    this.displayOrder = data.displayOrder || 0;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  validate() {
    this.validateRequired(['name']);
    this.sanitizeStrings(['name', 'description']);
    
    if (this.name.length < 2) {
      throw new Error('Category name must be at least 2 characters');
    }
  }
}

module.exports = CategoryRequestDTO;
```

**ProductRequestDTO.js:**

```javascript
const BaseDTO = require('../../../src/core/dto/BaseDTO');

class ProductRequestDTO extends BaseDTO {
  constructor(data = {}) {
    super();
    this.name = data.name;
    this.description = data.description;
    this.shortDescription = data.shortDescription;
    this.price = data.price;
    this.comparePrice = data.comparePrice;
    this.costPrice = data.costPrice;
    this.category = data.category;
    this.images = data.images || [];
    this.variants = data.variants || [];
    this.stock = data.stock || 0;
    this.lowStockThreshold = data.lowStockThreshold || 5;
    this.tags = data.tags || [];
    this.isFeatured = data.isFeatured || false;
  }

  validate() {
    this.validateRequired(['name', 'description', 'price', 'category', 'stock']);
    
    if (this.price < 0) {
      throw new Error('Price must be positive');
    }
    
    if (this.stock < 0) {
      throw new Error('Stock must be non-negative');
    }
  }
}

module.exports = ProductRequestDTO;
```

### Routes Structure

```javascript
// categoryRoutes.js
router.get('/', getCategoriesPublic); // Public
router.post('/', protect, authorize('admin'), createCategory); // Admin
router.get('/:id', getCategoryPublic); // Public
router.put('/:id', protect, authorize('admin'), updateCategory); // Admin
router.delete('/:id', protect, authorize('admin'), deleteCategory); // Admin

// productRoutes.js
router.get('/', getProductsPublic); // Public (filtered)
router.post('/', protect, authorize('admin'), createProduct); // Admin
router.get('/featured', getFeaturedProducts); // Public
router.get('/search', searchProducts); // Public
router.get('/:id', getProductPublic); // Public
router.put('/:id', protect, authorize('admin'), updateProduct); // Admin
router.delete('/:id', protect, authorize('admin'), deleteProduct); // Admin
```

### Testing Phase 2

**Seed Categories and Products:**

```javascript
// seed-products.js
const categories = [
  { name: 'Hair', description: 'Hair products' },
  { name: 'Skin Care', description: 'Skincare products' },
  { name: 'Makeup', description: 'Makeup products' }
];

const products = [
  {
    name: 'Premium Hair Serum',
    category: categoryId,
    price: 5000,
    stock: 50,
    isFeatured: true
  }
  // ... more products
];
```

### Verification Checklist

- [ ] Only admins can create categories
- [ ] Only admins can create products
- [ ] Public can view categories and products
- [ ] Public cannot see inactive items
- [ ] Product search works
- [ ] Featured products work
- [ ] Stock management works
- [ ] Slug generation works
- [ ] Category filtering works
- [ ] Admin-only routes properly protected

---

## 🛒 Phase 3: Cart & Order Module

### Timeline: Week 4

### Objective
Implement shopping cart and order management system.

### Module Structure

```
src/modules/
├── cart/
│   ├── controllers/
│   ├── dto/
│   ├── interfaces/
│   ├── repositories/
│   ├── routes/
│   └── services/
└── order/
    ├── controllers/
    ├── dto/
    ├── interfaces/
    ├── repositories/
    ├── routes/
    └── services/
```

### Database Schemas

```javascript
// Cart Model
Cart {
  _id: ObjectId,
  user: ObjectId (ref: User, required),
  items: [{
    product: ObjectId (ref: Product),
    variant: Object,
    quantity: Number,
    priceAtTime: Number,
    addedAt: Date
  }],
  coupon: ObjectId (ref: Coupon),
  discountAmount: Number (default: 0),
  subtotal: Number,
  tax: Number (calculated),
  total: Number (calculated),
  createdAt: Date,
  updatedAt: Date,
  expiresAt: Date (30 days after last update)
}

// Order Model
Order {
  _id: ObjectId,
  orderNumber: String (unique, auto-generated: ORD-TIMESTAMP),
  user: ObjectId (ref: User, required),
  
  // Items
  items: [{
    product: ObjectId (ref: Product),
    productName: String,
    quantity: Number,
    pricePerUnit: Number,
    subtotal: Number,
    variant: Object
  }],
  
  // Totals
  subtotal: Number,
  taxAmount: Number,
  discountAmount: Number,
  total: Number,
  
  // Shipping
  shippingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  shippingCost: Number,
  
  // Status Tracking
  orderStatus: String (enum: [pending, confirmed, processing, shipped, delivered, cancelled]),
  paymentStatus: String (enum: [pending, paid, failed, refunded]),
  
  // Payment Info
  paymentMethod: String (enum: [card, bank_transfer, paystack]),
  paymentRef: String (provider's reference),
  
  // Tracking
  trackingNumber: String,
  estimatedDelivery: Date,
  
  // Metadata
  notes: String,
  cancelReason: String,
  canceledAt: Date,
  canceledBy: ObjectId (ref: User),
  
  timestamps: true
}
```

### Key Features

**Cart:**
- Add/remove items
- Update quantities
- Apply coupons
- Automatic total calculation
- Cart expiry (30 days)
- Stock validation

**Orders:**
- Create from cart
- Order number generation
- Multiple payment methods
- Order status tracking
- Shipping address management
- Order history
- Cancel orders (before processing)

### Routes

```javascript
// cartRoutes.js
router.get('/', protect, getCart); // Get user's cart
router.post('/items', protect, addToCart);
router.put('/items/:productId', protect, updateCartItem);
router.delete('/items/:productId', protect, removeFromCart);
router.post('/coupon', protect, applyCoupon);
router.delete('/coupon', protect, removeCoupon);
router.post('/checkout', protect, createOrder); // Convert cart to order

// orderRoutes.js
router.get('/', protect, getUserOrders); // My orders
router.get('/:id', protect, getOrder); // Get single order
router.get('/admin/all', protect, authorize('admin'), getAllOrders);
router.put('/:id/status', protect, authorize('admin'), updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);
router.post('/:id/payment', protect, initiatePayment); // For transactions
```

### Order Status Flow

```
Customer Perspective:
pending → confirmed → processing → shipped → delivered

Admin Actions:
- Confirm order
- Mark as processing
- Add tracking number
- Mark as shipped
- Mark as delivered

Customer Actions:
- Can cancel if pending or confirmed
- Cannot cancel if processing or shipped
```

### Testing Phase 3

```javascript
// Seed test orders
const testOrders = [
  {
    user: customerId,
    items: [...],
    total: 15000,
    orderStatus: 'pending',
    paymentStatus: 'pending'
  },
  {
    user: customerId,
    items: [...],
    total: 8500,
    orderStatus: 'delivered',
    paymentStatus: 'paid'
  }
];
```

### Verification Checklist

- [ ] Can add items to cart
- [ ] Can remove items from cart
- [ ] Cart total calculates correctly
- [ ] Can apply coupons
- [ ] Can create order from cart
- [ ] Order number generates correctly
- [ ] Can view order history
- [ ] Admin can update order status
- [ ] Can cancel pending orders
- [ ] Stock is reserved when order created

---

## 💳 Phase 4: Transaction Module

### Timeline: Week 5

### Objective
Implement transaction tracking before payment processing. Uses **test command** (`try`) for DB entry without actual payment.

### Database Schema

```javascript
// Transaction Model
Transaction {
  _id: ObjectId,
  transactionId: String (unique, auto-generated),
  order: ObjectId (ref: Order, required),
  user: ObjectId (ref: User, required),
  
  // Amount
  amount: Number (required),
  currency: String (default: 'NGN'),
  
  // Payment Method
  paymentMethod: String (enum: [card, bank_transfer, ussd]),
  
  // Status
  status: String (enum: [initiated, processing, completed, failed, pending_confirmation]),
  
  // Provider Info
  provider: String (enum: [paystack, flutterwave, none]),
  providerTransactionRef: String,
  providerResponse: Object,
  
  // Metadata
  metadata: {
    orderNumber: String,
    customerEmail: String,
    customerPhone: String,
    description: String
  },
  
  // Test Mode
  isTestTransaction: Boolean (default: false),
  testCommand: String (e.g., 'try'),
  
  // Attempts
  attempts: Number (default: 0),
  lastAttempt: Date,
  
  timestamps: true
}
```

### Module Structure

```
src/modules/transaction/
├── controllers/
│   └── TransactionController.js
├── dto/
│   ├── TransactionRequestDTO.js
│   └── TransactionResponseDTO.js
├── interfaces/
│   └── ITransactionService.js
├── repositories/
│   └── TransactionRepository.js
├── routes/
│   └── transactionRoutes.js
└── services/
    └── TransactionService.js
```

### Special Feature: Test Command

**Purpose**: Create transaction entries in DB without processing actual payment.

```javascript
// POST /api/transactions/try
// Request Body:
{
  orderId: "65f8a3b2c9d1e4f5g6h7i8j9",
  amount: 15000,
  paymentMethod: "card",
  description: "Test transaction for order verification"
}

// Response:
{
  success: true,
  message: "Test transaction created successfully",
  data: {
    id: "txn_65f8a3b2c9d1e4f5g6h7i8j9",
    status: "pending_confirmation",
    isTestTransaction: true,
    testCommand: "try",
    amount: 15000,
    createdAt: "2025-01-15T10:30:00Z"
  }
}
```

### Routes

```javascript
// transactionRoutes.js
router.post('/try', protect, createTestTransaction); // Test command
router.post('/initiate', protect, initiateTransaction); // Actual payment
router.get('/:id', protect, getTransaction);
router.get('/', protect, getUserTransactions);
router.get('/admin/all', protect, authorize('admin'), getAllTransactions);
router.put('/:id/confirm', protect, authorize('admin'), confirmTransaction); // Admin confirm test
router.put('/:id/retry', protect, retryTransaction); // Retry failed transaction
```

### Service Logic

```javascript
class TransactionService {
  async createTestTransaction(transactionDTO, userId) {
    // 1. Validate order exists and belongs to user
    // 2. Validate amount
    // 3. Create transaction with:
    //    - status: "pending_confirmation"
    //    - isTestTransaction: true
    //    - testCommand: "try"
    // 4. Return transaction
    
    // NO actual payment processing
  }

  async confirmTestTransaction(transactionId) {
    // 1. Get transaction
    // 2. Verify it's a test transaction
    // 3. Update status to "completed"
    // 4. Update associated order payment status
    // 5. Return confirmed transaction
  }

  async initiateTransaction(transactionDTO, userId) {
    // 1. Validate order and amount
    // 2. Create transaction record
    // 3. Call payment provider API
    // 4. Return transaction
  }
}
```

### Testing Phase 4

```javascript
// Manual test flow:
1. Create order
2. POST /api/transactions/try (creates test transaction)
3. Check DB - transaction should exist with status "pending_confirmation"
4. Admin confirms transaction: PUT /api/transactions/:id/confirm
5. Check order - payment status should be "paid"
6. Verify in Postman or tests

// Seed test transactions
const testTransactions = [
  {
    order: orderId,
    user: userId,
    amount: 15000,
    status: 'completed',
    isTestTransaction: true
  },
  {
    order: orderId,
    user: userId,
    amount: 8500,
    status: 'failed',
    isTestTransaction: true
  }
];
```

### Verification Checklist

- [ ] Can create test transaction with `try` command
- [ ] Test transaction appears in DB
- [ ] Test transaction status is "pending_confirmation"
- [ ] Admin can confirm test transaction
- [ ] Order payment status updates when transaction confirmed
- [ ] Can view transaction history
- [ ] Can retry failed transactions
- [ ] Attempt counter works
- [ ] Metadata stored correctly

---

## 💰 Phase 5: Payment Module

### Timeline: Week 6

### Objective
Implement actual payment processing with provider integration (Paystack, Flutterwave).

### Database Schema

```javascript
// Payment Model
Payment {
  _id: ObjectId,
  transaction: ObjectId (ref: Transaction, required),
  order: ObjectId (ref: Order, required),
  user: ObjectId (ref: User, required),
  
  // Payment Details
  amount: Number,
  currency: String (default: 'NGN'),
  
  // Provider Integration
  provider: String (enum: [paystack, flutterwave]),
  reference: String (provider's unique reference),
  accessCode: String,
  authorizationUrl: String,
  
  // Status
  status: String (enum: [pending, success, failed, abandoned]),
  
  // Provider Response
  providerResponse: {
    authorization: Object,
    customer: Object,
    plan: Object
  },
  
  // Retry Info
  retries: Number (default: 0),
  lastRetryAt: Date,
  
  // Verification
  verifiedAt: Date,
  verificationDetails: Object,
  
  timestamps: true
}
```

### Module Structure

```
src/modules/payment/
├── controllers/
│   └── PaymentController.js
├── dto/
│   ├── PaymentRequestDTO.js
│   └── PaymentResponseDTO.js
├── interfaces/
│   └── IPaymentService.js
├── repositories/
│   └── PaymentRepository.js
├── routes/
│   └── paymentRoutes.js
├── services/
│   ├── PaymentService.js
│   └── providers/
│       ├── PaystackProvider.js
│       ├── FlutterwaveProvider.js
│       └── IPaymentProvider.js
└── webhooks/
    ├── paystackWebhook.js
    └── flutterwaveWebhook.js
```

### Routes

```javascript
// paymentRoutes.js
router.post('/initialize', protect, initializePayment); // Start payment
router.get('/verify/:reference', verifyPayment); // Webhook verification
router.post('/webhook/paystack', paystackWebhook); // Paystack webhook
router.post('/webhook/flutterwave', flutterwaveWebhook); // Flutterwave webhook
router.post('/retry/:paymentId', protect, retryPayment);
router.post('/refund', protect, authorize('admin'), processRefund);
```

### Payment Flow

```
1. Customer initiates payment (POST /api/payments/initialize)
   ↓
2. Service creates Payment record
   ↓
3. Calls payment provider API (Paystack, Flutterwave)
   ↓
4. Returns authorization URL
   ↓
5. Customer redirected to provider
   ↓
6. Customer completes payment
   ↓
7. Provider sends webhook to backend
   ↓
8. Backend verifies payment
   ↓
9. Update Payment status to "success"
   ↓
10. Update Order payment status to "paid"
    ↓
11. Update Transaction status to "completed"
    ↓
12. Return success response
```

### Provider Integration Example (Paystack)

```javascript
// services/providers/PaystackProvider.js
class PaystackProvider {
  constructor(secretKey) {
    this.secretKey = secretKey;
    this.baseUrl = 'https://api.paystack.co';
  }

  async initializePayment(paymentData) {
    const response = await axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email: paymentData.email,
        amount: paymentData.amount * 100, // Convert to kobo
        reference: paymentData.reference,
        metadata: paymentData.metadata
      },
      {
        headers: { Authorization: `Bearer ${this.secretKey}` }
      }
    );

    return {
      reference: response.data.data.reference,
      authorizationUrl: response.data.data.authorization_url,
      accessCode: response.data.data.access_code
    };
  }

  async verifyPayment(reference) {
    const response = await axios.get(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${this.secretKey}` }
      }
    );

    return {
      status: response.data.data.status === 'success' ? 'success' : 'failed',
      data: response.data.data
    };
  }
}
```

### Webhook Handling

```javascript
// webhooks/paystackWebhook.js
async function handlePaystackWebhook(req, res) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).json({ success: false });
  }

  const event = req.body;

  if (event.event === 'charge.success') {
    // Update payment record
    // Update order
    // Update transaction
  }

  res.status(200).json({ success: true });
}
```

### Testing Phase 5

```javascript
// Use Paystack/Flutterwave test cards
- Card: 4084084084084081
- CVV: 408
- Exp: Any future date

// Test flow:
1. Create order
2. Create transaction
3. Initialize payment
4. Redirect to provider test page
5. Use test card
6. Webhook should update everything
```

---

## 🎯 Implementation Summary

### Total Timeline: 6 Weeks

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 0 | Week 1 | Foundation (Base classes, DTOs, Errors) ✅ |
| Phase 1 | Week 2 | User Module (Auth, Profile) |
| Phase 2 | Week 3 | Products & Categories (Admin) |
| Phase 3 | Week 4 | Cart & Orders |
| Phase 4 | Week 5 | Transactions (Test mode support) |
| Phase 5 | Week 6 | Payments (Actual integration) |

### Database Collections

```
Database: luluartistry
├── users
├── categories
├── products
├── carts
├── orders
├── transactions
├── payments
├── coupons (existing)
├── bookings (existing)
└── reviews (existing)
```

### Key Principles Throughout

✅ **DTOs** for all request/response
✅ **Repositories** for all data access
✅ **Services** for business logic
✅ **Controllers** for HTTP handling
✅ **Interfaces** for contracts
✅ **Error Classes** for consistent errors
✅ **Admin-only** restrictions enforced
✅ **Test support** in Phase 4
✅ **Actual payment** in Phase 5

### Success Criteria

- [ ] All phases implemented
- [ ] All CRUD operations working
- [ ] Admin restrictions enforced
- [ ] Test transactions working
- [ ] Payment integration complete
- [ ] Error handling consistent
- [ ] Response format standardized
- [ ] All endpoints documented
- [ ] 100+ integration tests passing

