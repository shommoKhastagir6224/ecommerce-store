const express     = require('express');
const asyncHandler= require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');
const { countDocuments, find } = require('../utils/db');
const r = express.Router();

r.get('/stats', protect, admin, asyncHandler(async (req, res) => {
  const totalUsers    = countDocuments('users', {});
  const totalOrders   = countDocuments('orders', {});
  const totalProducts = countDocuments('products', {});
  const orders = find('orders', {});
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
  res.json({ totalUsers, totalOrders, totalProducts, totalRevenue });
}));
module.exports = r;
