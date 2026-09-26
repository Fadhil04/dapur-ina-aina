import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { orderService } from '../../services/orderService';
import { Trash2, Plus, Minus, CheckCircle } from 'lucide-react';
import { Button, Card, EmptyState, Toast } from '../../components/ui';
import { formatRupiah } from '../../utils/format';

export default function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart, totalPrice } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({ customer_name: '', table_number: '' });
  const [orderType, setOrderType] = useState('DINE_IN'); // DINE_IN atau TAKEAWAY
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleQtyChange = (id, delta, current) => {
    const next = current + delta;
    if (next <= 0) removeItem(id);
    else updateQuantity(id, next);
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setError(null);
    if (!form.customer_name.trim()) {
      setError('Nama wajib diisi.');
      return;
    }
    if (orderType === 'DINE_IN' && !form.table_number.trim()) {
      setError('Nomor meja wajib diisi untuk Dine In.');
      return;
    }
    if (cart.length === 0) {
      setError('Keranjang kosong.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        customer_name: form.customer_name.trim(),
        table_number: orderType === 'DINE_IN' ? form.table_number.trim() : null,
        order_type: orderType,
        items: cart.map((i) => ({ id_menu_item: i.id_menu_item, quantity: i.quantity })),
      };
      const res = await orderService.checkout(payload);
      clearCart();
      setSuccess(res.data);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal membuat pesanan. Coba lagi.';
      setError(errorMsg);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="max-w-md w-full p-space-2xl">
          {/* Success Icon */}
          <div className="flex justify-center mb-space-xl">
            <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-on-secondary-container" />
            </div>
          </div>

          {/* Main Message */}
          <h2 className="font-headline-lg text-headline-lg text-on-surface text-center mb-space-lg">Pesanan Berhasil Dibuat!</h2>

          {/* Invoice Number - Prominent */}
          <div className="bg-surface-container rounded-xl p-space-lg mb-space-lg text-center">
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-space-sm">Nomor Invoice</p>
            <p className="font-display-lg text-headline-lg text-primary font-bold font-mono">{success.invoice_number}</p>
          </div>

          {/* Amount */}
          <div className="text-center mb-space-lg">
            <p className="font-body-md text-body-md text-on-surface-variant mb-space-sm">Total Tagihan</p>
            <p className="font-display-lg text-headline-lg text-on-surface">{formatRupiah(success.total_amount)}</p>
          </div>

          {/* Instructions Card */}
          <div className="bg-tertiary-fixed rounded-xl p-space-lg mb-space-xl border-l-4 border-tertiary">
            <h3 className="font-title-md text-title-md text-on-tertiary-fixed-variant font-bold mb-space-md">📍 Langkah Selanjutnya:</h3>
            <ol className="space-y-space-sm font-body-md text-body-md text-on-tertiary-fixed-variant">
              <li className="flex gap-space-md">
                <span className="font-bold shrink-0">1.</span>
                <span>Pergi ke <strong>Meja Kasir</strong> dengan nomor invoice di atas</span>
              </li>
              <li className="flex gap-space-md">
                <span className="font-bold shrink-0">2.</span>
                <span>Tunjukkan nomor invoice ke kasir</span>
              </li>
              <li className="flex gap-space-md">
                <span className="font-bold shrink-0">3.</span>
                <span>Lakukan pembayaran sesuai total tagihan</span>
              </li>
              <li className="flex gap-space-md">
                <span className="font-bold shrink-0">4.</span>
                <span>Tunggu pesanan Anda di meja makan</span>
              </li>
            </ol>
          </div>

          {/* Info Message */}
          <div className="bg-surface-container rounded-xl p-space-lg mb-space-xl text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              ✨ Pesanan Anda telah dicatat. Kasir akan segera memproses pembayaran dan dapur akan menyiapkan makanan Anda.
            </p>
          </div>

          {/* Action Button */}
          <Button 
            variant="primary" 
            onClick={() => {
              navigate('/menu');
              // Clear success state untuk next order
            }} 
            className="w-full"
          >
            Pesan Lagi
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl flex flex-col gap-space-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg md:font-headline-lg-mobile md:text-headline-lg-mobile text-on-surface">Keranjang Pesanan</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
          {cart.length > 0 ? `${cart.length} item dalam keranjang` : 'Keranjang Anda kosong'}
        </p>
      </div>

      {cart.length === 0 ? (
        <EmptyState
          title="Keranjang Kosong"
          description="Belum ada menu yang dipilih. Kembali ke halaman menu untuk memulai pesanan."
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
          {/* Item List */}
          <div className="lg:col-span-2 flex flex-col gap-space-lg">
            <div className="space-y-space-md">
              {cart.map((item) => (
                <Card key={item.id_menu_item} className="p-space-lg flex items-center gap-space-lg justify-between">
                  <div className="flex-1">
                    <h3 className="font-title-md text-title-md text-on-surface">{item.name_menu}</h3>
                    <p className="font-currency-md text-currency-md text-primary mt-space-xs">{formatRupiah(item.price)}</p>
                  </div>

                  <div className="flex items-center gap-space-md bg-surface-container rounded-xl p-space-xs">
                    <button
                      onClick={() => handleQtyChange(item.id_menu_item, -1, item.quantity)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center font-label-lg text-label-lg text-on-surface">{item.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(item.id_menu_item, 1, item.quantity)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-container-high transition-colors text-on-surface-variant"
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <div className="text-right min-w-max">
                    <p className="font-currency-md text-currency-md text-on-surface">{formatRupiah(item.price * item.quantity)}</p>
                  </div>

                  <button
                    onClick={() => removeItem(item.id_menu_item)}
                    className="p-2 rounded-lg hover:bg-error-container text-on-surface-variant hover:text-error transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </Card>
              ))}
            </div>
          </div>

          {/* Form & Summary */}
          <Card className="p-space-lg h-fit flex flex-col gap-space-lg sticky top-24">
            <div>
              <h2 className="font-title-lg text-title-lg text-on-surface">Detail Pemesanan</h2>
            </div>

            <form onSubmit={handleCheckout} className="space-y-space-lg">
              {/* Order Type Toggle */}
              <div>
                <label className="font-label-lg text-label-lg text-on-surface block mb-space-sm">Jenis Pesanan</label>
                <div className="flex gap-space-md">
                  <button
                    type="button"
                    onClick={() => setOrderType('DINE_IN')}
                    className={`flex-1 py-space-md rounded-xl font-label-md transition-all ${
                      orderType === 'DINE_IN'
                        ? 'bg-primary text-on-primary border-2 border-primary'
                        : 'bg-surface-container text-on-surface-variant border-2 border-outline-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Dine In
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType('TAKEAWAY')}
                    className={`flex-1 py-space-md rounded-xl font-label-md transition-all ${
                      orderType === 'TAKEAWAY'
                        ? 'bg-primary text-on-primary border-2 border-primary'
                        : 'bg-surface-container text-on-surface-variant border-2 border-outline-variant hover:bg-surface-container-high'
                    }`}
                  >
                    Takeaway
                  </button>
                </div>
              </div>

              <div>
                <label className="font-label-lg text-label-lg text-on-surface block mb-space-sm">Nama Pemesan</label>
                <input
                  value={form.customer_name}
                  onChange={(e) => setForm((f) => ({ ...f, customer_name: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded-xl font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all bg-surface-container-low"
                  placeholder="Nama kamu"
                  required
                />
              </div>

              {orderType === 'DINE_IN' && (
                <div>
                  <label className="font-label-lg text-label-lg text-on-surface block mb-space-sm">Nomor Meja</label>
                  <input
                    value={form.table_number}
                    onChange={(e) => setForm((f) => ({ ...f, table_number: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded-xl font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all bg-surface-container-low"
                    placeholder="Contoh: Meja 5"
                    required={orderType === 'DINE_IN'}
                  />
                </div>
              )}

              {error && (
                <div className="bg-error-container text-on-error-container text-body-sm font-body-sm px-space-md py-space-md rounded-xl border border-error animate-fade-in">
                  {error}
                </div>
              )}

              <div className="border-t border-outline-variant pt-space-lg">
                <div className="flex justify-between mb-space-lg">
                  <span className="font-label-lg text-label-lg text-on-surface-variant">Subtotal</span>
                  <span className="font-currency-md text-currency-md text-on-surface">{formatRupiah(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-title-lg text-title-lg text-on-surface">Total</span>
                  <span className="font-display-lg text-headline-lg text-primary">{formatRupiah(totalPrice)}</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={loading || cart.length === 0}
                className="w-full flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⟳</span>
                    Memproses...
                  </>
                ) : 'Pesan Sekarang'}
              </Button>

              <Button
                type="button"
                variant="neutral"
                onClick={() => navigate('/menu')}
                className="w-full"
              >
                Lanjut Belanja
              </Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
