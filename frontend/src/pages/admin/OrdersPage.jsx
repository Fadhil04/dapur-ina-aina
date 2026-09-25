// frontend/src/pages/admin/OrdersPage.jsx
import { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orderService } from '../../services/orderService'
import DashboardLayout from '../../layouts/DashboardLayout'
import OrderTable from '../../components/admin/OrderTable'
import { RefreshCw } from 'lucide-react'

const TABS = [
  { label: 'Semua', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Lunas', value: 'LUNAS' },
]

export default function OrdersPage() {
  const [tab, setTab] = useState('ALL')
  const prevPendingRef = useRef(null)
  const [newPending, setNewPending] = useState(false)

  const { data: counts } = useQuery({
    queryKey: ['order-counts'],
    queryFn:  orderService.getCounts,
    refetchInterval: 5000,
  })

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['orders', tab],
    queryFn:  () => orderService.getAll({ status: tab !== 'ALL' ? tab : undefined }),
    refetchInterval: 5000,
  })

  const orders = data?.orders ?? []

  // Badge notifikasi jika pending bertambah
  useEffect(() => {
    if (counts?.pending !== undefined) {
      if (prevPendingRef.current !== null && counts.pending > prevPendingRef.current) {
        setNewPending(true)
        setTimeout(() => setNewPending(false), 4000)
      }
      prevPendingRef.current = counts.pending
    }
  }, [counts?.pending])

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pesanan</h1>
        <button onClick={() => refetch()} className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 transition-colors">
          {/* [UX-02 FIX] animate-spin pada icon, bukan pada button */}
          <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
          <span className="hidden sm:inline">{isFetching ? 'Memperbarui...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-gray-800">{counts?.total ?? '—'}</p>
          <p className="text-xs text-gray-400 mt-1">Total</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-4 shadow-sm text-center relative">
          <p className="text-2xl font-bold text-amber-600">{counts?.pending ?? '—'}</p>
          <p className="text-xs text-amber-400 mt-1">Pending</p>
          {newPending && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          )}
        </div>
        <div className="bg-green-50 rounded-xl p-4 shadow-sm text-center">
          <p className="text-2xl font-bold text-green-600">{counts?.lunas ?? '—'}</p>
          <p className="text-xs text-green-400 mt-1">Lunas</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              tab === t.value ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
            {t.value === 'PENDING' && counts?.pending > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-xs px-1.5 rounded-full">
                {counts.pending}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400">Memuat pesanan...</div>
        ) : (
          <OrderTable orders={orders} />
        )}
      </div>
    </DashboardLayout>
  )
}
