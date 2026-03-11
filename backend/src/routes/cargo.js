const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const cargoController = require('../controllers/cargoController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', cargoController.getCargo);
router.get('/order/:orderId', cargoController.getCargoByOrder);
router.get('/:id', cargoController.getCargoById);

router.post('/', [
  body('order_id').isInt({ min: 1 }).withMessage('Valid order_id required'),
  body('cargo_type').trim().notEmpty().withMessage('Cargo type required'),
], cargoController.createCargo);

router.put('/:id', cargoController.updateCargo);

router.put('/:id/status', authorize('admin', 'operator'), [
  body('status').isIn(['pending', 'loaded', 'in_transit', 'unloaded', 'delivered']).withMessage('Invalid status'),
], cargoController.updateCargoStatus);

router.delete('/:id', authorize('admin', 'operator'), cargoController.deleteCargo);

module.exports = router;
