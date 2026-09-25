// src/models/stockMovementModel.js
// Merepresentasikan class StockMovement
const pool = require('../config/db');

const StockMovement = {
  async create(
    { id_menu_item, id_user, type, quantity_before, quantity_change, quantity_after, note },
    client = pool
  ) {
    const { rows } = await client.query(
      `INSERT INTO stock_movement
        (id_menu_item, id_user, type, quantity_before, quantity_change, quantity_after, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [id_menu_item, id_user, type, quantity_before, quantity_change, quantity_after, note]
    );
    return rows[0];
  },

  async findByMenuItem(id_menu_item) {
    const { rows } = await pool.query(
      `SELECT sm.*, u.name_user
       FROM stock_movement sm
       LEFT JOIN users u ON u.id_user = sm.id_user
       WHERE sm.id_menu_item = $1
       ORDER BY sm.created_at DESC`,
      [id_menu_item]
    );
    return rows;
  },
};

module.exports = StockMovement;
