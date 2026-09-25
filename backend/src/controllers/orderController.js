// backend/src/controllers/orderController.js
const { z } = require('zod');
const Order    = require('../models/orderModel');
const MenuItem = require('../models/menuItemModel');
const pool     = require('../config/db');

const checkoutSchema = z.object({
  customer_name: z.string().min(1, 'Nama pelanggan wajib diisi'),
  table_number:  z.string().min(1, 'Nomor meja wajib diisi'),
  items: z.array(z.object({
    id_menu_item: z.coerce.number().int().positive(),
    quantity:     z.coerce.number().int().positive('Jumlah harus lebih dari 0'),
  })).min(1, 'Keranjang tidak boleh kosong'),
});

exports.checkoutSchema = checkoutSchema;

exports.checkout = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { customer_name, table_number, items } = req.body;

    // [BUG-05 FIX] Ambil semua menu secara paralel
    const menuResults = await Promise.all(
      items.map(item => MenuItem.findById(item.id_menu_item))
    );

    // Validasi semua menu: aktif, tersedia, dan stok cukup
    const enrichedItems = [];
    for (let i = 0; i < items.length; i++) {
      const menu = menuResults[i];
      const { id_menu_item, quantity } = items[i];

      if (!menu) {
        return res.status(400).json({
          success: false,
          message: `Menu dengan ID ${id_menu_item} tidak ditemukan`,
        });
      }
      if (!menu.is_active) {
        return res.status(400).json({
          success: false,
          message: `Menu "${menu.name_menu}" tidak tersedia`,
        });
      }
      // [BIZ-04 FIX] Cek stok saat checkout — bukan hanya saat bayar
      if (menu.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Stok "${menu.name_menu}" tidak mencukupi (tersisa: ${menu.stock})`,
        });
      }

      enrichedItems.push({
        id_menu_item,
        name_menu: menu.name_menu,
        price:     menu.price,
        quantity,
      });
    }

    await client.query('BEGIN');
    const order = await Order.createOrder({ customer_name, table_number, items: enrichedItems }, client);
    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Pesanan berhasil dibuat',
      data: {
        id_order:       order.id_order,
        invoice_number: order.invoice_number,
        status:         order.status,
        total_amount:   order.total_amount,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

exports.listOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 15 } = req.query;
    const result = await Order.findAll({
      status: status && status !== 'ALL' ? status : undefined,
      page:   parseInt(page),
      limit:  parseInt(limit),
    });
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

exports.getOrderCounts = async (req, res, next) => {
  try {
    const counts = await Order.getCounts();
    res.json({ success: true, data: counts });
  } catch (err) { next(err); }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ success: false, message: 'ID pesanan tidak valid' });

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    res.json({ success: true, data: order });
  } catch (err) { next(err); }
};
