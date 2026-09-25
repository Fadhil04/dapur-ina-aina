// frontend/src/components/admin/LowStockAlert.jsx
import { AlertTriangle } from 'lucide-react'

export default function LowStockAlert({ items = [] }) {
  if (!items.length) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-400" /> Stok Menipis
        </h3>
        <p className="text-sm text-gray-400">Semua stok dalam kondisi aman ✅</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-5">
      <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <AlertTriangle size={16} className="text-amber-400" /> Stok Menipis
        <span className="ml-auto bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
          {items.length} item
        </span>
      </h3>
      <ul className="space-y-2">
        {items.map(item => (
          <li key={item.id_menu_item} className="flex items-center justify-between text-sm">
            <span className="text-gray-700 truncate">{item.name_menu}</span>
            <span className={`font-bold ml-2 shrink-0 ${item.stock === 0 ? 'text-red-500' : 'text-amber-500'}`}>
              {item.stock === 0 ? 'Habis' : `Sisa ${item.stock}`}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
