import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, ClipboardList, Package, LogOut, ChefHat } from 'lucide-react'
import { Modal } from '../components/ui/Modal'
import { Button } from '../components/ui'

const navItems = [
  { to: '/dashboard', label: 'Dashboard',       icon: LayoutDashboard, roles: ['admin'] },
  { to: '/stock',     label: 'Stok',            icon: Package,         roles: ['admin'] },
  { to: '/orders',    label: 'Riwayat Pesanan', icon: ClipboardList,   roles: ['admin'] },
  { to: '/orders',    label: 'Pesanan',         icon: ClipboardList,   roles: ['cashier'] },
]

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogoutConfirm = () => {
    logout()
    setShowLogoutConfirm(false)
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
            onClick={() => setShowLogoutConfirm(true)}
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

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        maxWidth="max-w-md"
        showCloseButton={true}
      >
        <div className="text-center pt-2 pb-1 space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 text-red-600 rounded-2xl flex items-center justify-center ring-8 ring-red-50 shadow-sm">
            <LogOut size={28} className="translate-x-0.5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Konfirmasi Keluar</h3>
            <p className="text-sm text-slate-500 mt-1">
              Apakah Anda yakin ingin keluar dari sistem? Sesi login Anda akan diakhiri.
            </p>
          </div>
          {user && (
            <div className="bg-slate-50 rounded-xl px-4 py-2.5 flex items-center justify-between text-sm border border-slate-200">
              <span className="text-slate-500">Akun saat ini:</span>
              <span className="font-semibold text-slate-800">
                {user.name_user} ({user.role === 'cashier' ? 'Kasir' : 'Admin'})
              </span>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              variant="neutral"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              variant="danger"
              icon={LogOut}
              onClick={handleLogoutConfirm}
              className="flex-1"
            >
              Ya, Keluar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
