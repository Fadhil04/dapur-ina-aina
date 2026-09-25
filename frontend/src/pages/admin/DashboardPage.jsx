import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';
import { KpiCard } from '../../components/ui/KpiCard';
import RevenueChart from '../../components/admin/RevenueChart';
import LowStockAlert from '../../components/admin/LowStockAlert';
import { Banknote, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { Card, LoadingSkeleton } from '../../components/ui';

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.getStats,
    refetchInterval: 30_000,
  });

  const { data: chartData = [], isLoading: chartLoading, isError: chartError } = useQuery({
    queryKey: ['dashboard-chart'],
    queryFn: dashboardService.getChart,
    refetchInterval: 60_000,
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl flex flex-col gap-space-lg">
      <div>
        <h1 className="font-headline-lg text-headline-lg md:font-headline-lg-mobile md:text-headline-lg-mobile text-on-surface">Dashboard</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">Ringkasan performa penjualan hari ini</p>
      </div>

      {/* KPI Cards */}
      {statsError ? (
        <Card className="p-space-lg bg-error-container text-on-error-container border border-error">
          <p className="font-body-md text-body-md">Gagal memuat statistik. Coba refresh halaman.</p>
        </Card>
      ) : statsLoading ? (
        <LoadingSkeleton rows={1} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-lg">
          <KpiCard
            label="Omset Hari Ini"
            value={formatRupiah(stats?.revenue_today ?? 0)}
            icon={Banknote}
            trend={stats?.revenue_growth ? `+${stats.revenue_growth}%` : ''}
            iconColor="primary"
          />
          <KpiCard
            label="Pesanan Pending"
            value={stats?.pending_count ?? 0}
            icon={Clock}
            iconColor="tertiary"
          />
          <KpiCard
            label="Pesanan Lunas"
            value={stats?.lunas_count ?? 0}
            icon={CheckCircle}
            iconColor="secondary"
          />
          <KpiCard
            label="Menu Terlaris"
            value={stats?.top_menu?.name_menu || '—'}
            icon={TrendingUp}
            trend={`${stats?.top_menu?.sold_qty || 0} sold`}
            iconColor="primary"
          />
        </div>
      )}

      {/* Chart + Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
        <div className="lg:col-span-2">
          {chartError ? (
            <Card className="p-space-lg bg-error-container text-on-error-container border border-error">
              <p className="font-body-md text-body-md">Gagal memuat grafik. Coba refresh halaman.</p>
            </Card>
          ) : chartLoading ? (
            <Card className="h-80 animate-pulse" />
          ) : (
            <RevenueChart chartData={chartData} />
          )}
        </div>
        <div>
          {statsLoading ? (
            <Card className="h-80 animate-pulse" />
          ) : (
            <LowStockAlert items={stats?.low_stock ?? []} />
          )}
        </div>
      </div>
    </div>
  );
}
