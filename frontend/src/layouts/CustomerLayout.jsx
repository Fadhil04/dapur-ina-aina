// frontend/src/layouts/CustomerLayout.jsx
import { useCart } from '../context/CartContext'
import { ShoppingCart } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function CustomerLayout({ children }) {
  const { totalItems } = useCart()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/menu" className="text-xl font-bold text-orange-500">
            🍽️ Dapur Ina Aina
          </Link>
          <Link to="/cart" className="relative p-2 text-gray-600 hover:text-orange-500 transition-colors">
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
