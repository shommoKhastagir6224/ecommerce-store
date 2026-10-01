const asyncHandler = require('express-async-handler');
const { findById, find, create, updateById } = require('../utils/db');

const genOrderNumber = () => 'SS-' + Date.now().toString(36).toUpperCase();

// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, coupon, subtotal, deliveryCharge, discount, total } = req.body;
  if (!items?.length) return res.status(400).json({ message: 'No items in order' });

  for (const item of items) {
    const product = findById('products', item.product);
    if (!product || product.stock < item.qty) {
      return res.status(400).json({ message: `${item.name} is out of stock` });
    }
  }

  const order = create('orders', {
    orderNumber: genOrderNumber(),
    userId: req.user.id,
    items, shippingAddress, paymentMethod,
    coupon: coupon || null,
    subtotal, deliveryCharge, discount, total,
    orderStatus: 'pending',
    paymentStatus: 'unpaid',
    tracking: [{ status: 'pending', message: 'Order placed successfully', time: new Date().toISOString() }],
  });

  // Decrease stock
  for (const item of items) {
    const product = findById('products', item.product);
    if (product) {
      updateById('products', item.product, {
        stock: (product.stock || 0) - item.qty,
        sold: (product.sold || 0) + item.qty,
      });
    }
  }

  res.status(201).json(order);
});

// GET /api/orders/my
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const all = find('orders', { userId: req.user.id });
  const total = all.length;
  const pageNum = Number(page), limitNum = Number(limit);
  const orders = all.slice((pageNum - 1) * limitNum, pageNum * limitNum);
  res.json({ orders, total, pages: Math.ceil(total / limitNum) });
});

// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = findById('orders', req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.userId !== req.user.id && req.user.role === 'user') {
    return res.status(403).json({ message: 'Not authorized' });
  }
  res.json(order);
});

// GET /api/orders (admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filters = status && status !== 'all' ? { orderStatus: status } : {};
  const all = find('orders', filters);
  const total = all.length;
  const pageNum = Number(page), limitNum = Number(limit);
  const orders = all.slice((pageNum - 1) * limitNum, pageNum * limitNum);
  res.json({ orders, total, pages: Math.ceil(total / limitNum) });
});

// PUT /api/orders/:id/status (admin/staff)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message } = req.body;
  const order = findById('orders', req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });

  const tracking = [...(order.tracking || []), {
    status, message: message || `Order status updated to ${status}`,
    time: new Date().toISOString(),
  }];
  const update = { orderStatus: status, tracking };
  if (status === 'delivered') { update.deliveredAt = new Date().toISOString(); update.paymentStatus = 'paid'; }
  if (status === 'cancelled') { update.cancelledAt = new Date().toISOString(); update.cancelReason = message; }

  const updated = updateById('orders', req.params.id, update);
  res.json(updated);
});

// PUT /api/orders/:id/assign (admin)
const assignStaff = asyncHandler(async (req, res) => {
  const order = findById('orders', req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const updated = updateById('orders', req.params.id, {
    assignedStaffId: req.body.staffId,
    orderStatus: 'shipped',
    tracking: [...(order.tracking || []), { status: 'shipped', message: 'Assigned to delivery staff', time: new Date().toISOString() }],
  });
  res.json(updated);
});

// GET /api/orders/staff (staff)
const getStaffOrders = asyncHandler(async (req, res) => {
  const orders = find('orders', { assignedStaffId: req.user.id });
  res.json(orders);
});

// PUT /api/orders/:id/pay
const markAsPaid = asyncHandler(async (req, res) => {
  const order = updateById('orders', req.params.id, { paymentStatus: 'paid', paymentResult: req.body });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json(order);
});

module.exports = {
  createOrder, getMyOrders, getOrderById, getAllOrders,
  updateOrderStatus, assignStaff, getStaffOrders, markAsPaid,
};
