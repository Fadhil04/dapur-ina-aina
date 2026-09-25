import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { menuService } from '../../services/menuService';
import CategoryPills from '../../components/customer/CategoryPills';
import MenuCard from '../../components/customer/MenuCard';
import { SearchInput, LoadingCardSkeleton, EmptyState } from '../../components/ui';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { cart = [] } = useCart() || {};

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: menuService.getCategories,
  });

  const { data: menuItems = [], isLoading, isError } = useQuery({
    queryKey: ['menu', { category: selectedCategory, search }],
    queryFn: () => menuService.getMenu({ category: selectedCategory, search: search || undefined }),
  });

  return (
    <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop py-space-md lg:py-space-xl flex flex-col gap-space-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg md:font-headline-lg-mobile md:text-headline-lg-mobile text-on-surface">Menu Kami</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">Pilih menu favorit Anda</p>
        </div>
        {cart.length > 0 && (
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-space-md px-space-lg py-space-md rounded-xl bg-primary text-on-primary font-label-lg text-label-lg hover:bg-primary-container shadow-sm transition-all"
          >
            <ShoppingCart size={20} />
            Keranjang ({cart.length})
          </button>
        )}
      </div>

      {/* Search Bar */}
      <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari menu..." />

      {/* Category Filters */}
      <CategoryPills categories={categories} selected={selectedCategory} onSelect={setSelectedCategory} />

      {/* Menu Grid */}
      {isLoading ? (
        <LoadingCardSkeleton count={8} />
      ) : isError ? (
        <EmptyState title="Gagal Memuat" description="Terjadi kesalahan saat memuat menu. Coba lagi nanti." />
      ) : menuItems.length === 0 ? (
        <EmptyState title="Menu Tidak Ditemukan" description="Coba ubah filter kategori atau cari dengan kata kunci lain." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-space-lg">
          {menuItems.map((menu) => (
            <MenuCard key={menu.id_menu_item} menu={menu} />
          ))}
        </div>
      )}
    </div>
  );
}
