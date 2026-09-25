import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import { calculateChange } from '../../utils/billing';
import { CheckCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, Button, Modal, Toast } from '../../components/ui';
import { Receipt } from '../../components/Receipt';

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function formatDate(d) {
  return new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
}

const PAYMENT_METHODS = [
  { id: 'TUNAI', label: '💵 Tunai' },
  { id: 'DEBIT', label: '💳 Debit' },
  { id: 'KREDIT', label: '💳 Kredit' },
  { id: 'QRIS', label: '📱 QRIS' },
];

export default function BillingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getById(id),
  });

  // Payment states
  const [method, setMethod] = useState('TUNAI');
  const [amountPaid, setAmountPaid] = useState('');
  const [cardType, setCardType] = useState('');
  const [lastFour, setLastFour] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const change = method === 'TUNAI' ? calculateChange(amountPaid, order?.total_amount) : 0;

  const handleMethodChange = (m) => {
    setMethod(m);
    setAmountPaid('');
    setError(null);
  };

  // Validasi sebelum konfirmasi
  const validatePayment = () => {
    if (method === 'TUNAI') {
      if (!amountPaid || change < 0) {
        setError('Nominal uang harus >= total tagihan');
        return false;
      }
    }
    return true;
  };

  const handlePay = async () => {
    if (!validatePayment()) return;
    
    setError(null);
    setLoading(true);
    try {
      const payload = {
        payment_method: method,
        amount_paid: method === 'TUNAI' ? Number(amountPaid) : order.total_amount,
        card_type: cardType || undefined,
        last_four: lastFour || undefined,
        reference_no: referenceNo || undefined,
      };
      
      const res = await orderService.pay(id, payload);
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['order-counts'] });
      qc.invalidateQueries({ queryKey: ['order', id] });
      setSuccessData(res.data);
      setShowConfirm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memproses pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading)
    return (
      <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl">
        <div className="py-20 text-center text-on-surface-variant font-body-md text-body-md">Memuat data pesanan...</div>
      </div>
    );

  if (isError || !order)
    return (
      <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl">
        <div className="py-20 text-center text-error font-body-md text-body-md">Pesanan tidak ditemukan.</div>
      </div>
    );

  const isLunas = order.status === 'LUNAS' || successData;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl">
      <div className="max-w-2xl">
        <button
          onClick={() => navigate('/orders')}
          className="flex items-center gap-space-md text-label-lg text-on-surface-variant hover:text-on-surface mb-space-lg transition-colors"
        >
          <ArrowLeft size={18} /> Kembali ke Pesanan
        </button>

        {/* Struk — hanya tampil setelah bayar sukses */}
        {successData && <Receipt order={order} payment={successData} />}

        {/* Form pembayaran — hanya jika belum LUNAS */}
        {!isLunas && (
          <Card className="p-space-lg">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-space-lg">Proses Pembayaran</h3>

            {/* Pilihan metode */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-space-md mb-space-lg">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleMethodChange(m.id)}
                  className={`py-space-md px-space-sm rounded-xl text-label-lg font-label-lg border-2 transition-all ${
                    method === m.id
                      ? 'bg-primary-container text-on-primary-container border-primary'
                      : 'border-outline-variant text-on-surface-variant hover:border-outline'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Input nominal — hanya TUNAI */}
            {method === 'TUNAI' && (
              <div className="mb-space-lg">
                <label className="font-label-lg text-label-lg text-on-surface block mb-space-md">
                  Nominal Dibayar
                  <span className="ml-space-sm text-body-sm text-on-surface-variant">(min. {formatRupiah(order.total_amount)})</span>
                </label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-space-lg py-space-md border border-outline-variant rounded-xl text-body-lg font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all bg-surface-container-low"
                  placeholder={String(order.total_amount)}
                  min={order.total_amount}
                />
                {amountPaid && (
                  <p className={`mt-space-md text-body-md font-bold ${change >= 0 ? 'text-secondary' : 'text-error'}`}>
                    {change >= 0
                      ? `✅ Kembalian: ${formatRupiah(change)}`
                      : `❌ Kurang: ${formatRupiah(Math.abs(change))}`
                    }
                  </p>
                )}
              </div>
            )}

            {/* Info box non-tunai — hanya untuk pendataan */}
            {method !== 'TUNAI' && (
              <div className="mb-space-lg p-space-lg bg-secondary-container rounded-xl border-l-4 border-secondary flex gap-space-md">
                <AlertCircle size={20} className="text-on-secondary-container shrink-0 mt-space-xs" />
                <div className="text-body-sm font-body-sm text-on-secondary-container">
                  Total <strong>{formatRupiah(order.total_amount)}</strong> akan dicatat sebagai pembayaran <strong>{method}</strong>.
                </div>
              </div>
            )}

            {error && (
              <div className="text-on-error-container text-body-sm font-body-sm bg-error-container px-space-lg py-space-md rounded-xl border border-error mb-space-lg">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              onClick={() => {
                if (validatePayment()) {
                  setShowConfirm(true);
                }
              }}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Memproses...' : `Lanjutkan ke Konfirmasi`}
            </Button>
          </Card>
        )}

        {/* Panel sukses setelah bayar */}
        {isLunas && (
          <Card className="p-space-lg text-center bg-secondary-container border-2 border-secondary">
            <CheckCircle className="mx-auto text-secondary mb-space-lg" size={48} />
            <p className="font-headline-md text-headline-md text-on-secondary-container mb-space-md">Pembayaran Berhasil!</p>
            {successData && (
              <p className="text-body-md text-on-secondary-container-variant mb-space-lg">
                Invoice: <span className="font-mono font-bold text-on-secondary-container">{successData.invoice_number}</span>
              </p>
            )}
            <div className="flex gap-space-md justify-center flex-wrap">
              <Button
                variant="neutral"
                onClick={() => window.print()}
                className="gap-space-sm"
              >
                <Printer size={18} /> Cetak Struk
              </Button>
              <Button
                variant="primary"
                onClick={() => navigate('/orders')}
              >
                Pesanan Berikutnya
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Konfirmasi Modal */}
      <Modal
        isOpen={showConfirm}
        title="Konfirmasi Pembayaran"
        onClose={() => setShowConfirm(false)}
      >
        <div className="space-y-space-lg">
          <div className="bg-surface-container rounded-xl p-space-lg">
            <div className="grid grid-cols-2 gap-space-md text-body-md font-body-md">
              <div>
                <p className="text-on-surface-variant">Metode Bayar</p>
                <p className="font-bold text-on-surface">{method}</p>
              </div>
              <div className="text-right">
                <p className="text-on-surface-variant">Total</p>
                <p className="font-bold text-primary text-headline-sm">{formatRupiah(order.total_amount)}</p>
              </div>

              {method === 'TUNAI' && (
                <>
                  <div>
                    <p className="text-on-surface-variant">Nominal Uang</p>
                    <p className="font-bold text-on-surface">{formatRupiah(amountPaid)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-on-surface-variant">Kembalian</p>
                    <p className="font-bold text-secondary">{formatRupiah(change)}</p>
                  </div>
                </>
              )}


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
              onClick={handlePay}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Memproses...' : 'Konfirmasi Bayar'}
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
