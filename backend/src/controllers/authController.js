const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { username, email, password, phone } = req.body;

    const existingEmail = await User.findByEmail(email);
    if (existingEmail) return res.status(409).json({ success: false, message: 'Email already registered' });

    const existingUsername = await User.findByUsername(username);
    if (existingUsername) return res.status(409).json({ success: false, message: 'Username already taken' });

    const user = await User.create({ username, email, password, phone, role: 'customer' });
    const token = signToken(user);

    res.status(201).json({ success: true, message: 'Registration successful', data: { token, user } });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (user.status === 'inactive') return res.status(403).json({ success: false, message: 'Account is inactive' });

    const valid = await User.comparePassword(password, user.password_hash);
    if (!valid) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = signToken(user);
    const { password_hash, ...userInfo } = user;

    res.json({ success: true, message: 'Login successful', data: { token, user: userInfo } });
  } catch (err) {
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { username, phone } = req.body;
    await User.update(req.user.id, { username, phone });
    const user = await User.findById(req.user.id);
    res.json({ success: true, message: 'Profile updated', data: { user } });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const { currentPassword, newPassword } = req.body;
    const user = await User.findByEmail(req.user.email);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const valid = await User.comparePassword(currentPassword, user.password_hash);
    if (!valid) return res.status(400).json({ success: false, message: 'Current password is incorrect' });

    await User.updatePassword(req.user.id, newPassword);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};
