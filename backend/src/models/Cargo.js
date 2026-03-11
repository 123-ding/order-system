const pool = require('../config/database');

class Cargo {
  static async generateCargoNo() {
    const today = new Date();
    const dateStr = today.getFullYear().toString() +
      String(today.getMonth() + 1).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0');
    const prefix = `CG${dateStr}`;
    const [rows] = await pool.query(
      "SELECT cargo_no FROM cargo WHERE cargo_no LIKE ? ORDER BY cargo_no DESC LIMIT 1",
      [`${prefix}%`]
    );
    let seq = 1;
    if (rows.length > 0) {
      const last = rows[0].cargo_no;
      seq = parseInt(last.slice(prefix.length)) + 1;
    }
    return `${prefix}${String(seq).padStart(3, '0')}`;
  }

  static async create(data) {
    const cargo_no = await Cargo.generateCargoNo();
    const { order_id, description, cargo_type, weight, volume, quantity, unit, packaging_type, hazmat = false, temperature_required = false, temperature_min, temperature_max, notes } = data;
    const [result] = await pool.query(
      `INSERT INTO cargo (order_id, cargo_no, description, cargo_type, weight, volume, quantity, unit, packaging_type,
        hazmat, temperature_required, temperature_min, temperature_max, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [order_id, cargo_no, description || null, cargo_type, weight || null, volume || null, quantity || null,
       unit || null, packaging_type || null, hazmat ? 1 : 0, temperature_required ? 1 : 0,
       temperature_min || null, temperature_max || null, notes || null]
    );
    return { id: result.insertId, cargo_no };
  }

  static async findByOrderId(order_id) {
    const [rows] = await pool.query('SELECT * FROM cargo WHERE order_id = ? ORDER BY created_at DESC', [order_id]);
    return rows;
  }

  static async findAll({ page = 1, limit = 20, order_id, status, search } = {}) {
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];
    if (order_id) { where += ' AND c.order_id = ?'; params.push(order_id); }
    if (status) { where += ' AND c.status = ?'; params.push(status); }
    if (search) { where += ' AND (c.cargo_no LIKE ? OR c.description LIKE ? OR c.cargo_type LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM cargo c ${where}`, params);
    const total = countRows[0].total;

    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.query(
      `SELECT c.*, o.order_no FROM cargo c
       LEFT JOIN orders o ON c.order_id = o.id
       ${where} ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      params
    );
    return { data: rows, total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT c.*, o.order_no FROM cargo c LEFT JOIN orders o ON c.order_id = o.id WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async update(id, fields) {
    const allowed = ['description', 'cargo_type', 'weight', 'volume', 'quantity', 'unit', 'packaging_type', 'hazmat', 'temperature_required', 'temperature_min', 'temperature_max', 'status', 'notes'];
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
    await pool.query(`UPDATE cargo SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    return true;
  }

  static async updateStatus(id, status) {
    const [result] = await pool.query(
      'UPDATE cargo SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM cargo WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Cargo;
