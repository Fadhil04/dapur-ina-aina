// frontend/src/utils/billing.js

/**
 * Hitung kembalian uang tunai.
 * @param {number} amountPaid  - Nominal yang dibayarkan
 * @param {number} totalAmount - Total tagihan
 * @returns {number} Kembalian (bisa negatif jika kurang bayar)
 */
export function calculateChange(amountPaid, totalAmount) {
  return (Number(amountPaid) || 0) - (Number(totalAmount) || 0)
}
