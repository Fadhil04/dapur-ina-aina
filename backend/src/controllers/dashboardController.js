// backend/src/controllers/dashboardController.js
const pool = require('../config/db');

exports.getStats = async (req, res, next) => {
  try {
    const statsResult = await pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'PENDING') AS pending_count,
        COUNT(*) FILTER (WHERE status = 'LUNAS')   AS lunas_count,
        COALESCE(SUM(total_amount) FILTER (WHERE status = 'LUNAS'), 0) AS revenue_today
      FROM orders
      WHERE created_at::date = CURRENT_DATE
    `);

    const lowStockResult = await pool.query(`
      SELECT m.id_menu_item, m.name_menu, m.stock, c.name_category
      FROM menu_item m
      JOIN category c ON c.id_category = m.id_category
      WHERE m.stock <= 5 AND m.is_active = true
      ORDER BY m.stock ASC
      LIMIT 10
    `);

    const stats = statsResult.rows[0];
    res.json({
      success: true,
      data: {
        pending_count: parseInt(stats.pending_count),
        lunas_count:   parseInt(stats.lunas_count),
        revenue_today: parseFloat(stats.revenue_today),
        low_stock:     lowStockResult.rows,
      },
    });
  } catch (err) { next(err); }
};

exports.getChartData = async (req, res, next) => {
  try {
    const { rows } = await pool.query(`
      SELECT
        to_char(d.day::date, 'DD Mon') AS label,
        COALESCE(SUM(o.total_amount), 0) AS revenue
      FROM generate_series(
        CURRENT_DATE - INTERVAL '6 days',
        CURRENT_DATE,
        '1 day'::interval
      ) AS d(day)
      LEFT JOIN orders o
        ON o.created_at::date = d.day::date AND o.status = 'LUNAS'
      GROUP BY d.day
      ORDER BY d.day
    `);

    res.json({
      success: true,
      data: rows.map(r => ({ label: r.label, revenue: parseFloat(r.revenue) })),
    });
  } catch (err) { next(err); }
};
