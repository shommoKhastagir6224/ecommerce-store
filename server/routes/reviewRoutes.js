const express     = require('express');
const asyncHandler= require('express-async-handler');
const { protect } = require('../middleware/authMiddleware');
const { find, create, updateById, findById } = require('../utils/db');
const r = express.Router();

r.get('/:productId', asyncHandler(async (req, res) => {
  res.json(find('reviews', { productId: req.params.productId }));
}));
r.post('/', protect, asyncHandler(async (req, res) => {
  const review = create('reviews', { ...req.body, userId: req.user.id });
  res.status(201).json(review);
}));
module.exports = r;
