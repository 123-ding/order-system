const { validationResult } = require('express-validator');
const Vessel = require('../models/Vessel');

exports.createVessel = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const vessel = await Vessel.create(req.body);
    const created = await Vessel.findById(vessel.id);
    res.status(201).json({ success: true, message: 'Vessel created', data: { vessel: created } });
  } catch (err) {
    next(err);
  }
};

exports.getVessels = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, vessel_type, search } = req.query;
    const result = await Vessel.findAll({ page, limit, status, vessel_type, search });
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.getVesselById = async (req, res, next) => {
  try {
    const vessel = await Vessel.findById(req.params.id);
    if (!vessel) return res.status(404).json({ success: false, message: 'Vessel not found' });
    res.json({ success: true, data: { vessel } });
  } catch (err) {
    next(err);
  }
};

exports.updateVessel = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const vessel = await Vessel.findById(req.params.id);
    if (!vessel) return res.status(404).json({ success: false, message: 'Vessel not found' });

    await Vessel.update(req.params.id, req.body);
    const updated = await Vessel.findById(req.params.id);
    res.json({ success: true, message: 'Vessel updated', data: { vessel: updated } });
  } catch (err) {
    next(err);
  }
};

exports.updateVesselStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['available', 'in_use', 'maintenance', 'retired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const vessel = await Vessel.findById(req.params.id);
    if (!vessel) return res.status(404).json({ success: false, message: 'Vessel not found' });

    await Vessel.updateStatus(req.params.id, status);
    res.json({ success: true, message: 'Vessel status updated' });
  } catch (err) {
    next(err);
  }
};

exports.deleteVessel = async (req, res, next) => {
  try {
    const vessel = await Vessel.findById(req.params.id);
    if (!vessel) return res.status(404).json({ success: false, message: 'Vessel not found' });
    await Vessel.delete(req.params.id);
    res.json({ success: true, message: 'Vessel deleted' });
  } catch (err) {
    next(err);
  }
};
