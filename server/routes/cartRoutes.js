const express     = require('express');
const asyncHandler= require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { findOne, create, updateById } = require('../utils/db');
const r = express.Router();

r.get('/', protect, asyncHandler(async (req, res) => {
  const cart = findOne('carts', { userId: req.user.id });
  res.json(cart ? (cart.items || []) : []);
}));
r.post('/', protect, asyncHandler(async (req, res) => {
  let cart = findOne('carts', { userId: req.user.id });
  if (cart) updateById('carts', cart.id, { items: req.body.items });
  else create('carts', { userId: req.user.id, items: req.body.items });
  res.json(req.body.items);
}));
r.delete('/', protect, asyncHandler(async (req, res) => {
  const cart = findOne('carts', { userId: req.user.id });
  if (cart) updateById('carts', cart.id, { items: [] });
  res.json([]);
}));
module.exports = r;
