import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShoppingCart } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export function Header() {
  const { user, logout } = useAuth();
  const { cart = [] } = useCart() || {};
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-20 bg-surface/90 backdrop-blur-xl shadow-[0_2px_12px_rgba(36,28,26,0.06)]">
      <div className="w-full max-w-[1440px] mx-auto px-margin md:px-margin-tablet lg:px-margin-desktop h-full flex items-center justify-between gap-space-xl">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-space-md">
          <h1 className="font-headline-md text-headline-md text-primary font-bold">Dapur Ina Aina</h1>
        </div>

        {/* Nav Tengah */}
        <nav className="hidden lg:flex items-center gap-space-lg">
          <NavLink 
            to="/menu"
            className={({ isActive }) => isActive ? 'bg-primary text-on-primary px-4 py-2 rounded-xl font-label-lg text-label-lg' : 'text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg'}
          >
            Menu
          </NavLink>
          
          {user && user.role === 'cashier' && (
            <NavLink 
              to="/orders"
              className={({ isActive }) => isActive ? 'bg-primary text-on-primary px-4 py-2 rounded-xl font-label-lg text-label-lg' : 'text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg'}
            >
              Pesanan
            </NavLink>
          )}

          {user && user.role === 'admin' && (
            <>
              <NavLink 
                to="/orders"
                className={({ isActive }) => isActive ? 'bg-primary text-on-primary px-4 py-2 rounded-xl font-label-lg text-label-lg' : 'text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg'}
              >
                Pesanan Masuk
              </NavLink>
              <NavLink 
                to="/dashboard"
                className={({ isActive }) => isActive ? 'bg-primary text-on-primary px-4 py-2 rounded-xl font-label-lg text-label-lg' : 'text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg'}
              >
                Dashboard
              </NavLink>
              <NavLink 
                to="/stock"
                className={({ isActive }) => isActive ? 'bg-primary text-on-primary px-4 py-2 rounded-xl font-label-lg text-label-lg' : 'text-on-surface-variant hover:text-on-surface font-label-lg text-label-lg'}
              >
                Kelola Stok
              </NavLink>
            </>
          )}
        </nav>

        {/* Info User & Aksi */}
        <div className="flex items-center gap-space-lg">
          {!user ? (
            <>
              <NavLink 
                to="/cart"
                className="relative p-2 rounded-xl hover:bg-surface-container-low transition-colors"
              >
                <ShoppingCart size={20} className="text-on-surface-variant" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-on-error rounded-full flex items-center justify-center text-body-sm font-bold">
                    {cart.length}
                  </span>
                )}
              </NavLink>
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2.5 rounded-xl font-label-lg text-label-lg bg-primary text-on-primary hover:bg-primary-container shadow-sm transition-all"
              >
                Login
              </button>
            </>
          ) : (
            <div className="flex items-center gap-space-md">
              <span className="font-label-lg text-label-lg text-on-surface-variant">
                {user.name} ({user.role})
              </span>
              <button 
                onClick={handleLogout}
                className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
