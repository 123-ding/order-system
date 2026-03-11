const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const routeController = require('../controllers/routeController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', routeController.getRoutes);
router.get('/:id', routeController.getRouteById);

router.post('/calculate-freight', [
  body('route_id').isInt({ min: 1 }).withMessage('Valid route_id required'),
  body('weight').isFloat({ min: 0.01 }).withMessage('Weight must be a positive number'),
], routeController.calculateFreight);

router.post('/', authorize('admin'), [
  body('route_name').trim().notEmpty().withMessage('Route name required'),
  body('origin_port').trim().notEmpty().withMessage('Origin port required'),
  body('destination_port').trim().notEmpty().withMessage('Destination port required'),
], routeController.createRoute);

router.put('/:id', authorize('admin'), routeController.updateRoute);

router.delete('/:id', authorize('admin'), routeController.deleteRoute);

module.exports = router;
