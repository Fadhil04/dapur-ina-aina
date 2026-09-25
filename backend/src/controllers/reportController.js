// backend/src/controllers/reportController.js
const ExcelJS = require('exceljs');
const pool = require('../config/db');

/**
 * Generate Excel report untuk transaksi dalam rentang tanggal
 * GET /orders/report/excel?date_start=YYYY-MM-DD&date_end=YYYY-MM-DD
 */
exports.downloadExcelReport = async (req, res) => {
  try {
    const { date_start, date_end } = req.query;

    // Validasi tanggal
    if (!date_start || !date_end) {
      return res.status(400).json({ 
        success: false, 
        message: 'Parameter date_start dan date_end wajib diisi' 
      });
    }

    // Query transaksi LUNAS dalam rentang tanggal
    const query = `
      SELECT 
        o.id_order,
        o.customer_name,
        o.table_number,
        o.order_type,
        o.total_amount,
        o.status,
        o.created_at,
        p.payment_method,
        p.card_type,
        p.reference_no,
        p.paid_at,
        json_agg(
          json_build_object(
            'menu_name', m.name,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal
          )
        ) as items
      FROM orders o
      LEFT JOIN payment p ON o.id_order = p.id_order
      LEFT JOIN order_items oi ON o.id_order = oi.id_order
      LEFT JOIN menu m ON oi.id_menu = m.id_menu
      WHERE o.status = 'LUNAS'
        AND p.paid_at >= $1::date
        AND p.paid_at < ($2::date + INTERVAL '1 day')
      GROUP BY o.id_order, p.id_payment
      ORDER BY p.paid_at DESC
    `;

    const result = await pool.query(query, [date_start, date_end]);

    // Buat workbook Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Laporan Penjualan');

    // Header info
    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = 'LAPORAN PENJUALAN - DAPUR INA & AINA';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

    worksheet.mergeCells('A2:H2');
    worksheet.getCell('A2').value = `Periode: ${date_start} s/d ${date_end}`;
    worksheet.getCell('A2').font = { size: 12 };
    worksheet.getCell('A2').alignment = { horizontal: 'center' };

    // Empty row
    worksheet.addRow([]);

    // Header columns
    const headerRow = worksheet.addRow([
      'No',
      'Tanggal',
      'No. Pesanan',
      'Nama Pelanggan',
      'Meja/Tipe',
      'Item',
      'Metode Bayar',
      'Total (Rp)'
    ]);

    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1B2A4A' }
      };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    });

    // Data rows
    let no = 1;
    let grandTotal = 0;

    result.rows.forEach((order) => {
      const itemsText = order.items
        .map(item => `${item.quantity}x ${item.menu_name} (@${formatRupiah(item.price)})`)
        .join('\n');

      const row = worksheet.addRow([
        no++,
        formatDate(order.paid_at),
        order.id_order,
        order.customer_name,
        order.order_type === 'DINE_IN' ? `Meja ${order.table_number}` : 'Take Away',
        itemsText,
        formatPaymentMethod(order.payment_method, order.card_type),
        order.total_amount
      ]);

      row.alignment = { vertical: 'top', wrapText: true };
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (colNumber === 8) {
          cell.numFmt = '#,##0';
          cell.alignment = { horizontal: 'right', vertical: 'top' };
        }
      });

      grandTotal += order.total_amount;
    });

    // Grand total row
    const totalRow = worksheet.addRow(['', '', '', '', '', '', 'TOTAL', grandTotal]);
    totalRow.font = { bold: true };
    totalRow.getCell(8).numFmt = '#,##0';
    totalRow.getCell(8).alignment = { horizontal: 'right' };
    totalRow.eachCell((cell, colNumber) => {
      if (colNumber >= 7) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE8EAF6' }
        };
        cell.border = {
          top: { style: 'double' },
          left: { style: 'thin' },
          bottom: { style: 'double' },
          right: { style: 'thin' }
        };
      }
    });

    // Column widths
    worksheet.columns = [
      { key: 'no', width: 5 },
      { key: 'date', width: 18 },
      { key: 'order_id', width: 12 },
      { key: 'customer', width: 20 },
      { key: 'table', width: 15 },
      { key: 'items', width: 40 },
      { key: 'payment', width: 15 },
      { key: 'total', width: 15 }
    ];

    // Set response headers
    const filename = `Laporan_Penjualan_${date_start}_${date_end}.xlsx`;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Write to response
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('Error generating Excel report:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Gagal membuat laporan Excel',
      error: error.message 
    });
  }
};

// Helper functions
function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID').format(amount);
}

function formatDate(date) {
  return new Date(date).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatPaymentMethod(method, cardType) {
  if (method === 'TUNAI') return 'Tunai';
  if (method === 'QRIS') return 'QRIS';
  if (method === 'DEBIT') return `Debit${cardType ? ` - ${cardType}` : ''}`;
  if (method === 'KREDIT') return `Kredit${cardType ? ` - ${cardType}` : ''}`;
  return method;
}
