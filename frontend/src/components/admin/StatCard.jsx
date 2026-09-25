// frontend/src/components/admin/StatCard.jsx
export default function StatCard({ label, value, icon: Icon, color = 'orange' }) {
  const colors = {
    orange: 'bg-orange-50 text-orange-600',
    green:  'bg-green-50 text-green-600',
    amber:  'bg-amber-50 text-amber-600',
    blue:   'bg-blue-50 text-blue-600',
  }
  return (
    <div className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
      {Icon && (
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={22} />
        </div>
      )}
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
      </div>
    </div>
  )
}
