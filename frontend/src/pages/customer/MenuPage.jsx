// frontend/src/pages/customer/MenuPage.jsx
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { menuService } from '../../services/menuService'
import CustomerLayout from '../../layouts/CustomerLayout'
import CategoryPills from '../../components/customer/CategoryPills'
import MenuCard from '../../components/customer/MenuCard'
import { Search } from 'lucide-react'

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [search, setSearch] = useState('')

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  menuService.getCategories,
  })

  const { data: menuItems = [], isLoading, isError } = useQuery({
    queryKey: ['menu', { category: selectedCategory, search }],
    queryFn:  () => menuService.getMenu({ category: selectedCategory, search: search || undefined }),
  })

  return (
    <CustomerLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Menu Kami</h1>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cari menu..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
        />
      </div>

      {/* Category Pills */}
      <CategoryPills categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* Menu Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-40 animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <p className="text-center text-red-500 py-10">Gagal memuat menu. Coba lagi.</p>
      ) : menuItems.length === 0 ? (
        <p className="text-center text-gray-400 py-10">Tidak ada menu ditemukan.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {menuItems.map(menu => (
            <MenuCard key={menu.id_menu_item} menu={menu} />
          ))}
        </div>
      )}
    </CustomerLayout>
  )
}
