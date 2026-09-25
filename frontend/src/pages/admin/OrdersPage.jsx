import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import OrderTable from '../../components/admin/OrderTable';
import { Badge, Card, Button } from '../../components/ui';
import { RefreshCw, Download, Calendar } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Toast } from '../../components/ui/Toast';

const TABS_ADMIN = [
  { label: 'Lunas', value: 'LUNAS' },
];

const TABS_CASHIER = [
  { label: 'Aktif (Pending)', value: 'PENDING' },
  { label: 'Riwayat (Lunas)', value: 'LUNAS' },
];

export default function OrdersPage() {
  const { user } = useAuth();
  const isCashier = user?.role === 'cashier';
  const TABS = isCashier ? TABS_CASHIER : TABS_ADMIN;
  
  const [tab, setTab] = useState(isCashier ? 'PENDING' : 'LUNAS');
  const prevPendingRef = useRef(null);
  const [newPending, setNewPending] = useState(false);

  // Date range states untuk admin
  const [dateStart, setDateStart] = useState(getTodayDate());
  const [dateEnd, setDateEnd] = useState(getTodayDate());
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

  const { data: counts } = useQuery({
    queryKey: ['order-counts'],
    queryFn: orderService.getCounts,
    refetchInterval: 5000,
  });

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['orders', tab],
    queryFn: () => orderService.getAll({ status: tab !== 'ALL' ? tab : undefined }),
    refetchInterval: 5000,
  });

  const orders = data?.orders ?? [];

  useEffect(() => {
    if (counts?.pending !== undefined) {
      if (prevPendingRef.current !== null && counts.pending > prevPendingRef.current) {
        setNewPending(true);
        setTimeout(() => setNewPending(false), 4000);
      }
      prevPendingRef.current = counts.pending;
    }
  }, [counts?.pending]);

  const handleDownloadExcel = async () => {
    if (!dateStart || !dateEnd) {
      setDownloadError('Pilih rentang tanggal terlebih dahulu');
      return;
    }
    if (new Date(dateEnd) < new Date(dateStart)) {
      setDownloadError('Tanggal akhir harus setelah tanggal mulai');
      return;
    }

    setDownloadLoading(true);
    setDownloadError(null);
    try {
      const response = await api.get('/orders/report/excel', {
        params: { date_start: dateStart, date_end: dateEnd },
        responseType: 'blob',
      });

      // Buat link download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Penjualan_${dateStart}_${dateEnd}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setDownloadError(err.response?.data?.message || 'Gagal download laporan');
    } finally {
      setDownloadLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg md:font-headline-lg-mobile md:text-headline-lg-mobile text-on-surface">
            {isCashier ? 'Pesanan' : 'Laporan Penjualan'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
            {isCashier ? 'Proses pembayaran pesanan pelanggan' : 'Kelola transaksi selesai dan buat laporan'}
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-space-sm px-space-lg py-space-md rounded-xl bg-surface-container-high hover:bg-surface-container text-on-surface-variant font-label-lg text-label-lg transition-all"
        >
          <RefreshCw size={18} className={isFetching ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">{isFetching ? 'Memperbarui...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats KPI — hanya kasir */}
      {isCashier && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-lg">
          <Card className="p-space-lg text-center">
            <p className="font-display-lg text-headline-lg text-on-surface">{counts?.total ?? '—'}</p>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mt-space-sm">Total Pesanan</p>
          </Card>
          <Card className="p-space-lg text-center relative">
            <p className="font-display-lg text-headline-lg text-tertiary">{counts?.pending ?? '—'}</p>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mt-space-sm">Pending</p>
            {newPending && <span className="absolute -top-2 -right-2 w-3 h-3 bg-error rounded-full animate-pulse" />}
          </Card>
          <Card className="p-space-lg text-center">
            <p className="font-display-lg text-headline-lg text-secondary">{counts?.lunas ?? '—'}</p>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mt-space-sm">Lunas</p>
          </Card>
        </div>
      )}

      {/* Admin: Date Range Picker + Download */}
      {!isCashier && (
        <Card className="p-space-lg">
          <div className="flex flex-col sm:flex-row gap-space-lg items-end">
            <div className="flex-1">
              <label className="block font-label-lg text-label-lg text-on-surface-variant mb-space-sm">
                <Calendar size={16} className="inline mr-space-sm" />
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full px-space-md py-space-md rounded-lg border border-outline bg-surface text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex-1">
              <label className="block font-label-lg text-label-lg text-on-surface-variant mb-space-sm">
                Tanggal Akhir
              </label>
              <input
                type="date"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full px-space-md py-space-md rounded-lg border border-outline bg-surface text-on-surface font-body-md text-body-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleDownloadExcel}
              disabled={downloadLoading}
              className="gap-space-sm"
            >
              <Download size={18} />
              <span className="hidden sm:inline">{downloadLoading ? 'Mengunduh...' : 'Unduh Excel'}</span>
              <span className="sm:hidden">{downloadLoading ? '...' : 'Excel'}</span>
            </Button>
          </div>
          {downloadError && (
            <p className="mt-space-md text-error font-body-sm text-body-sm">{downloadError}</p>
          )}
        </Card>
      )}

      {/* Tab Filter — kasir only */}
      {isCashier && (
        <div className="flex gap-space-sm bg-surface-container rounded-xl p-space-sm w-fit">
          {TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-space-lg py-space-md rounded-lg font-label-lg text-label-lg transition-all ${
                tab === t.value
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {t.label}
              {t.value === 'PENDING' && counts?.pending > 0 && (
                <span className="ml-space-sm bg-tertiary text-on-tertiary px-2 py-0.5 rounded-full font-label-md text-label-md inline-block">
                  {counts.pending}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="py-space-2xl text-center text-on-surface-variant font-body-md text-body-md">Memuat pesanan...</div>
        ) : orders.length === 0 ? (
          <div className="py-space-2xl text-center text-on-surface-variant font-body-md text-body-md">
            {isCashier ? 'Tidak ada pesanan' : 'Tidak ada transaksi dalam periode ini'}
          </div>
        ) : (
          <OrderTable orders={orders} />
        )}
      </Card>

      {downloadError && (
        <Toast
          title="Error"
          message={downloadError}
          type="error"
          onClose={() => setDownloadError(null)}
          duration={5000}
        />
      )}
    </div>
  );
}

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}
