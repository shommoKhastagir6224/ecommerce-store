const jwt = require('jsonwebtoken');
const { findById } = require('../utils/db');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(401).json({ message: 'Not authorized, no token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await findById('users', decoded.id);
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ message: 'User not found or disabled' });
    }
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalid or expired' });
  }
};

const admin = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Admin access required' });
};

const staff = (req, res, next) => {
  if (['admin', 'staff'].includes(req.user?.role)) return next();
  res.status(403).json({ message: 'Staff access required' });
};

module.exports = { protect, admin, staff };
