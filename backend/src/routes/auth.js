const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', [
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
], authController.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
], authController.login);

router.get('/profile', authenticate, authController.getProfile);

router.put('/profile', authenticate, [
  body('username').optional().trim().isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
], authController.updateProfile);

router.put('/change-password', authenticate, [
  body('currentPassword').notEmpty().withMessage('Current password required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
], authController.changePassword);

module.exports = router;
