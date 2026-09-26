import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';
import { KpiCard } from '../../components/ui/KpiCard';
import RevenueChart from '../../components/admin/RevenueChart';
import LowStockAlert from '../../components/admin/LowStockAlert';
import { Banknote, Clock, CheckCircle, TrendingUp, Download, Calendar } from 'lucide-react';
import { Card, LoadingSkeleton, Button } from '../../components/ui';
import { useState } from 'react';
import api from '../../services/api';
import { Toast } from '../../components/ui/Toast';

import { formatRupiah } from '../../utils/format';

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

export default function DashboardPage() {
  const [dateStart, setDateStart] = useState(getTodayDate());
  const [dateEnd, setDateEnd] = useState(getTodayDate());
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadError, setDownloadError] = useState(null);

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

      {/* Laporan Penjualan Section */}
      <Card className="p-space-lg">
        <h2 className="font-headline-md text-headline-md text-on-surface mb-space-lg">Unduh Laporan Penjualan</h2>
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
            className="gap-space-sm whitespace-nowrap"
          >
            <Download size={18} />
            <span className="hidden sm:inline">{downloadLoading ? 'Mengunduh...' : 'Unduh Excel'}</span>
            <span className="sm:hidden">{downloadLoading ? '...' : 'Excel'}</span>
          </Button>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-md">
          Laporan mencakup semua transaksi yang sudah selesai (LUNAS) dalam rentang tanggal yang dipilih.
        </p>
        {downloadError && (
          <p className="mt-space-md text-error font-body-sm text-body-sm">{downloadError}</p>
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
