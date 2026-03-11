const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

router.get('/', authorize('admin'), userController.getUsers);
router.get('/:id', authorize('admin'), userController.getUserById);

router.post('/', authorize('admin'), [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['admin', 'operator', 'customer']).withMessage('Invalid role'),
], userController.createUser);

router.put('/:id', authorize('admin'), [
  body('username').optional().trim().isLength({ min: 3, max: 50 }),
  body('email').optional().isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'operator', 'customer']),
  body('status').optional().isIn(['active', 'inactive']),
], userController.updateUser);

router.put('/:id/status', authorize('admin'), [
  body('status').isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
], userController.updateUserStatus);

router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
