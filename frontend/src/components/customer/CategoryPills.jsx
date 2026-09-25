// frontend/src/components/customer/CategoryPills.jsx
export default function CategoryPills({ categories, selected, onSelect }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        onClick={() => onSelect(null)}
        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
          !selected ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        Semua
      </button>
      {categories.map(cat => (
        <button
          key={cat.id_category}
          onClick={() => onSelect(cat.id_category)}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
            selected === cat.id_category
              ? 'bg-orange-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {cat.name_category}
        </button>
      ))}
    </div>
  )
}
