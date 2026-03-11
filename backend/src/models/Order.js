const pool = require('../config/database');

class Order {
  static async generateOrderNo() {
    const today = new Date();
    const dateStr = today.getFullYear().toString() +
      String(today.getMonth() + 1).padStart(2, '0') +
      String(today.getDate()).padStart(2, '0');
    const prefix = `ML${dateStr}`;
    const [rows] = await pool.query(
      "SELECT order_no FROM orders WHERE order_no LIKE ? ORDER BY order_no DESC LIMIT 1",
      [`${prefix}%`]
    );
    let seq = 1;
    if (rows.length > 0) {
      const last = rows[0].order_no;
      seq = parseInt(last.slice(prefix.length)) + 1;
    }
    return `${prefix}${String(seq).padStart(3, '0')}`;
  }

  static async create(data) {
    const order_no = await Order.generateOrderNo();
    const {
      customer_id, vessel_id, route_id, origin_port, destination_port,
      cargo_type, cargo_weight, cargo_volume, estimated_departure, estimated_arrival,
      freight_cost, notes
    } = data;
    const [result] = await pool.query(
      `INSERT INTO orders (order_no, customer_id, vessel_id, route_id, status, origin_port, destination_port,
        cargo_type, cargo_weight, cargo_volume, estimated_departure, estimated_arrival, freight_cost, notes)
       VALUES (?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [order_no, customer_id, vessel_id || null, route_id || null, origin_port, destination_port,
       cargo_type, cargo_weight || null, cargo_volume || null, estimated_departure || null,
       estimated_arrival || null, freight_cost || null, notes || null]
    );
    return { id: result.insertId, order_no };
  }

  static async findAll({ page = 1, limit = 20, customer_id, status, search } = {}) {
    const offset = (page - 1) * limit;
    let where = 'WHERE 1=1';
    const params = [];
    if (customer_id) { where += ' AND o.customer_id = ?'; params.push(customer_id); }
    if (status) { where += ' AND o.status = ?'; params.push(status); }
    if (search) { where += ' AND (o.order_no LIKE ? OR o.origin_port LIKE ? OR o.destination_port LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

    const [countRows] = await pool.query(`SELECT COUNT(*) as total FROM orders o ${where}`, params);
    const total = countRows[0].total;

    params.push(parseInt(limit), parseInt(offset));
    const [rows] = await pool.query(
      `SELECT o.*, u.username as customer_name, v.vessel_name, r.route_name
       FROM orders o
       LEFT JOIN users u ON o.customer_id = u.id
       LEFT JOIN vessels v ON o.vessel_id = v.id
       LEFT JOIN routes r ON o.route_id = r.id
       ${where} ORDER BY o.created_at DESC LIMIT ? OFFSET ?`,
      params
    );
    return { data: rows, total, page: parseInt(page), limit: parseInt(limit) };
  }

  static async findById(id) {
    const [rows] = await pool.query(
      `SELECT o.*, u.username as customer_name, u.email as customer_email,
              v.vessel_name, v.vessel_type, r.route_name, r.distance_nm
       FROM orders o
       LEFT JOIN users u ON o.customer_id = u.id
       LEFT JOIN vessels v ON o.vessel_id = v.id
       LEFT JOIN routes r ON o.route_id = r.id
       WHERE o.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  static async update(id, fields) {
    const allowed = ['vessel_id', 'route_id', 'status', 'origin_port', 'destination_port',
      'cargo_type', 'cargo_weight', 'cargo_volume', 'estimated_departure', 'estimated_arrival',
      'actual_departure', 'actual_arrival', 'freight_cost', 'notes'];
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
    await pool.query(`UPDATE orders SET ${updates.join(', ')}, updated_at = NOW() WHERE id = ?`, params);
    return true;
  }

  static async updateStatus(id, status) {
    const [result] = await pool.query(
      'UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const [result] = await pool.query('DELETE FROM orders WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  static async getStats(customer_id = null) {
    let condition = '';
    const params = [];
    if (customer_id) {
      condition = 'WHERE customer_id = ?';
      params.push(customer_id);
    }
    const [rows] = await pool.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'loading' THEN 1 ELSE 0 END) as loading,
        SUM(CASE WHEN status = 'in_transit' THEN 1 ELSE 0 END) as in_transit,
        SUM(CASE WHEN status = 'arrived' THEN 1 ELSE 0 END) as arrived,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN freight_cost ELSE 0 END), 0) as total_revenue
       FROM orders ${condition}`,
      params
    );
    return rows[0];
  }
}

module.exports = Order;
