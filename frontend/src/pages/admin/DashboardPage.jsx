// frontend/src/pages/admin/DashboardPage.jsx
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../../services/dashboardService'
import DashboardLayout from '../../layouts/DashboardLayout'
import StatCard from '../../components/admin/StatCard'
import RevenueChart from '../../components/admin/RevenueChart'
import LowStockAlert from '../../components/admin/LowStockAlert'
import { Banknote, Clock, CheckCircle } from 'lucide-react'

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, isError: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn:  dashboardService.getStats,
    refetchInterval: 30_000,
  })

  const { data: chartData = [], isLoading: chartLoading, isError: chartError } = useQuery({
    queryKey: ['dashboard-chart'],
    queryFn:  dashboardService.getChart,
    refetchInterval: 60_000,
  })

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {statsError ? (
          <div className="col-span-3 bg-red-50 text-red-600 text-sm p-4 rounded-xl">
            Gagal memuat statistik. Coba refresh halaman.
          </div>
        ) : (
          <>
            <StatCard
              label="Omset Hari Ini"
              value={statsLoading ? '...' : formatRupiah(stats?.revenue_today ?? 0)}
              icon={Banknote}
              color="green"
            />
            <StatCard
              label="Pesanan Pending"
              value={statsLoading ? '...' : stats?.pending_count ?? 0}
              icon={Clock}
              color="amber"
            />
            <StatCard
              label="Pesanan Lunas"
              value={statsLoading ? '...' : stats?.lunas_count ?? 0}
              icon={CheckCircle}
              color="blue"
            />
          </>
        )}
      </div>

      {/* Chart + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          {chartError ? (
            <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl">
              Gagal memuat grafik. Coba refresh halaman.
            </div>
          ) : chartLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-5 h-64 animate-pulse" />
          ) : (
            <RevenueChart chartData={chartData} />
          )}
        </div>
        <div>
          {statsLoading ? (
            <div className="bg-white rounded-xl shadow-sm p-5 h-64 animate-pulse" />
          ) : (
            <LowStockAlert items={stats?.low_stock ?? []} />
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
