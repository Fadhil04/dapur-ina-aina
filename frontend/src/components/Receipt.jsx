import { Printer, X } from 'lucide-react';
import { formatRupiah, formatDate } from '../utils/format';

export function Receipt({ order, payment }) {
  const isLunas = order.status === 'LUNAS' || payment;
  const paymentMethod = payment?.payment_method || order.payment?.payment_method;
  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handlePrint = () => {
    document.body.classList.add('has-print-receipt');
    window.print();
    // Bersihkan class setelah dialog print ditutup
    setTimeout(() => {
      document.body.classList.remove('has-print-receipt');
    }, 1000);
  };

  return (
    <div className="w-full">
      {/* Preview Container - Web View */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-outline-variant/30">
        {/* Struk Content - 80mm thermal width */}
        <div 
          id="receipt-print-area"
          className="mx-auto bg-white p-4"
          style={{ width: '320px', fontFamily: 'monospace', fontSize: '11px', lineHeight: '1.4' }}
        >
          {/* HEADER */}
          <div className="text-center border-b border-gray-800 pb-2 mb-2">
            <div className="text-xl font-bold mb-1">🍳 DAPUR INA AINA</div>
            <div className="text-xs text-gray-600">Restoran & Café</div>
            <div className="text-xs text-gray-600">Struk Pembayaran</div>
          </div>

          {/* INVOICE & TIME */}
          <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
            <div className="flex justify-between text-xs">
              <span>Invoice:</span>
              <span className="font-bold">{order.invoice_number}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Tanggal:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
          </div>

          {/* CUSTOMER INFO */}
          <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
            <div className="flex justify-between text-xs">
              <span>Pelanggan:</span>
              <span className="font-bold">{order.customer_name}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>{order.table_number === 'TAKEAWAY' ? 'Tipe:' : 'Meja:'}</span>
              <span>
                {order.table_number === 'TAKEAWAY' ? '📦 Take Away' : `Meja ${order.table_number}`}
              </span>
            </div>
          </div>

          {/* ITEMS HEADER */}
          <div className="border-b border-gray-800 pb-1 mb-1 text-xs font-bold">
            <div className="flex justify-between">
              <span style={{ width: '60%' }}>Item</span>
              <span style={{ width: '15%' }} className="text-center">Qty</span>
              <span style={{ width: '25%' }} className="text-right">Subtotal</span>
            </div>
          </div>

          {/* ITEMS */}
          <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
            {order.items?.map((item) => (
              <div key={item.id_order_item} className="text-xs mb-1">
                <div className="flex justify-between">
                  <span style={{ width: '60%' }} className="break-words">{item.name_menu}</span>
                  <span style={{ width: '15%' }} className="text-center">{item.quantity}x</span>
                  <span style={{ width: '25%' }} className="text-right">{formatRupiah(item.subtotal)}</span>
                </div>
              </div>
            ))}
            <div className="text-xs text-gray-600 mt-1">
              Total {totalItems} item(s)
            </div>
          </div>

          {/* TOTALS */}
          <div className="border-b border-gray-800 pb-2 mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span>Subtotal:</span>
              <span>{formatRupiah(order.total_amount)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm">
              <span>TOTAL:</span>
              <span>{formatRupiah(order.total_amount)}</span>
            </div>
          </div>

          {/* PAYMENT INFO */}
          {isLunas && (
            <div className="border-b border-dashed border-gray-400 pb-2 mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span>Metode Bayar:</span>
                <span className="font-bold">
                  {paymentMethod === 'TUNAI' ? '💵 TUNAI' :
                   paymentMethod === 'DEBIT' ? '💳 DEBIT' :
                   paymentMethod === 'KREDIT' ? '💳 KREDIT' :
                   paymentMethod === 'QRIS' ? '📱 QRIS' : paymentMethod}
                </span>
              </div>
              {paymentMethod === 'TUNAI' && (
                <>
                  <div className="flex justify-between text-xs">
                    <span>Dibayar:</span>
                    <span>{formatRupiah(payment?.cash_received || order.payment?.cash_received || 0)}</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-green-600">
                    <span>Kembalian:</span>
                    <span>{formatRupiah(payment?.change_amount || order.payment?.change_amount || 0)}</span>
                  </div>
                </>
              )}
              <div className="text-xs text-green-600 font-bold mt-1">
                ✓ PEMBAYARAN LUNAS
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="text-center border-t border-gray-800 pt-2">
            <div className="text-xs font-bold mb-1">Terima Kasih!</div>
            <div className="text-xs text-gray-600 mb-2">Selamat menikmati pesanan Anda</div>
            <div className="text-xs text-gray-600">
              {new Date().toLocaleTimeString('id-ID')}
            </div>
          </div>
        </div>

        {/* Print Button - Visible in Web, Hidden in Print */}
        <div className="bg-gray-50 p-4 border-t border-gray-200 flex gap-2 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2.5 rounded-lg font-label-lg hover:opacity-90 active:scale-[0.99] transition-all shadow-sm"
          >
            <Printer size={20} /> Cetak Struk
          </button>
        </div>
      </div>
    </div>
  );
}
