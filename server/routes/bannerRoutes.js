const express     = require('express');
const asyncHandler= require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');
const { find, create, updateById, deleteById, findById } = require('../utils/db');
const r = express.Router();

r.get('/', asyncHandler(async (req, res) => {
  const banners = find('banners', { isActive: 1 }, { orderBy: 'order_', orderDir: 'asc' });
  res.json(banners);
}));
r.post('/', protect, admin, asyncHandler(async (req, res) => {
  const banner = create('banners', { ...req.body, isActive: 1 });
  res.status(201).json(banner);
}));
r.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const banner = updateById('banners', req.params.id, req.body);
  res.json(banner);
}));
r.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  deleteById('banners', req.params.id);
  res.json({ message: 'Banner removed' });
}));
module.exports = r;
