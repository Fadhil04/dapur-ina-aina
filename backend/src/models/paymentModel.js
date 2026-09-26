// src/models/paymentModel.js
// Merepresentasikan class Payment
const pool = require('../config/db');

const Payment = {
  async create(
    {
      id_order,
      payment_method,
      amount_paid,
      cash_received = null,
      change_amount = null,
      card_type = null,
      last_four = null,
      reference_no = null,
    },
    client = pool
  ) {
    const { rows } = await client.query(
      `INSERT INTO payment
        (id_order, payment_method, amount_paid, cash_received, change_amount, card_type, last_four, reference_no)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [id_order, payment_method, amount_paid, cash_received, change_amount, card_type, last_four, reference_no]
    );
    return rows[0];
  },
};


module.exports = Payment;
