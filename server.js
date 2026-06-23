const dns = require('node:dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path'); // Added for path handling

// Load env vars
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
const settingsRoutes = require('./routes/settingsRoutes'); // NEW: Settings routes
const serviceRoutes = require('./routes/serviceRoutes');

// Middleware
const errorHandler = require('./middleware/errorHandler');
const responseMiddleware = require('./middleware/response');
const requestLogger = require('./middleware/requestLogger');

// Initialize app
const app = express();

// ─── 1. CORS ─────────────────────────────────────────────────────────────────
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
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// ─── 2. Security & Parsers ───────────────────────────────────────────────────
app.use(helmet());
app.use(mongoSanitize());
app.use(xss());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve static files (Assuming your uploads folder is in the root)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── 3. Logging & Utility ────────────────────────────────────────────────────
app.use(requestLogger);
app.use(responseMiddleware);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── 4. Rate limiting ────────────────────────────────────────────────────────
app.set('trust proxy', 1);
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// ─── 5. Mount Routes ────────────────────────────────────────────────────────
app.use('/uploads', require('./routes/uploadRoutes'));
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/settings', settingsRoutes); // NEW: Mount settings
app.use('/api/services', serviceRoutes);

// ─── 6. Health check & Root ──────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Lulu Artistry API is running' });
});

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Welcome to Lulu Artistry API' });
});

// ─── 7. Error handler ────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Server startup ──────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});