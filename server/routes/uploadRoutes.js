const express = require('express');
const { protect, admin } = require('../middleware/authMiddleware');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('express-async-handler');
const r = express.Router();
r.post('/', protect, admin, asyncHandler(async (req, res) => {
  const { image } = req.body;
  if (!image) return res.status(400).json({ message: 'No image provided' });
  const result = await cloudinary.uploader.upload(image, { folder: 'shommo-store' });
  res.json({ url: result.secure_url, public_id: result.public_id });
}));
r.delete('/:public_id', protect, admin, asyncHandler(async (req, res) => {
  await cloudinary.uploader.destroy(req.params.public_id);
  res.json({ message: 'Image deleted' });
}));
module.exports = r;
