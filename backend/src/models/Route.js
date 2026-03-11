const pool = require('../config/database');

class Route {
  static async create(data) {
    const { route_name, origin_port, destination_port, distance_nm, estimated_days, freight_rate_per_ton, status = 'active', notes } = data;
    const [result] = await pool.query(
      `INSERT INTO routes (route_name, origin_port, destination_port, distance_nm, estimated_days, freight_rate_per_ton, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [route_name, origin_port, destination_port, distance_nm || null, estimated_days || null, freight_rate_per_ton || null, status, notes || null]
    );
    return { id: result.insertId, route_name };
  }

  static async findAll({ page = 1, limit = 20, status, search } = {}) {
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];
    if (status) { where += ' AND status = ?'; params.push(status); }
    if (search) { where += ' AND (route_name LIKE ? OR origin_port LIKE ? OR destination_port LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM routes ${where}`, params);
    const total = countRows[0].total;

    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.query(
      `SELECT * FROM routes ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      params
    );
    return { data: rows, total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM routes WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async update(id, fields) {
    const allowed = ['route_name', 'origin_port', 'destination_port', 'distance_nm', 'estimated_days', 'freight_rate_per_ton', 'status', 'notes'];
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
    await pool.query(`UPDATE routes SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    return true;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM routes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Route;
