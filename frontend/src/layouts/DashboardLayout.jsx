// frontend/src/layouts/DashboardLayout.jsx
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, ClipboardList, Package, LogOut, ChefHat } from 'lucide-react'

const navItems = [
  { to: '/orders',    label: 'Pesanan',   icon: ClipboardList, roles: ['admin', 'cashier'] },
  { to: '/stock',     label: 'Stok',      icon: Package,       roles: ['admin'] },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
]

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const visibleNav = navItems.filter(n => n.roles.includes(user?.role))

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-800 text-white flex flex-col fixed h-full z-20">
        <div className="px-4 py-5 border-b border-slate-700">
          <div className="flex items-center gap-2 text-orange-400 font-bold text-lg">
            <ChefHat size={22} />
            <span>Dapur Ina Aina</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 truncate">{user?.name_user} · {user?.role}</p>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {visibleNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-orange-500 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-700'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-2 pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-red-600 hover:text-white transition-colors"
          >
            <LogOut size={18} />
            Keluar
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-56 flex-1 p-6">
        {children}
      </main>
    </div>
  )
}
