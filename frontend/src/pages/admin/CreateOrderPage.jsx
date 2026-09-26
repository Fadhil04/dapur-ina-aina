import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { menuService } from '../../services/menuService';
import { orderService } from '../../services/orderService';
import { Button, Card, Modal, Toast, SearchInput, LoadingCardSkeleton, EmptyState } from '../../components/ui.js';
import { Plus, Minus, Trash2, ShoppingCart, CheckCircle, Package } from 'lucide-react';
import CategoryPills from '../../components/customer/CategoryPills';

import { formatRupiah } from '../../utils/format';

export default function CreateOrderPage() {
  const qc = useQueryClient();

  // Menu selection states
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [orderMode, setOrderMode] = useState('MEJA'); // MEJA | TAKEAWAY

  // Cart states
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: menuService.getCategories,
  });

  const { data: menuItems = [], isLoading, isError } = useQuery({
    queryKey: ['menu', { category: selectedCategory, search }],
    queryFn: () => menuService.getMenu({ category: selectedCategory, search: search || undefined }),
  });

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Tambah item ke cart
  const addToCart = (menu) => {
    const existing = cart.find(c => c.id_menu_item === menu.id_menu_item);
    if (existing) {
      setCart(cart.map(c =>
        c.id_menu_item === menu.id_menu_item
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, { ...menu, quantity: 1 }]);
    }
  };

  // Update quantity
  const updateQuantity = (id, qty) => {
    if (qty <= 0) {
      removeFromCart(id);
    } else {
      setCart(cart.map(c =>
        c.id_menu_item === id ? { ...c, quantity: qty } : c
      ));
    }
  };

  // Hapus dari cart
  const removeFromCart = (id) => {
    setCart(cart.filter(c => c.id_menu_item !== id));
  };

  // Validasi sebelum submit
  const validateOrder = () => {
    if (!customerName.trim()) {
      setError('Nama pelanggan wajib diisi');
      return false;
    }
    if (orderMode === 'MEJA' && !tableNumber.trim()) {
      setError('Nomor meja wajib diisi');
      return false;
    }
    if (cart.length === 0) {
      setError('Keranjang kosong, pilih menu terlebih dahulu');
      return false;
    }
    return true;
  };

  // Handle submit
  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        customer_name: customerName.trim(),
        table_number: orderMode === 'MEJA' ? tableNumber.trim() : 'TAKEAWAY',
        items: cart.map(i => ({ id_menu_item: i.id_menu_item, quantity: i.quantity })),
      };

      const res = await orderService.checkout(payload);
      setSuccess(res.data);
      
      // Clear form
      setCart([]);
      setCustomerName('');
      setTableNumber('');
      setShowConfirm(false);
      setLoading(false); // [FIX] reset loading setelah sukses

      // Invalidate orders cache
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order-counts'] });

      // Reset success setelah 3 detik — user bisa buat pesanan baru
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Gagal membuat pesanan';
      setError(errorMsg);
      setLoading(false);
      setShowConfirm(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Card className="max-w-md w-full p-space-2xl text-center">
          <div className="flex justify-center mb-space-xl">
            <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-on-secondary-container" />
            </div>
          </div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mb-space-lg">Pesanan Berhasil Dibuat!</h2>
          <div className="bg-surface-container rounded-xl p-space-lg mb-space-lg">
            <p className="font-label-md text-label-md text-on-surface-variant mb-space-sm">Invoice</p>
            <p className="font-display-lg text-headline-lg text-primary font-mono font-bold">{success.invoice_number}</p>
          </div>
          <div className="bg-surface-container rounded-xl p-space-lg mb-space-lg">
            <p className="font-label-md text-label-md text-on-surface-variant mb-space-sm">Total</p>
            <p className="font-display-lg text-headline-lg text-secondary font-bold">{formatRupiah(success.total_amount)}</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setSuccess(null)}
            className="w-full"
          >
            Buat Pesanan Baru
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl flex flex-col gap-space-lg">
      {/* Header */}
      <div>
        <h1 className="font-headline-lg text-headline-lg md:font-headline-lg-mobile md:text-headline-lg-mobile text-on-surface">Buat Pesanan</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">Input pesanan pelanggan secara langsung</p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-space-md bg-surface-container rounded-xl p-space-sm w-fit">
        {['MEJA', 'TAKEAWAY'].map((m) => (
          <button
            key={m}
            onClick={() => {
              setOrderMode(m);
              setTableNumber('');
            }}
            className={`px-space-lg py-space-md rounded-lg font-label-lg text-label-lg transition-all ${
              orderMode === m
                ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {m === 'MEJA' ? '🪑 Meja' : '📦 Take Away'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        {/* Menu Selection */}
        <div className="lg:col-span-2 space-y-space-lg">
          <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari menu..." />
          <CategoryPills categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

          {/* Menu Grid */}
          {isLoading ? (
            <LoadingCardSkeleton count={8} />
          ) : isError ? (
            <EmptyState title="Gagal Memuat" description="Terjadi kesalahan saat memuat menu." />
          ) : menuItems.length === 0 ? (
            <EmptyState title="Menu Tidak Ditemukan" description="Coba ubah filter atau cari dengan kata kunci lain." />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-space-lg">
              {menuItems.map((menu) => {
                const outOfStock = menu.stock <= 0;
                const lowStock = menu.stock <= 5 && menu.stock > 0;
                return (
                  <Card key={menu.id_menu_item} className={`flex flex-col overflow-hidden transition-transform hover:-translate-y-1 ${outOfStock ? 'opacity-60' : ''}`}>
                    {/* Gambar Menu */}
                    {menu.image_url ? (
                      <div className="w-full h-32 overflow-hidden bg-surface-container">
                        <img 
                          src={menu.image_url} 
                          alt={menu.name_menu}
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gradient-to-br from-surface-container to-surface-container-high flex items-center justify-center">
                        <Package size={40} className="text-on-surface-variant opacity-30" />
                      </div>
                    )}
                    
                    <div className="p-space-lg flex flex-col flex-1">
                      <div className="flex justify-between items-start gap-space-md mb-space-sm">
                        <h3 className="font-title-md text-title-md text-on-surface line-clamp-2 flex-1">{menu.name_menu}</h3>
                        {lowStock && <span className="text-label-sm font-label-sm text-red bg-white-container px-1.5 py-0.5 rounded whitespace-nowrap">Sisa {menu.stock}</span>}
                        {outOfStock && <span className="text-label-sm font-label-sm text-error bg-error-container px-1.5 py-0.5 rounded whitespace-nowrap">Habis</span>}
                      </div>
                      <p className="font-currency-md text-currency-md text-primary mb-space-sm">{formatRupiah(menu.price)}</p>
                      <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1">
                        <Package size={12} /> Stok: {menu.stock}
                      </p>
                      <div className="flex-1" />
                      {outOfStock ? (
                        <div className="mt-space-md px-space-md py-space-sm rounded-lg bg-error-container text-on-error-container text-center font-label-md text-label-md">
                          Stok Habis
                        </div>
                      ) : (
                        <Button
                          variant="primary"
                          onClick={() => addToCart(menu)}
                          className="mt-space-md w-full gap-space-xs"
                        >
                          <Plus size={16} /> Tambah
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart & Checkout */}
        <Card className="p-space-lg h-fit flex flex-col gap-space-lg sticky top-24">
          <div>
            <h2 className="font-title-lg text-title-lg text-on-surface">Keranjang</h2>
            <p className="font-label-md text-label-md text-on-surface-variant mt-space-xs">
              {cart.length} item
            </p>
          </div>

          {cart.length === 0 ? (
            <div className="text-center py-space-2xl text-on-surface-variant font-body-sm">
              <ShoppingCart size={32} className="mx-auto mb-space-md opacity-50" />
              <p>Keranjang kosong</p>
            </div>
          ) : (
            <div className="space-y-space-md max-h-64 overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id_menu_item} className="flex gap-space-md items-center bg-surface-container rounded-lg p-space-md">
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-body-md text-on-surface line-clamp-1">{item.name_menu}</p>
                    <p className="font-label-md text-label-md text-on-surface-variant">{formatRupiah(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-space-xs bg-surface-container-low rounded-lg px-space-xs py-space-xs">
                    <button
                      onClick={() => updateQuantity(item.id_menu_item, item.quantity - 1)}
                      className="p-1 hover:bg-surface-container-high transition-colors"
                    >
                      <Minus size={14} className="text-on-surface-variant" />
                    </button>
                    <span className="w-5 text-center font-label-lg text-on-surface">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id_menu_item, item.quantity + 1)}
                      className="p-1 hover:bg-surface-container-high transition-colors"
                    >
                      <Plus size={14} className="text-on-surface-variant" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id_menu_item)}
                    className="p-1 hover:bg-error-container text-on-surface-variant hover:text-error transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-outline-variant pt-space-lg space-y-space-lg">
            {/* Form */}
            <div>
              <label className="font-label-lg text-label-lg text-on-surface block mb-space-sm">Nama Pelanggan</label>
              <input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-space-md py-space-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all bg-surface-container-low"
                placeholder="Nama kustomer"
              />
            </div>

            {orderMode === 'MEJA' && (
              <div>
                <label className="font-label-lg text-label-lg text-on-surface block mb-space-md">
                  Nomor Meja
                </label>
                <input
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  className="w-full px-space-md py-space-sm border border-outline-variant rounded-lg font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all bg-surface-container-low"
                  placeholder="Contoh: Meja 5"
                />
              </div>
            )}

            {error && (
              <div className="bg-error-container text-on-error-container text-body-sm font-body-sm px-space-md py-space-sm rounded-lg border border-error animate-fade-in">
                {error}
              </div>
            )}

            {/* Total */}
            <div className="border-t border-outline-variant pt-space-lg">
              <div className="flex justify-between mb-space-lg">
                <span className="font-label-lg text-on-surface-variant">Total</span>
                <span className="font-display-lg text-primary font-bold">{formatRupiah(totalPrice)}</span>
              </div>

              <Button
                variant="primary"
                onClick={() => {
                  if (validateOrder()) {
                    setShowConfirm(true);
                  }
                }}
                disabled={loading || cart.length === 0}
                className="w-full"
              >
                {loading ? 'Memproses...' : 'Buat Pesanan'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Konfirmasi Modal */}
      <Modal
        isOpen={showConfirm}
        title="Konfirmasi Pesanan"
        onClose={() => setShowConfirm(false)}
      >
        <div className="space-y-space-lg">
          <div className="bg-surface-container rounded-xl p-space-lg space-y-space-md">
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant">Nama</p>
              <p className="font-body-md text-body-md text-on-surface">{customerName}</p>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant">
                {orderMode === 'MEJA' ? 'Meja' : 'Info'}
              </p>
              <p className="font-body-md text-body-md text-on-surface">{tableNumber}</p>
            </div>
            <div>
              <p className="font-label-md text-label-md text-on-surface-variant">Total Item</p>
              <p className="font-body-md text-body-md text-on-surface">{cart.length} item</p>
            </div>
            <div className="border-t border-outline-variant pt-space-md">
              <p className="font-label-md text-label-md text-on-surface-variant">Total Harga</p>
              <p className="font-display-lg text-primary font-bold">{formatRupiah(totalPrice)}</p>
            </div>
          </div>

          <div className="flex gap-space-md">
            <Button
              variant="neutral"
              onClick={() => setShowConfirm(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Membuat...' : 'Konfirmasi'}
            </Button>
          </div>
        </div>
      </Modal>

      {error && (
        <Toast
          title="Error"
          message={error}
          type="error"
          onClose={() => setError(null)}
          duration={5000}
        />
      )}
    </div>
  );
}
