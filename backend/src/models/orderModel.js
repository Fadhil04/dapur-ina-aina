// backend/src/models/orderModel.js
const pool = require('../config/db');
const crypto = require('crypto');

// [BIZ-03 FIX] Generate invoice number yang unik: INV-YYYYMMDD-XXXXXX (crypto-based)
function generateInvoiceNumber() {
  const now    = new Date();
  const date   = now.toISOString().slice(0, 10).replace(/-/g, '');
  const suffix = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `INV-${date}-${suffix}`;
}

const Order = {
  // Ambil semua pesanan dengan filter status & pagination & search
  async findAll({ status, page = 1, limit = 15, search } = {}) {
    const safePage    = Math.max(1, parseInt(page) || 1);
    const safeLimit   = Math.max(1, parseInt(limit) || 15);
    const offset      = (safePage - 1) * safeLimit;
    const whereParams = [];
    let   whereClause = 'WHERE 1=1';

    const VALID_STATUSES = ['PENDING', 'LUNAS', 'DIBATALKAN'];
    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
      whereParams.push(status.toUpperCase());
      whereClause += ` AND o.status = $${whereParams.length}`;
    }

    if (search) {
      whereParams.push(`%${search}%`);
      whereClause += ` AND (o.customer_name ILIKE $${whereParams.length} OR o.invoice_number ILIKE $${whereParams.length})`;
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
      pool.query(dataQuery, [...whereParams, safeLimit, offset]),
      pool.query(countQuery, whereParams),
    ]);

    const total      = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / safeLimit);

    return {
      orders: dataResult.rows,
      total,
      page:       safePage,
      limit:      safeLimit,
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

  // Baca order biasa (tanpa lock) - Optimized: single query dengan LATERAL JOIN
  async findById(id, client = pool) {
    const { rows } = await client.query(
      `SELECT 
         o.*,
         u.name_user AS kasir,
         COALESCE(i.items, '[]'::json) AS items,
         p.payment
       FROM orders o 
       LEFT JOIN users u ON u.id_user = o.id_user
       LEFT JOIN LATERAL (
         SELECT json_agg(json_build_object(
           'id_order_item', oi.id_order_item,
           'id_order', oi.id_order,
           'id_menu_item', oi.id_menu_item,
           'name_menu', oi.name_menu,
           'price', oi.price,
           'quantity', oi.quantity,
           'notes', oi.notes,
           'subtotal', oi.subtotal
         )) AS items
         FROM order_item oi 
         WHERE oi.id_order = o.id_order
       ) i ON true
       LEFT JOIN LATERAL (
         SELECT json_build_object(
           'id_payment', p.id_payment,
           'id_order', p.id_order,
           'payment_method', p.payment_method,
           'card_type', p.card_type,
           'last_four', p.last_four,
           'reference_no', p.reference_no,
           'amount_paid', p.amount_paid,
           'cash_received', p.cash_received,
           'change_amount', p.change_amount,
           'paid_at', p.paid_at,
           'created_at', p.paid_at
         ) AS payment
         FROM payment p 
         WHERE p.id_order = o.id_order
         LIMIT 1
       ) p ON true
       WHERE o.id_order = $1`,
      [id]
    );
    
    const order = rows[0];
    if (!order) return null;

    // Parse JSON fields (already parsed by pg driver)
    return order;
  },

  // [BIZ-02 FIX] Baca order dengan row-lock untuk mencegah double-pay - Optimized
  async findByIdForUpdate(id, client) {
    const { rows } = await client.query(
      `SELECT 
         o.*,
         u.name_user AS kasir,
         COALESCE(i.items, '[]'::json) AS items
       FROM orders o 
       LEFT JOIN users u ON u.id_user = o.id_user
       LEFT JOIN LATERAL (
         SELECT json_agg(json_build_object(
           'id_order_item', oi.id_order_item,
           'id_order', oi.id_order,
           'id_menu_item', oi.id_menu_item,
           'name_menu', oi.name_menu,
           'price', oi.price,
           'quantity', oi.quantity,
           'notes', oi.notes,
           'subtotal', oi.subtotal
         )) AS items
         FROM order_item oi 
         WHERE oi.id_order = o.id_order
       ) i ON true
       WHERE o.id_order = $1
       FOR UPDATE OF o`,
      [id]
    );
    
    const order = rows[0];
    if (!order) return null;

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
