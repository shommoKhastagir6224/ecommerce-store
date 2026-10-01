const express     = require('express');
const asyncHandler= require('express-async-handler');
const { protect, admin } = require('../middleware/authMiddleware');
const { find, create, updateById } = require('../utils/db');
const r = express.Router();

r.get('/', asyncHandler(async (req, res) => {
  const cats = find('categories', { isActive: 1 }, { orderBy: 'createdAt', orderDir: 'asc' });
  res.json(cats);
}));
r.post('/', protect, admin, asyncHandler(async (req, res) => {
  const slug = req.body.name.toLowerCase().replace(/[^a-z0-9]+/g,'-');
  const cat  = create('categories', { ...req.body, slug, isActive: 1 });
  res.status(201).json(cat);
}));
r.put('/:id', protect, admin, asyncHandler(async (req, res) => {
  const cat = updateById('categories', req.params.id, req.body);
  res.json(cat);
}));
r.delete('/:id', protect, admin, asyncHandler(async (req, res) => {
  updateById('categories', req.params.id, { isActive: 0 });
  res.json({ message: 'Category removed' });
}));
module.exports = r;
