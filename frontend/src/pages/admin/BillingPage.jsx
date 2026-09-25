// frontend/src/pages/admin/BillingPage.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { calculateChange } from '../../utils/billing';
import { Printer, CheckCircle, ArrowLeft } from 'lucide-react';
import { Card, Button } from '../../components/ui';

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function formatDate(d) {
  return new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function BillingPage() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const qc         = useQueryClient()

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => orderService.getById(id),
  })

  const [method, setMethod]       = useState('TUNAI')
  const [amountPaid, setAmountPaid] = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  // [BUG-02 FIX] success menyimpan data dari res.data (sudah di-unwrap di service)
  const [successData, setSuccessData] = useState(null)

  const change = method === 'TUNAI' ? calculateChange(amountPaid, order?.total_amount) : 0

  // [UX-01 FIX] Reset amountPaid saat ganti metode bayar
  const handleMethodChange = (m) => {
    setMethod(m)
    setAmountPaid('')
    setError(null)
  }

  // [UX-05 FIX] Disable tombol jika TUNAI tapi nominal belum diisi atau kurang
  const isPayDisabled = loading
    || (method === 'TUNAI' && (!amountPaid || change < 0))

  const handlePay = async () => {
    setError(null)
    setLoading(true)
    try {
      const res = await orderService.pay(id, {
        payment_method: method,
        amount_paid: method === 'TUNAI' ? Number(amountPaid) : order.total_amount,
      })
      qc.invalidateQueries({ queryKey: ['orders'] })
      qc.invalidateQueries({ queryKey: ['order-counts'] })
      qc.invalidateQueries({ queryKey: ['order', id] })
      // [BUG-02 FIX] orderService.pay returns { success, message, data: {...} }
      // simpan res.data agar bisa akses invoice_number, change_amount, dll
      setSuccessData(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses pembayaran.')
    } finally {
      setLoading(false)
    }
  }

  if (isLoading) return (
    <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl">
      <div className="py-20 text-center text-on-surface-variant font-body-md text-body-md">Memuat data pesanan...</div>
    </div>
  )
  if (isError || !order) return (
    <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl">
      <div className="py-20 text-center text-error font-body-md text-body-md">Pesanan tidak ditemukan.</div>
    </div>
  )

  const isLunas = order.status === 'LUNAS' || successData

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl">
      <div className="max-w-2xl">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-5 transition-colors"
        >
          <ArrowLeft size={16} /> Kembali ke Pesanan
        </button>

        {/* Struk — selalu tampil */}
        <div id="receipt" className="bg-white rounded-2xl shadow-sm p-6 mb-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Dapur Ina Aina</h2>
            <p className="text-xs text-gray-400">Struk Pembayaran</p>
          </div>

          <div className="border-t border-dashed border-gray-200 pt-4 mb-4 text-sm space-y-1.5 text-gray-600">
            <div className="flex justify-between">
              <span>Invoice</span>
              <span className="font-mono font-semibold">{order.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan</span><span>{order.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Meja</span><span>{order.table_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Waktu</span><span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className={isLunas ? 'text-green-600 font-semibold' : 'text-amber-600 font-semibold'}>
                {isLunas ? 'LUNAS' : 'PENDING'}
              </span>
            </div>
            {/* Tampilkan info pembayaran jika sudah lunas */}
            {(successData || order.payment) && (
              <>
                <div className="flex justify-between">
                  <span>Metode</span>
                  <span>{(successData?.payment_method ?? order.payment?.payment_method) === 'TUNAI' ? '💵 Tunai' : '💳 Non-Tunai'}</span>
                </div>
                {(successData?.payment_method ?? order.payment?.payment_method) === 'TUNAI' && (
                  <>
                    <div className="flex justify-between">
                      <span>Dibayar</span>
                      <span>{formatRupiah(successData?.amount_paid ?? order.payment?.cash_received ?? 0)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-green-700">
                      <span>Kembalian</span>
                      <span>{formatRupiah(successData?.change_amount ?? order.payment?.change_amount ?? 0)}</span>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          {/* Item list */}
          <table className="w-full text-sm mb-4">
            <thead>
              <tr className="text-xs text-gray-400 border-b">
                <th className="text-left py-1">Item</th>
                <th className="text-center py-1">Qty</th>
                <th className="text-right py-1">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map(item => (
                <tr key={item.id_order_item} className="border-b border-dashed border-gray-100">
                  <td className="py-1.5 text-gray-700">{item.name_menu}</td>
                  <td className="text-center text-gray-500">{item.quantity}</td>
                  <td className="text-right font-medium">{formatRupiah(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-3">
            <span>Total</span>
            <span>{formatRupiah(order.total_amount)}</span>
          </div>
        </div>

        {/* Form pembayaran — hanya jika belum LUNAS */}
        {!isLunas && (
          <div className="bg-white rounded-2xl shadow-sm p-6 no-print">
            <h3 className="font-bold text-gray-800 mb-4">Proses Pembayaran</h3>

            {/* Pilihan metode */}
            <div className="flex gap-3 mb-4">
              {['TUNAI', 'NON_TUNAI'].map(m => (
                <button
                  key={m}
                  onClick={() => handleMethodChange(m)}
                  className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    method === m
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'border-gray-200 text-gray-600 hover:border-orange-300'
                  }`}
                >
                  {m === 'TUNAI' ? '💵 Tunai' : '💳 Non-Tunai'}
                </button>
              ))}
            </div>

            {/* Input nominal — hanya TUNAI */}
            {method === 'TUNAI' && (
              <div className="mb-4">
                <label className="text-sm text-gray-500 font-medium">
                  Nominal Dibayar
                  <span className="ml-1 text-xs text-gray-400">(min. {formatRupiah(order.total_amount)})</span>
                </label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={e => setAmountPaid(e.target.value)}
                  className="w-full mt-1 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400 text-lg font-mono"
                  placeholder={String(order.total_amount)}
                  min={order.total_amount}
                />
                {amountPaid && (
                  <p className={`mt-2 text-sm font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {change >= 0
                      ? `✅ Kembalian: ${formatRupiah(change)}`
                      : `❌ Kurang: ${formatRupiah(Math.abs(change))}`
                    }
                  </p>
                )}
              </div>
            )}

            {method === 'NON_TUNAI' && (
              <div className="mb-4 p-3 bg-blue-50 rounded-xl text-sm text-blue-700">
                💳 Pembayaran non-tunai — total akan ditagihkan: <strong>{formatRupiah(order.total_amount)}</strong>
              </div>
            )}

            {error && (
              <div className="text-red-500 text-sm bg-red-50 border border-red-200 p-3 rounded-xl mb-3">
                {error}
              </div>
            )}

            <button
              onClick={handlePay}
              disabled={isPayDisabled}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {loading ? 'Memproses...' : `Proses Pembayaran ${formatRupiah(order.total_amount)}`}
            </button>
          </div>
        )}

        {/* Panel sukses setelah bayar */}
        {isLunas && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center no-print">
            <CheckCircle className="mx-auto text-green-500 mb-2" size={40} />
            <p className="font-bold text-green-700 text-lg">Pembayaran Berhasil!</p>
            {successData && (
              <p className="text-sm text-gray-500 mt-1">
                Invoice: <span className="font-mono font-semibold text-gray-700">{successData.invoice_number}</span>
              </p>
            )}
            <div className="flex gap-3 justify-center mt-4">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                <Printer size={16} /> Cetak Struk
              </button>
              <button
                onClick={() => navigate('/orders')}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
              >
                Pesanan Berikutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
