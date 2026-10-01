const express     = require('express');
const asyncHandler= require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');
const { find, findOne, create, updateById, deleteById } = require('../utils/db');
const r = express.Router();

r.get('/', protect, admin, asyncHandler(async (req, res) => {
  res.json(find('coupons', {}));
}));
r.post('/', protect, admin, asyncHandler(async (req, res) => {
  const coupon = create('coupons', { ...req.body, isActive: 1, usedCount: 0 });
  res.status(201).json(coupon);
}));
r.post('/validate', protect, asyncHandler(async (req, res) => {
  const coupon = findOne('coupons', { code: req.body.code });
  if (!coupon || !coupon.isActive) return res.status(400).json({ message: 'Invalid coupon' });
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return res.status(400).json({ message: 'Coupon expired' });
  res.json(coupon);
}));
r.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  res.json(updateById('coupons', req.params.id, req.body));
}));
r.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  deleteById('coupons', req.params.id);
  res.json({ message: 'Coupon removed' });
}));
module.exports = r;
