const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const crypto = require('crypto');
const { findOne, create, updateById } = require('../utils/db');
const { sendEmail } = require('../utils/sendEmail');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '30d' });

// POST /api/auth/register
const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ message: 'Please fill all required fields' });

  const exists = await findOne('users', { email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const hashed = await bcrypt.hash(password, 10);
  const user = await create('users', {
    name, email, password: hashed, phone: phone || '',
    role: 'user', isActive: true, avatar: '', wishlist: [], addresses: [],
  });

  res.status(201).json({
    _id: user.id, name: user.name, email: user.email,
    role: user.role, avatar: user.avatar, token: generateToken(user.id),
  });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await findOne('users', { email });
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });
  if (!user.isActive) return res.status(403).json({ message: 'Account disabled' });

  const match = await bcrypt.compare(password, user.password || '');
  if (!match) return res.status(401).json({ message: 'Invalid email or password' });

  res.json({
    _id: user.id, name: user.name, email: user.email,
    role: user.role, avatar: user.avatar, phone: user.phone,
    token: generateToken(user.id),
  });
});

// POST /api/auth/google
const googleAuth = asyncHandler(async (req, res) => {
  const { name, email, avatar, firebaseUID } = req.body;
  let user = await findOne('users', { email });
  if (!user) {
    user = await create('users', {
      name, email, avatar: avatar || '', firebaseUID: firebaseUID || '',
      role: 'user', isActive: true, password: '', phone: '', wishlist: [], addresses: [],
    });
  } else {
    user = await updateById('users', user.id, {
      firebaseUID: firebaseUID || user.firebaseUID,
      avatar: avatar || user.avatar,
    });
  }
  res.json({
    _id: user.id, name: user.name, email: user.email,
    role: user.role, avatar: user.avatar, token: generateToken(user.id),
  });
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const user = await findOne('users', { email: req.body.email });
  if (!user) return res.status(404).json({ message: 'No user with that email' });

  const token  = crypto.randomBytes(32).toString('hex');
  const hashed = crypto.createHash('sha256').update(token).digest('hex');
  await updateById('users', user.id, {
    resetPasswordToken:  hashed,
    resetPasswordExpire: Date.now() + 10 * 60 * 1000,
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
  try {
    await sendEmail({
      to: user.email, subject: 'Shommo Store – Password Reset',
      html: `<p>Hi ${user.name},</p><p>Reset your password (valid 10 min):</p><a href="${resetUrl}">${resetUrl}</a>`,
    });
    res.json({ message: 'Password reset email sent' });
  } catch {
    await updateById('users', user.id, { resetPasswordToken: null, resetPasswordExpire: null });
    res.status(500).json({ message: 'Email could not be sent' });
  }
});

// PUT /api/auth/reset-password/:token
const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const { findOne } = require('../utils/db');
  const user = findOne('users', { resetPasswordToken: hashed });
  if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
  if (user.resetPasswordExpire < Date.now())
    return res.status(400).json({ message: 'Token expired' });

  const newHashed = await bcrypt.hash(req.body.password, 10);
  await updateById('users', user.id, {
    password: newHashed, resetPasswordToken: null, resetPasswordExpire: null,
  });
  res.json({ message: 'Password reset successful', token: generateToken(user.id) });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const { password, ...user } = req.user;
  res.json(user);
});

module.exports = { register, login, googleAuth, forgotPassword, resetPassword, getMe };
