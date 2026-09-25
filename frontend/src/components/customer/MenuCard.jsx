// frontend/src/components/customer/MenuCard.jsx
import { Plus, PackageX } from 'lucide-react'
import { useCart } from '../../context/CartContext'

function formatRupiah(n) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

export default function MenuCard({ menu }) {
  const { addItem, cart } = useCart()
  const inCart = cart.find(i => i.id_menu_item === menu.id_menu_item)
  const outOfStock = menu.stock <= 0

  const handleAdd = () => {
    addItem({
      id_menu_item: menu.id_menu_item,
      name_menu:    menu.name_menu,
      price:        menu.price,
    })
  }

  return (
    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col transition-transform hover:-translate-y-1 ${outOfStock ? 'opacity-60' : ''}`}>
      <div className="flex-1 p-4">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-semibold text-gray-800 text-sm leading-tight">{menu.name_menu}</h3>
          {menu.stock <= 5 && menu.stock > 0 && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full whitespace-nowrap">
              Sisa {menu.stock}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-1">{menu.name_category}</p>
        <p className="text-orange-500 font-bold mt-2">{formatRupiah(menu.price)}</p>
      </div>
      <div className="px-4 pb-4">
        {outOfStock ? (
          <div className="flex items-center gap-1 text-gray-400 text-xs justify-center py-2">
            <PackageX size={14} /> Stok habis
          </div>
        ) : (
          <button
            onClick={handleAdd}
            className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 rounded-lg transition-colors"
          >
            <Plus size={16} />
            {inCart ? `Tambah (${inCart.quantity})` : 'Tambah'}
          </button>
        )}
      </div>
    </div>
  )
}
