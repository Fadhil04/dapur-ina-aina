// frontend/src/pages/admin/StockHistoryPage.jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { stockService } from '../../services/stockService'
import DashboardLayout from '../../layouts/DashboardLayout'
import { ArrowLeft } from 'lucide-react'

const TYPE_BADGE = {
  TAMBAH:    'bg-green-100 text-green-700',
  RUSAK:     'bg-red-100 text-red-700',
  PENJUALAN: 'bg-blue-100 text-blue-700',
}

function formatDate(d) {
  return new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}

export default function StockHistoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['stock-history', id],
    queryFn:  () => stockService.getHistory(id),
  })

  const menu      = data?.menu
  const movements = data?.movements ?? []

  return (
    <DashboardLayout>
      <button
        onClick={() => navigate('/stock')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-orange-500 mb-5 transition-colors"
      >
        <ArrowLeft size={16} /> Kembali ke Stok
      </button>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Histori Mutasi Stok</h1>
          {menu && (
            <p className="text-sm text-gray-500 mt-0.5">
              {menu.name_menu} · Stok saat ini: <span className="font-semibold text-gray-700">{menu.stock}</span>
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400">Memuat histori...</div>
        ) : isError ? (
          <div className="py-12 text-center text-red-500">Gagal memuat data.</div>
        ) : movements.length === 0 ? (
          <div className="py-12 text-center text-gray-400">Belum ada catatan mutasi.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase">
                <th className="text-left px-4 py-3">Tanggal</th>
                <th className="text-center px-4 py-3">Tipe</th>
                <th className="text-center px-4 py-3">Sebelum</th>
                <th className="text-center px-4 py-3">Perubahan</th>
                <th className="text-center px-4 py-3">Sesudah</th>
                <th className="text-left px-4 py-3">Catatan</th>
                <th className="text-left px-4 py-3">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {movements.map(m => (
                <tr key={m.id_movement} className="bg-white hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(m.created_at)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full ${TYPE_BADGE[m.type] ?? 'bg-gray-100 text-gray-600'}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-gray-600">{m.quantity_before}</td>
                  <td className="px-4 py-3 text-center font-semibold">
                    <span className={m.quantity_change >= 0 ? 'text-green-600' : 'text-red-500'}>
                      {m.quantity_change >= 0 ? `+${m.quantity_change}` : m.quantity_change}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-gray-800">{m.quantity_after}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{m.note || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{m.name_user || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </DashboardLayout>
  )
}
