// backend/src/controllers/stockController.js
const { z } = require('zod');
const pool          = require('../config/db');
const MenuItem      = require('../models/menuItemModel');
const StockMovement = require('../models/stockMovementModel');

const adjustSchema = z.object({
  id_menu_item: z.coerce.number().int().positive('ID menu wajib diisi'),
  type:         z.enum(['TAMBAH', 'RUSAK'], { errorMap: () => ({ message: 'Tipe mutasi tidak valid (TAMBAH/RUSAK)' }) }),
  quantity:     z.coerce.number().int().positive('Jumlah harus lebih dari 0'),
  note:         z.string().min(1, 'Catatan wajib diisi'),
});

exports.adjustSchema = adjustSchema;

exports.listStock = async (req, res, next) => {
  try {
    const { categoryId, keyword } = req.query;
    const items      = await MenuItem.findAll({ categoryId, keyword });
    const categories = await MenuItem.findAllCategories();
    res.json({ success: true, data: { items, categories } });
  } catch (err) { next(err); }
};

exports.adjustStock = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id_menu_item, type, quantity, note } = req.body;
    const qty = Number(quantity);

    const menu = await MenuItem.findById(id_menu_item);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });

    const quantityChange = type === 'RUSAK' ? -qty : qty;
    const quantityAfter  = menu.stock + quantityChange;

    if (quantityAfter < 0) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak boleh menjadi minus. Stok saat ini: ${menu.stock}.`,
      });
    }

    await client.query('BEGIN');
    await MenuItem.updateStock(id_menu_item, quantityAfter, client);
    const movement = await StockMovement.create({
      id_menu_item,
      id_user:         req.user.id_user,
      type,
      quantity_before: menu.stock,
      quantity_change: quantityChange,
      quantity_after:  quantityAfter,
      note,
    }, client);
    await client.query('COMMIT');

    res.json({ success: true, message: 'Mutasi stok berhasil dicatat', data: movement });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.getStockHistory = async (req, res, next) => {
  try {
    const menu = await MenuItem.findById(req.params.id);
    if (!menu) return res.status(404).json({ success: false, message: 'Menu tidak ditemukan' });
    const movements = await StockMovement.findByMenuItem(req.params.id);
    res.json({ success: true, data: { menu, movements } });
  } catch (err) { next(err); }
};
