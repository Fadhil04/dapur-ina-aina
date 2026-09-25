import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';
import { Modal, Button } from '../ui';

export function Header() {
  const { user, logout } = useAuth();
  const { cart = [] } = useCart() || {};
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    setShowLogoutConfirm(false);
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    isActive
      ? 'bg-primary text-on-primary px-4 py-2 rounded-xl font-label-lg text-label-lg transition-all'
      : 'text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg transition-colors';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-surface/90 backdrop-blur-xl shadow-[0_2px_12px_rgba(36,28,26,0.06)]">
      <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop h-full flex items-center justify-between gap-space-xl">
        
        {/* Logo & Brand */}
        <NavLink to="/" className="flex items-center gap-space-md shrink-0">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
            <span className="font-bold text-on-primary text-lg">🍳</span>
          </div>
          <h1 className="hidden md:block font-headline-sm text-headline-sm text-on-surface font-bold">
            Dapur Ina Aina
          </h1>
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-space-lg flex-1 ml-space-xl">
          {!user && (
            <NavLink to="/menu" className={navLinkClass}>
              Menu
            </NavLink>
          )}

          {user?.role === 'cashier' && (
            <>
              <NavLink to="/orders" className={navLinkClass}>
                📋 Pesanan
              </NavLink>
              <NavLink to="/orders/create" className={navLinkClass}>
                ➕ Buat Pesanan
              </NavLink>
            </>
          )}

          {user?.role === 'admin' && (
            <>
              <NavLink to="/orders" className={navLinkClass}>
                📋 Pesanan
              </NavLink>
              <NavLink to="/dashboard" className={navLinkClass}>
                📊 Dashboard
              </NavLink>
              <NavLink to="/stock" className={navLinkClass}>
                📦 Stok
              </NavLink>
            </>
          )}
        </nav>

        {/* Right Section */}
        <div className="flex items-center gap-space-md ml-auto">
          {!user ? (
            <>
              <NavLink
                to="/cart"
                className="relative p-2 rounded-xl hover:bg-surface-container-low transition-colors"
              >
                <ShoppingCart size={20} className="text-on-surface-variant" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-on-error text-body-xs font-bold rounded-full flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </NavLink>
              <button
                onClick={() => navigate('/login')}
                className="hidden md:block px-space-lg py-space-md rounded-xl font-label-lg text-label-lg bg-primary text-on-primary hover:bg-primary-container shadow-sm transition-all"
              >
                Login
              </button>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-surface-container-low transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            <>
              <div className="hidden sm:flex items-center gap-space-sm text-label-lg">
                <span className="text-on-surface-variant">{user.name}</span>
                <span className="text-on-surface-variant">•</span>
                <span className="text-on-surface font-bold">
                  {user.role === 'cashier' ? '💳 Kasir' : '👑 Admin'}
                </span>
              </div>
              <button 
                onClick={() => setShowLogoutConfirm(true)}
                className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low hover:text-error transition-all"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl hover:bg-surface-container-low transition-colors"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-20 left-0 right-0 bg-surface border-b border-outline-variant shadow-lg">
          <nav className="flex flex-col p-space-lg gap-space-md max-w-[1440px] mx-auto">
            {!user && (
              <>
                <NavLink
                  to="/menu"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-space-lg py-space-md rounded-xl font-label-lg text-label-lg transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`
                  }
                >
                  Menu
                </NavLink>
                <button
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                  className="px-space-lg py-space-md rounded-xl font-label-lg text-label-lg bg-primary text-on-primary hover:bg-primary-container transition-all w-full text-left"
                >
                  Login
                </button>
              </>
            )}

            {user?.role === 'cashier' && (
              <>
                <NavLink
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-space-lg py-space-md rounded-xl font-label-lg text-label-lg transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`
                  }
                >
                  📋 Pesanan
                </NavLink>
                <NavLink
                  to="/orders/create"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-space-lg py-space-md rounded-xl font-label-lg text-label-lg transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`
                  }
                >
                  ➕ Buat Pesanan
                </NavLink>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <NavLink
                  to="/orders"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-space-lg py-space-md rounded-xl font-label-lg text-label-lg transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`
                  }
                >
                  📋 Pesanan
                </NavLink>
                <NavLink
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-space-lg py-space-md rounded-xl font-label-lg text-label-lg transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`
                  }
                >
                  📊 Dashboard
                </NavLink>
                <NavLink
                  to="/stock"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-space-lg py-space-md rounded-xl font-label-lg text-label-lg transition-all ${
                      isActive
                        ? 'bg-primary text-on-primary'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`
                  }
                >
                  📦 Stok
                </NavLink>
              </>
            )}
          </nav>
        </div>
      )}
      

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        title="Konfirmasi Logout"
        onClose={() => setShowLogoutConfirm(false)}
      >
        <div className="space-y-space-lg">
          <p className="font-body-md text-body-md text-on-surface">
            Yakin ingin keluar dari sistem?
          </p>
          <div className="flex gap-space-md">
            <Button
              variant="neutral"
              onClick={() => setShowLogoutConfirm(false)}
              className="flex-1"
            >
              Batal
            </Button>
            <Button
              variant="primary"
              onClick={handleLogoutConfirm}
              className="flex-1"
            >
              Logout
            </Button>
          </div>
        </div>
      </Modal>
    </header>
  );
}
