// backend/src/controllers/menuController.js
const { z } = require('zod');
const pool         = require('../config/db');
const MenuItem     = require('../models/menuItemModel');
const StockMovement = require('../models/stockMovementModel');

const createMenuSchema = z.object({
  name_menu:   z.string().min(1, 'Nama menu wajib diisi'),
  price:       z.coerce.number().positive('Harga harus lebih dari 0'),
  id_category: z.coerce.number().int().positive('Kategori wajib dipilih'),
  stock:       z.coerce.number().int().min(0).optional().default(0),
});

const updateMenuSchema = z.object({
  name_menu:   z.string().min(1).optional(),
  price:       z.coerce.number().positive().optional(),
  id_category: z.coerce.number().int().positive().optional(),
});

exports.createMenuSchema = createMenuSchema;
exports.updateMenuSchema = updateMenuSchema;

exports.getMenu = async (req, res, next) => {
  try {
    const { category, search } = req.query;
    const items = await MenuItem.findAll({ categoryId: category, keyword: search, activeOnly: true });
    res.json({ success: true, data: items });
  } catch (err) { next(err); }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await MenuItem.findAllCategories();
    res.json({ success: true, data: categories });
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID menu tidak valid' });

    const menu = await MenuItem.findById(id);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    res.json({ success: true, data: menu });
  } catch (err) { next(err); }
};

exports.createMenu = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const menu = await MenuItem.create(req.body, client);

    // [BIZ-05 FIX] Catat stock movement awal jika stok > 0
    if (menu.stock > 0) {
      await StockMovement.create({
        id_menu_item:    menu.id_menu_item,
        id_user:         req.user.id_user,
        type:            'TAMBAH',
        quantity_before: 0,
        quantity_change: menu.stock,
        quantity_after:  menu.stock,
        note:            'Stok awal saat menu dibuat',
      }, client);
    }

    await client.query('COMMIT');
    res.status(201).json({ success: true, message: 'Menu berhasil dibuat', data: menu });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.updateMenu = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID menu tidak valid' });

    const menu = await MenuItem.findById(id);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    const updated = await MenuItem.update(id, req.body);
    res.json({ success: true, message: 'Menu berhasil diperbarui', data: updated });
  } catch (err) { next(err); }
};

exports.deactivateMenu = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID menu tidak valid' });

    const menu = await MenuItem.findById(id);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    await MenuItem.deactivate(id);
    res.json({ success: true, message: 'Menu berhasil dinonaktifkan' });
  } catch (err) { next(err); }
};
