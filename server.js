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
 
// Validate environment variables
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
const userRoutes = require('./routes/userRoutes');
 
// Middleware
const errorHandler = require('./middleware/errorHandler');
const responseMiddleware = require('./middleware/response');
const requestLogger = require('./middleware/requestLogger');
 
// Initialize app
const app = express();
 
// ─── 1. CORS — Explicitly allow Authorization header ─────────────────────────
const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    'https://luluartistry.store',
    'https://www.luluartistry.store',
    'https://luluartistry-ltd.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'], // FIX: Explicitly allow Authorization header
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
 
// ─── 2. Security middleware ──────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
 
// ─── 3. Body parsers ─────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
 
// ─── 4. Logging & utility middleware ────────────────────────────────────────
app.use(requestLogger);
app.use(responseMiddleware);
 
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
 
// ─── 5. Rate limiting ────────────────────────────────────────────────────────
app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);
 
// ─── 6. Mount all routes ─────────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.originalUrl.includes('/api/orders')) {
    console.log(`[DEBUG] Orders Request: ${req.method} ${req.originalUrl}`);
  }
  next();
});

app.use('/uploads', require('./routes/uploadRoutes'));
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
 
// ─── 7. Health check & root routes ──────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Lulu Artistry API is running' });
});
 
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to Lulu Artistry API' });
});
 
// ─── 8. Error handler ────────────────────────────────────────────────────────
app.use(errorHandler);
 
// ─── Server startup ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});