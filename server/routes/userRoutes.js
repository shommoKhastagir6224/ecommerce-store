const express     = require('express');
const asyncHandler= require('express-async-handler');
const bcrypt      = require('bcryptjs');
const { protect, admin } = require('../middleware/authMiddleware');
const { find, findById, updateById } = require('../utils/db');
const r = express.Router();

r.get('/', protect, admin, asyncHandler(async (req, res) => {
  const users = find('users', {}).map(u => { const { password, ...safe } = u; return safe; });
  res.json(users.filter(u => u.role !== 'admin'));
}));
r.get('/staff', protect, admin, asyncHandler(async (req, res) => {
  const users = find('users', { role: 'staff' }).map(u => { const { password, ...safe } = u; return safe; });
  res.json(users);
}));
r.put('/profile', protect, asyncHandler(async (req, res) => {
  const update = {};
  if (req.body.name)   update.name   = req.body.name;
  if (req.body.phone)  update.phone  = req.body.phone;
  if (req.body.avatar) update.avatar = req.body.avatar;
  if (req.body.password) update.password = await bcrypt.hash(req.body.password, 10);
  const user = updateById('users', req.user.id, update);
  const { password, ...safe } = user;
  res.json(safe);
}));
r.put('/address', protect, asyncHandler(async (req, res) => {
  updateById('users', req.user.id, { addresses: req.body.addresses });
  res.json(req.body.addresses);
}));
r.put('/:id/role', protect, admin, asyncHandler(async (req, res) => {
  const user = updateById('users', req.params.id, { role: req.body.role });
  const { password, ...safe } = user;
  res.json(safe);
}));
r.put('/:id/toggle', protect, admin, asyncHandler(async (req, res) => {
  const user = findById('users', req.params.id);
  const updated = updateById('users', req.params.id, { isActive: user.isActive ? 0 : 1 });
  res.json({ isActive: updated.isActive });
}));
module.exports = r;
