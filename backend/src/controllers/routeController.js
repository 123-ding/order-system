const { validationResult } = require('express-validator');
const Route = require('../models/Route');

exports.createRoute = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const route = await Route.create(req.body);
    const created = await Route.findById(route.id);
    res.status(201).json({ success: true, message: 'Route created', data: { route: created } });
  } catch (err) {
    next(err);
  }
};

exports.getRoutes = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const result = await Route.findAll({ page, limit, status, search });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getRouteById = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    res.json({ success: true, data: { route } });
  } catch (err) {
    next(err);
  }
};

exports.updateRoute = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });

    await Route.update(req.params.id, req.body);
    const updated = await Route.findById(req.params.id);
    res.json({ success: true, message: 'Route updated', data: { route: updated } });
  } catch (err) {
    next(err);
  }
};

exports.deleteRoute = async (req, res, next) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    await Route.delete(req.params.id);
    res.json({ success: true, message: 'Route deleted' });
  } catch (err) {
    next(err);
  }
};

exports.calculateFreight = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { route_id, weight } = req.body;
    const route = await Route.findById(route_id);
    if (!route) return res.status(404).json({ success: false, message: 'Route not found' });
    if (!route.freight_rate_per_ton) return res.status(400).json({ success: false, message: 'Route has no freight rate configured' });

    const estimated_cost = parseFloat((route.freight_rate_per_ton * weight).toFixed(2));
    res.json({
      success: true,
      data: {
        route_id,
        route_name: route.route_name,
        weight_tons: weight,
        freight_rate_per_ton: route.freight_rate_per_ton,
        estimated_cost,
        currency: 'USD',
      },
    });
  } catch (err) {
    next(err);
  }
};
