const { validationResult } = require('express-validator');
const Cargo = require('../models/Cargo');
const Order = require('../models/Order');

exports.createCargo = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { order_id } = req.body;
    const order = await Order.findById(order_id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (req.user.role === 'customer' && order.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const cargo = await Cargo.create(req.body);
    const created = await Cargo.findById(cargo.id);
    res.status(201).json({ success: true, message: 'Cargo created', data: { cargo: created } });
  } catch (err) {
    next(err);
  }
};

exports.getCargo = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const result = await Cargo.findAll({ page, limit, status, search });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getCargoById = async (req, res, next) => {
  try {
    const cargo = await Cargo.findById(req.params.id);
    if (!cargo) return res.status(404).json({ success: false, message: 'Cargo not found' });
    res.json({ success: true, data: { cargo } });
  } catch (err) {
    next(err);
  }
};

exports.getCargoByOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (req.user.role === 'customer' && order.customer_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const cargo = await Cargo.findByOrderId(orderId);
    res.json({ success: true, data: { cargo } });
  } catch (err) {
    next(err);
  }
};

exports.updateCargo = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const cargo = await Cargo.findById(req.params.id);
    if (!cargo) return res.status(404).json({ success: false, message: 'Cargo not found' });

    await Cargo.update(req.params.id, req.body);
    const updated = await Cargo.findById(req.params.id);
    res.json({ success: true, message: 'Cargo updated', data: { cargo: updated } });
  } catch (err) {
    next(err);
  }
};

exports.updateCargoStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'loaded', 'in_transit', 'unloaded', 'delivered'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const cargo = await Cargo.findById(req.params.id);
    if (!cargo) return res.status(404).json({ success: false, message: 'Cargo not found' });

    await Cargo.updateStatus(req.params.id, status);
    res.json({ success: true, message: 'Cargo status updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteCargo = async (req, res, next) => {
  try {
    const cargo = await Cargo.findById(req.params.id);
    if (!cargo) return res.status(404).json({ success: false, message: 'Cargo not found' });
    await Cargo.delete(req.params.id);
    res.json({ success: true, message: 'Cargo deleted' });
  } catch (err) {
    next(err);
  }
};
