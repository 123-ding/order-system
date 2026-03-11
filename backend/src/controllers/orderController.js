const { validationResult } = require('express-validator');
const Order = require('../models/Order');

exports.createOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const data = { ...req.body, customer_id: req.user.id };
    const order = await Order.create(data);
    const created = await Order.findById(order.id);
    res.status(201).json({ success: true, message: 'Order created', data: { order: created } });
  } catch (err) {
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = { page, limit, status, search };
    if (req.user.role === 'customer') filter.customer_id = req.user.id;
    const result = await Order.findAll(filter);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (req.user.role === 'customer' && order.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, data: { order } });
  } catch (err) {
    next(err);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (req.user.role === 'customer') {
      if (order.customer_id !== req.user.id) return res.status(403).json({ success: false, message: 'Access denied' });
      if (order.status !== 'pending') return res.status(400).json({ success: false, message: 'Can only edit pending orders' });
    }

    await Order.update(req.params.id, req.body);
    const updated = await Order.findById(req.params.id);
    res.json({ success: true, message: 'Order updated', data: { order: updated } });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'loading', 'in_transit', 'arrived', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    await Order.updateStatus(req.params.id, status);
    res.json({ success: true, message: 'Order status updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    await Order.delete(req.params.id);
    res.json({ success: true, message: 'Order deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getOrderStats = async (req, res, next) => {
  try {
    const customer_id = req.user.role === 'customer' ? req.user.id : null;
    const stats = await Order.getStats(customer_id);
    res.json({ success: true, data: { stats } });
  } catch (err) {
    next(err);
  }
};
