const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

// Load env vars FIRST
dotenv.config();

// Validate environment variables AFTER loading them
const validateEnv = require('./utils/validateEnv');
validateEnv();

// Connect to database
const connectDB = require('./config/db');
connectDB();

// Route files 
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const responseMiddleware = require('./middleware/response');
const requestLogger = require('./middleware/requestLogger');

// Initialize app
const app = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Request logging middleware (logs all requests)
app.use(requestLogger);

// Response middleware (adds res.apiSuccess, res.apiError, res.apiPaginated)
app.use(responseMiddleware);

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Security middleware
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});
app.use('/api/', limiter);

// CORS configuration
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL || 'https://luluartistry.vercel.app',
    'https://luluartistry.vercel.app',
    'http://localhost:3000',  // For local development
    'http://localhost:3001'   // If you run admin on different port
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/bookings', bookingRoutes);

// ADD THIS RIGHT AFTER app.use('/api/bookings', bookingRoutes);

// Test route for payment debugging
app.get('/api/payment/debug', (req, res) => {
  res.json({
    success: true,
    message: 'Direct payment route works!',
    timestamp: new Date().toISOString()
  });
});

// Health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Lulu Artistry API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Lulu Artistry API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories',
      orders: '/api/orders',
      bookings: '/api/bookings'
    }
  });
});

// Error handler (must be last middleware)
app.use(errorHandler);



const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
    ╔════════════════════════════════════════╗
    ║   Lulu Artistry Backend Server         ║
    ║   Running in ${process.env.NODE_ENV || 'development'} mode           ║
    ║   Port: ${PORT}                            ║
    ║   Time: ${new Date().toLocaleString()}   ║
    ╚════════════════════════════════════════╝
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
