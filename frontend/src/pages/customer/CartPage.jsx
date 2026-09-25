// frontend/src/pages/customer/CartPage.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { orderService } from '../../services/orderService'
import CustomerLayout from '../../layouts/CustomerLayout'
import { Trash2, Plus, Minus, ShoppingBag, CheckCircle } from 'lucide-react'

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart, totalPrice } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState({ customer_name: '', table_number: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const handleQtyChange = (id, delta, current) => {
    const next = current + delta
    if (next <= 0) removeItem(id)
    else updateQuantity(id, next)
  }

  const handleCheckout = async (e) => {
    e.preventDefault()
    setError(null)
    if (!form.customer_name.trim() || !form.table_number.trim()) {
      setError('Nama dan nomor meja wajib diisi.')
      return
    }
    if (cart.length === 0) {
      setError('Keranjang kosong.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        customer_name: form.customer_name.trim(),
        table_number:  form.table_number.trim(),
        items: cart.map(i => ({ id_menu_item: i.id_menu_item, quantity: i.quantity })),
      }
      const res = await orderService.checkout(payload)
      clearCart()
      setSuccess(res.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat pesanan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <CustomerLayout>
        <div className="max-w-md mx-auto text-center py-16">
          <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pesanan Berhasil!</h2>
          <p className="text-gray-500 mb-1">Invoice: <span className="font-mono font-semibold text-gray-800">{success.invoice_number}</span></p>
          <p className="text-gray-500 mb-6">Pesananmu sedang diproses kasir.</p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors"
          >
            Pesan Lagi
          </button>
        </div>
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Keranjang</h1>

      {cart.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="mx-auto text-gray-300 mb-4" size={64} />
          <p className="text-gray-400 mb-4">Keranjang kosong</p>
          <button onClick={() => navigate('/menu')} className="text-orange-500 hover:underline font-medium">
            Lihat Menu
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {/* Item list */}
          <div className="md:col-span-2 space-y-3">
            {cart.map(item => (
              <div key={item.id_menu_item} className="bg-white rounded-xl p-4 flex items-center gap-3 shadow-sm">
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 text-sm">{item.name_menu}</p>
                  <p className="text-orange-500 text-sm">{formatRupiah(item.price)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleQtyChange(item.id_menu_item, -1, item.quantity)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100">
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center font-semibold text-sm">{item.quantity}</span>
                  <button onClick={() => handleQtyChange(item.id_menu_item, 1, item.quantity)} className="w-7 h-7 rounded-full border flex items-center justify-center hover:bg-gray-100">
                    <Plus size={14} />
                  </button>
                </div>
                <p className="w-24 text-right font-semibold text-sm">{formatRupiah(item.price * item.quantity)}</p>
                <button onClick={() => removeItem(item.id_menu_item)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Order form & summary */}
          <div className="bg-white rounded-xl shadow-sm p-5 h-fit">
            <h2 className="font-bold text-gray-800 mb-4">Detail Pemesanan</h2>
            <form onSubmit={handleCheckout} className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Nama Pemesan</label>
                <input
                  value={form.customer_name}
                  onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Nama kamu"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Nomor Meja</label>
                <input
                  value={form.table_number}
                  onChange={e => setForm(f => ({ ...f, table_number: e.target.value }))}
                  className="w-full mt-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                  placeholder="Meja 1"
                />
              </div>

              {error && <p className="text-red-500 text-xs bg-red-50 p-2 rounded-lg">{error}</p>}

              <div className="border-t pt-3 mt-2">
                <div className="flex justify-between font-bold text-gray-800">
                  <span>Total</span>
                  <span>{formatRupiah(totalPrice)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white py-2.5 rounded-xl font-semibold transition-colors"
              >
                {loading ? 'Memproses...' : '🛒 Pesan Sekarang'}
              </button>
            </form>
          </div>
        </div>
      )}
    </CustomerLayout>
  )
}
