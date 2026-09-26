// src/models/menuItemModel.js
const pool = require('../config/db');

const MenuItem = {
  // Ambil semua menu, opsional filter
  async findAll({ categoryId, keyword, activeOnly = false } = {}) {
    let query = `
      SELECT m.id_menu_item, m.name_menu, m.price, m.stock, m.is_active, m.image_url,
             c.id_category, c.name_category
      FROM menu_item m
      JOIN category c ON c.id_category = m.id_category
      WHERE 1=1
    `;
    const params = [];

    if (activeOnly) {
      query += ' AND m.is_active = true';
    }
    if (categoryId) {
      params.push(categoryId);
      query += ` AND m.id_category = $${params.length}`;
    }
    if (keyword) {
      params.push(`%${keyword}%`);
      query += ` AND m.name_menu ILIKE $${params.length}`;
    }
    query += ' ORDER BY m.name_menu ASC';

    const { rows } = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query(
      'SELECT * FROM menu_item WHERE id_menu_item = $1',
      [id]
    );
    return rows[0];
  },

  async create({ id_category, name_menu, price, stock, image_url }, client = pool) {
    const { rows } = await client.query(
      `INSERT INTO menu_item (id_category, name_menu, price, stock, image_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [id_category, name_menu, price, stock, image_url || null]
    );
    return rows[0];
  },

  // Update atribut menu (nama, harga, kategori, gambar) — safe untuk partial update
  async update(id, { id_category, name_menu, price, image_url }) {
    const { rows } = await pool.query(
      `UPDATE menu_item
       SET id_category = COALESCE($1, id_category),
           name_menu   = COALESCE($2, name_menu),
           price       = COALESCE($3, price),
           image_url   = COALESCE($4, image_url),
           updated_at  = NOW()
       WHERE id_menu_item = $5 RETURNING *`,
      [id_category || null, name_menu || null, price || null, image_url || null, id]
    );
    return rows[0];
  },

  // Soft delete — nonaktifkan menu
  async deactivate(id) {
    const { rows } = await pool.query(
      `UPDATE menu_item SET is_active = false, updated_at = NOW()
       WHERE id_menu_item = $1 RETURNING *`,
      [id]
    );
    return rows[0];
  },

  // Aktifkan kembali menu yang sudah dinonaktifkan
  async activate(id) {
    const { rows } = await pool.query(
      `UPDATE menu_item SET is_active = true, updated_at = NOW()
       WHERE id_menu_item = $1 RETURNING *`,
      [id]
    );
    return rows[0];
  },

  // Update stok absolut (dipakai controller setelah hitung stok baru)
  async updateStock(id, newStock, client = pool) {
    const { rows } = await client.query(
      `UPDATE menu_item SET stock = $1, updated_at = NOW()
       WHERE id_menu_item = $2 RETURNING *`,
      [newStock, id]
    );
    return rows[0];
  },

  async findAllCategories() {
    const { rows } = await pool.query('SELECT * FROM category ORDER BY name_category');
    return rows;
  },
};

module.exports = MenuItem;
