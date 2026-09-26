import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../services/orderService';
import OrderTable from '../../components/admin/OrderTable';
import { Badge, Card, SearchInput } from '../../components/ui';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const TABS_ADMIN = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Lunas', value: 'LUNAS' },
];

const TABS_CASHIER = [
  { label: 'Aktif (Pending)', value: 'PENDING' },
  { label: 'Riwayat (Lunas)', value: 'LUNAS' },
];

export default function OrdersPage() {
  const { user } = useAuth();
  const isCashier = user?.role === 'cashier';
  
  // Kasir bisa beralih tab PENDING / LUNAS, Admin khusus Riwayat Transaksi (LUNAS)
  const [tab, setTab] = useState(isCashier ? 'PENDING' : 'LUNAS');
  const [search, setSearch] = useState('');
  const prevPendingRef = useRef(null);
  const [newPending, setNewPending] = useState(false);

  const { data: counts } = useQuery({
    queryKey: ['order-counts'],
    queryFn: orderService.getCounts,
    refetchInterval: 5000,
  });

  const activeStatus = isCashier ? (tab !== 'ALL' ? tab : undefined) : 'LUNAS';

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['orders', isCashier ? tab : 'LUNAS', search],
    queryFn: () => orderService.getAll({ 
      status: activeStatus,
      search: search || undefined,
    }),
    refetchInterval: 5000,
  });

  const orders = data?.orders ?? [];

  useEffect(() => {
    if (isCashier && counts?.pending !== undefined) {
      if (prevPendingRef.current !== null && counts.pending > prevPendingRef.current) {
        setNewPending(true);
        setTimeout(() => setNewPending(false), 4000);
      }
      prevPendingRef.current = counts.pending;
    }
  }, [counts?.pending, isCashier]);

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl flex flex-col gap-space-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline-lg text-headline-lg md:font-headline-lg-mobile md:text-headline-lg-mobile text-on-surface">
            {isCashier ? 'Pesanan & Kasir' : 'Riwayat Pesanan'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
            {isCashier
              ? 'Kelola antrean dan proses pembayaran pesanan pelanggan'
              : 'Daftar transaksi pelanggan yang telah selesai dan lunas'}
          </p>
        </div>
      </div>

      {/* Stats KPI */}
      {!isCashier ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
          <Card className="p-space-lg text-center">
            <p className="font-display-lg text-headline-lg text-secondary">{counts?.lunas ?? '—'}</p>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mt-space-sm">Transaksi Lunas Hari Ini</p>
          </Card>
          <Card className="p-space-lg text-center">
            <p className="font-display-lg text-headline-lg text-on-surface">{data?.total ?? '—'}</p>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mt-space-sm">Total Riwayat Transaksi</p>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-lg">
          <Card className="p-space-lg text-center relative">
            <p className="font-display-lg text-headline-lg text-tertiary">{counts?.pending ?? '—'}</p>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mt-space-sm">Pesanan Pending (Perlu Dibayar)</p>
            {newPending && <span className="absolute -top-2 -right-2 w-3 h-3 bg-error rounded-full animate-pulse" />}
          </Card>
          <Card className="p-space-lg text-center">
            <p className="font-display-lg text-headline-lg text-secondary">{counts?.lunas ?? '—'}</p>
            <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mt-space-sm">Pesanan Lunas Hari Ini</p>
          </Card>
        </div>
      )}

      {/* Tab Filter & Search */}
      <div className="flex flex-col md:flex-row gap-space-lg items-start md:items-center justify-between">
        {isCashier ? (
          <div className="flex gap-space-sm bg-surface-container rounded-xl p-space-sm w-fit">
            {TABS_CASHIER.map((t) => (
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
        ) : (
          <div className="flex items-center gap-space-sm py-space-sm">
            <Badge status="lunas" className="px-space-md py-space-sm text-label-lg font-semibold">
              ✓ Semua Transaksi Lunas
            </Badge>
          </div>
        )}

        <SearchInput
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari nama pelanggan atau nomor invoice..."
          className="w-full md:w-96"
        />
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="py-space-2xl text-center text-on-surface-variant font-body-md text-body-md">Memuat riwayat transaksi...</div>
        ) : (
          <OrderTable orders={orders} />
        )}
      </Card>
    </div>
  );
}
