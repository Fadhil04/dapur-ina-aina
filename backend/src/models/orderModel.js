// backend/src/models/orderModel.js
const pool = require('../config/db');

// [BIZ-03 FIX] Generate invoice number yang unik: INV-YYYYMMDD-XXXXXX (random suffix)
function generateInvoiceNumber() {
  const now    = new Date();
  const date   = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `INV-${date}-${suffix}`;
}

const Order = {
  // Ambil semua pesanan dengan filter status & pagination
  async findAll({ status, page = 1, limit = 15 } = {}) {
    const offset      = (page - 1) * limit;
    const whereParams = [];
    let   whereClause = 'WHERE 1=1';

    if (status) {
      whereParams.push(status);
      whereClause += ` AND o.status = $${whereParams.length}`;
    }

    const dataQuery = `
      SELECT o.id_order, o.invoice_number, o.customer_name, o.table_number,
             o.status, o.total_amount, o.created_at, u.name_user AS kasir
      FROM orders o
      LEFT JOIN users u ON u.id_user = o.id_user
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${whereParams.length + 1} OFFSET $${whereParams.length + 2}
    `;

    const countQuery = `SELECT COUNT(*) FROM orders o ${whereClause}`;

    const [dataResult, countResult] = await Promise.all([
      pool.query(dataQuery, [...whereParams, limit, offset]),
      pool.query(countQuery, whereParams),
    ]);

    const total      = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    return {
      orders: dataResult.rows,
      total,
      page:       parseInt(page),
      limit,
      totalPages,
    };
  },

  // Ambil jumlah order per status (untuk tab filter) — hanya pesanan hari ini
  async getCounts() {
    const { rows } = await pool.query(`
      SELECT
        COUNT(*)                                    AS total,
        COUNT(*) FILTER (WHERE status = 'PENDING') AS pending,
        COUNT(*) FILTER (WHERE status = 'LUNAS')   AS lunas
      FROM orders
      WHERE created_at::date = CURRENT_DATE
    `);
    return {
      total:   parseInt(rows[0].total),
      pending: parseInt(rows[0].pending),
      lunas:   parseInt(rows[0].lunas),
    };
  },

  // Baca order biasa (tanpa lock)
  async findById(id, client = pool) {
    const orderResult = await client.query(
      `SELECT o.*, u.name_user AS kasir
       FROM orders o LEFT JOIN users u ON u.id_user = o.id_user
       WHERE o.id_order = $1`,
      [id]
    );
    const order = orderResult.rows[0];
    if (!order) return null;

    const itemResult = await client.query(
      'SELECT * FROM order_item WHERE id_order = $1',
      [id]
    );
    order.items = itemResult.rows;

    const paymentResult = await client.query(
      'SELECT * FROM payment WHERE id_order = $1',
      [id]
    );
    order.payment = paymentResult.rows[0] || null;

    return order;
  },

  // [BIZ-02 FIX] Baca order dengan row-lock untuk mencegah double-pay
  async findByIdForUpdate(id, client) {
    const orderResult = await client.query(
      `SELECT o.*, u.name_user AS kasir
       FROM orders o LEFT JOIN users u ON u.id_user = o.id_user
       WHERE o.id_order = $1
       FOR UPDATE OF o`,
      [id]
    );
    const order = orderResult.rows[0];
    if (!order) return null;

    const itemResult = await client.query(
      'SELECT * FROM order_item WHERE id_order = $1',
      [id]
    );
    order.items = itemResult.rows;

    return order;
  },

  // Dipakai saat PELANGGAN checkout (id_user = NULL sampai kasir proses)
  async createOrder({ customer_name, table_number, items }, client) {
    const total         = items.reduce((sum, it) => sum + Number(it.price) * it.quantity, 0);
    const invoiceNumber = generateInvoiceNumber();

    const orderResult = await client.query(
      `INSERT INTO orders (id_user, invoice_number, customer_name, table_number, status, total_amount)
       VALUES (NULL, $1, $2, $3, 'PENDING', $4) RETURNING *`,
      [invoiceNumber, customer_name, table_number, total]
    );
    const order = orderResult.rows[0];

    for (const it of items) {
      const subtotal = Number(it.price) * it.quantity;
      await client.query(
        `INSERT INTO order_item (id_order, id_menu_item, name_menu, price, quantity, notes, subtotal)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [order.id_order, it.id_menu_item, it.name_menu, it.price, it.quantity, it.notes || null, subtotal]
      );
    }

    return order;
  },

  // Diisi kasir saat memproses pembayaran
  async assignCashierAndSetStatus(id, id_user, status, client = pool) {
    const { rows } = await client.query(
      `UPDATE orders SET id_user = $1, status = $2, updated_at = NOW()
       WHERE id_order = $3 RETURNING *`,
      [id_user, status, id]
    );
    return rows[0];
  },
};

module.exports = Order;
