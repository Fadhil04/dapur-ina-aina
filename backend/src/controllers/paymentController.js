// backend/src/controllers/paymentController.js
const { z } = require('zod');
const pool          = require('../config/db');
const Order         = require('../models/orderModel');
const Payment       = require('../models/paymentModel');
const StockMovement = require('../models/stockMovementModel');

const paySchema = z.object({
  payment_method: z.enum(['TUNAI', 'DEBIT', 'KREDIT', 'QRIS'], { errorMap: () => ({ message: 'Metode pembayaran tidak valid' }) }),
  amount_paid:    z.coerce.number().positive('Nominal bayar harus lebih dari 0'),
  card_type:      z.string().optional(),
  last_four:      z.string().optional(),
  reference_no:   z.string().optional(),
});

exports.paySchema = paySchema;

exports.processPayment = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const orderId = req.params.id;

    await client.query('BEGIN');

    // [BIZ-02 FIX] Ambil & lock order di dalam transaksi — mencegah double-pay
    const order = await Order.findByIdForUpdate(orderId, client);

    if (!order) {
      await client.query('ROLLBACK');
      return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
    }
    if (order.status === 'LUNAS') {
      await client.query('ROLLBACK');
      return res.status(409).json({ success: false, message: 'Pesanan sudah dibayar' });
    }

    const { payment_method, amount_paid, card_type, last_four, reference_no } = req.body;

    // Validasi metode pembayaran
    if (payment_method === 'TUNAI' && amount_paid < order.total_amount) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: `Uang diterima (${amount_paid}) kurang dari total tagihan (${order.total_amount})`,
      });
    }

    // [BIZ-01 FIX] Cek & kurangi stok di dalam transaksi dengan SELECT FOR UPDATE per item
    for (const item of order.items) {
      // Lock baris menu_item agar tidak ada update stok bersamaan
      const { rows } = await client.query(
        'SELECT id_menu_item, name_menu, stock FROM menu_item WHERE id_menu_item = $1 FOR UPDATE',
        [item.id_menu_item]
      );
      const menu = rows[0];

      if (!menu || menu.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: `Stok ${menu ? menu.name_menu : 'menu'} tidak mencukupi (tersisa: ${menu?.stock ?? 0})`,
        });
      }

      const newStock = menu.stock - item.quantity;

      await client.query(
        'UPDATE menu_item SET stock = $1, updated_at = NOW() WHERE id_menu_item = $2',
        [newStock, item.id_menu_item]
      );

      await StockMovement.create({
        id_menu_item:    item.id_menu_item,
        id_user:         req.user.id_user,
        type:            'PENJUALAN',
        quantity_before: menu.stock,
        quantity_change: -item.quantity,
        quantity_after:  newStock,
        note:            `Penjualan dari invoice ${order.invoice_number}`,
      }, client);
    }

    const changeAmount = payment_method === 'TUNAI' ? amount_paid - order.total_amount : 0;

    await Payment.create({
      id_order:      orderId,
      payment_method,
      amount_paid:   order.total_amount,
      cash_received: payment_method === 'TUNAI' ? amount_paid : null,
      change_amount: changeAmount,
      card_type:     card_type  || null,
      last_four:     last_four  || null,
      reference_no:  reference_no || null,
    }, client);

    await Order.assignCashierAndSetStatus(orderId, req.user.id_user, 'LUNAS', client);

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Pembayaran berhasil',
      data: {
        invoice_number: order.invoice_number,
        total_amount:   order.total_amount,
        payment_method,
        amount_paid,
        change_amount:  changeAmount,
      },
    });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};
