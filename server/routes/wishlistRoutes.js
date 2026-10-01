const express     = require('express');
const asyncHandler= require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { findOne, create, updateById } = require('../utils/db');
const r = express.Router();

r.get('/', protect, asyncHandler(async (req, res) => {
  const wl = findOne('wishlists', { userId: req.user.id });
  res.json(wl ? (wl.products || []) : []);
}));
r.post('/', protect, asyncHandler(async (req, res) => {
  let wl = findOne('wishlists', { userId: req.user.id });
  const products = wl ? (wl.products || []) : [];
  const idx = products.indexOf(req.body.productId);
  if (idx > -1) products.splice(idx, 1);
  else products.push(req.body.productId);
  if (wl) updateById('wishlists', wl.id, { products });
  else create('wishlists', { userId: req.user.id, products });
  res.json(products);
}));
module.exports = r;
