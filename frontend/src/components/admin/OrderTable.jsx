// frontend/src/components/admin/OrderTable.jsx
import { useNavigate } from 'react-router-dom'
import { CreditCard, Clock, CheckCircle } from 'lucide-react'

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function StatusBadge({ status }) {
  if (status === 'LUNAS') return (
    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">
      <CheckCircle size={12} /> Lunas
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
      <Clock size={12} /> Pending
    </span>
  )
}

export default function OrderTable({ orders }) {
  const navigate = useNavigate()
  if (!orders?.length) return <p className="text-center text-gray-400 py-10">Tidak ada pesanan.</p>

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-500 text-xs uppercase">
            <th className="text-left px-4 py-3 rounded-tl-lg">Invoice</th>
            <th className="text-left px-4 py-3">Pelanggan</th>
            <th className="text-left px-4 py-3">Meja</th>
            <th className="text-left px-4 py-3">Status</th>
            <th className="text-right px-4 py-3">Total</th>
            <th className="text-center px-4 py-3 rounded-tr-lg">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map(order => (
            <tr key={order.id_order} className="bg-white hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-mono text-xs text-gray-600">{order.invoice_number}</td>
              <td className="px-4 py-3 font-medium text-gray-800">{order.customer_name}</td>
              <td className="px-4 py-3 text-gray-600">{order.table_number}</td>
              <td className="px-4 py-3"><StatusBadge status={order.status} /></td>
              <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatRupiah(order.total_amount)}</td>
              <td className="px-4 py-3 text-center">
                {order.status === 'PENDING' && (
                  <button
                    onClick={() => navigate(`/billing/${order.id_order}`)}
                    className="inline-flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <CreditCard size={13} /> Bayar
                  </button>
                )}
                {order.status === 'LUNAS' && (
                  <button
                    onClick={() => navigate(`/billing/${order.id_order}`)}
                    className="inline-flex items-center gap-1 border border-gray-200 text-gray-500 text-xs px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Detail
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
