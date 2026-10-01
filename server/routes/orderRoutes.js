const express = require('express');
const { protect, admin, staff } = require('../middleware/authMiddleware');
const {
  createOrder, getMyOrders, getOrderById, getAllOrders,
  updateOrderStatus, assignStaff, getStaffOrders, markAsPaid,
} = require('../controllers/orderController');
const r = express.Router();
r.post('/',           protect, createOrder);
r.get('/my',          protect, getMyOrders);
r.get('/staff',       protect, staff, getStaffOrders);
r.get('/',            protect, admin, getAllOrders);
r.get('/:id',         protect, getOrderById);
r.put('/:id/status',  protect, staff, updateOrderStatus);
r.put('/:id/assign',  protect, admin, assignStaff);
r.put('/:id/pay',     protect, markAsPaid);
module.exports = r;
