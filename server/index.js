const express  = require('express');
const cors     = require('cors');
const morgan   = require('morgan');
const dotenv   = require('dotenv');
const path     = require('path');

dotenv.config();

// Init Firebase first
const { connectDB } = require('./config/database');
connectDB();

const authRoutes      = require('./routes/authRoutes');
const productRoutes   = require('./routes/productRoutes');
const categoryRoutes  = require('./routes/categoryRoutes');
const orderRoutes     = require('./routes/orderRoutes');
const userRoutes      = require('./routes/userRoutes');
const reviewRoutes    = require('./routes/reviewRoutes');
const uploadRoutes    = require('./routes/uploadRoutes');
const couponRoutes    = require('./routes/couponRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const paymentRoutes   = require('./routes/paymentRoutes');
const bannerRoutes    = require('./routes/bannerRoutes');
const wishlistRoutes  = require('./routes/wishlistRoutes');
const cartRoutes      = require('./routes/cartRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/users',      userRoutes);
app.use('/api/reviews',    reviewRoutes);
app.use('/api/upload',     uploadRoutes);
app.use('/api/coupons',    couponRoutes);
app.use('/api/dashboard',  dashboardRoutes);
app.use('/api/payment',    paymentRoutes);
app.use('/api/banners',    bannerRoutes);
app.use('/api/wishlist',   wishlistRoutes);
app.use('/api/cart',       cartRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) =>
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'))
  );
} else {
  app.get('/', (req, res) => res.json({ message: '🛒 Shommo Store API (Firebase)' }));
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
module.exports = app;
