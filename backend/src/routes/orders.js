const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', orderController.getOrderStats);

router.get('/', orderController.getOrders);

router.post('/', [
  body('origin_port').trim().notEmpty().withMessage('Origin port required'),
  body('destination_port').trim().notEmpty().withMessage('Destination port required'),
  body('cargo_type').trim().notEmpty().withMessage('Cargo type required'),
], orderController.createOrder);

router.get('/:id', orderController.getOrderById);

router.put('/:id', orderController.updateOrder);

router.put('/:id/status', authorize('admin', 'operator'), [
  body('status').isIn(['pending', 'confirmed', 'loading', 'in_transit', 'arrived', 'completed', 'cancelled']).withMessage('Invalid status'),
], orderController.updateOrderStatus);

router.delete('/:id', authorize('admin'), orderController.deleteOrder);

module.exports = router;
