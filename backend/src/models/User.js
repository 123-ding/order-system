const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, username, email, phone, role, status, created_at, updated_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  static async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0] || null;
  }

  static async create({ username, email, password, phone, role = 'customer' }) {
    const password_hash = await bcrypt.hash(password, 12);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password_hash, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, password_hash, phone || null, role, 'active']
    );
    return { id: result.insertId, username, email, phone, role, status: 'active' };
  }

  static async findAll({ page = 1, limit = 20, role, status, search } = {}) {
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];
    if (role) { where += ' AND role = ?'; params.push(role); }
    if (status) { where += ' AND status = ?'; params.push(status); }
    if (search) { where += ' AND (username LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM users ${where}`, params);
    const total = countRows[0].total;

    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.query(
      `SELECT id, username, email, phone, role, status, created_at, updated_at FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      params
    );
    return { data: rows, total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async update(id, fields) {
    const allowed = ['username', 'email', 'phone', 'role', 'status'];
    const updates = [];
    const params = [];
    for (const key of allowed) {
      if (fields[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(fields[key]);
      }
    }
    if (updates.length === 0) return false;
    params.push(id);
    await pool.query(`UPDATE users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    return true;
  }

  static async updatePassword(id, newPassword) {
    const password_hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?', [password_hash, id]);
    return true;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async comparePassword(plainPassword, hash) {
    return bcrypt.compare(plainPassword, hash);
  }
}

module.exports = User;
