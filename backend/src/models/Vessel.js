const pool = require('../config/database');

class Vessel {
  static async create(data) {
    const { vessel_name, vessel_type, registration_no, capacity_weight, capacity_volume, status = 'available', current_location, owner_name, notes } = data;
    const [result] = await pool.query(
      `INSERT INTO vessels (vessel_name, vessel_type, registration_no, capacity_weight, capacity_volume, status, current_location, owner_name, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [vessel_name, vessel_type, registration_no, capacity_weight || null, capacity_volume || null, status, current_location || null, owner_name || null, notes || null]
    );
    return { id: result.insertId, vessel_name, registration_no };
  }

  static async findAll({ page = 1, limit = 20, status, vessel_type, search } = {}) {
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];
    if (status) { where += ' AND status = ?'; params.push(status); }
    if (vessel_type) { where += ' AND vessel_type = ?'; params.push(vessel_type); }
    if (search) { where += ' AND (vessel_name LIKE ? OR registration_no LIKE ? OR owner_name LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM vessels ${where}`, params);
    const total = countRows[0].total;

    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.query(
      `SELECT * FROM vessels ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      params
    );
    return { data: rows, total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    const [rows] = await pool.query('SELECT * FROM vessels WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async update(id, fields) {
    const allowed = ['vessel_name', 'vessel_type', 'registration_no', 'capacity_weight', 'capacity_volume', 'status', 'current_location', 'owner_name', 'notes'];
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
    await pool.query(`UPDATE vessels SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    return true;
  }

  static async updateStatus(id, status) {
    const [result] = await pool.query(
      'UPDATE vessels SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM vessels WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = Vessel;
