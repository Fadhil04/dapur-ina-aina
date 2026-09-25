import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { lazy, Suspense } from 'react';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LoadingSkeleton } from './components/ui/LoadingSkeleton';

// Lazy imports
const MenuPage = lazy(() => import('./pages/customer/MenuPage'));
const CartPage = lazy(() => import('./pages/customer/CartPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const OrdersPage = lazy(() => import('./pages/admin/OrdersPage'));
const BillingPage = lazy(() => import('./pages/admin/BillingPage'));
const StockPage = lazy(() => import('./pages/admin/StockPage'));
const StockHistoryPage = lazy(() => import('./pages/admin/StockHistoryPage'));
const DashboardPage = lazy(() => import('./pages/admin/DashboardPage'));

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && user?.role !== role) return <Navigate to="/orders" replace />;
  return children;
}

function LoginRedirect({ children }) {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/orders" replace />;
  return children;
}

function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 w-full pt-20 bg-surface">
          <Suspense fallback={<Loader />}>
            <Routes>
              {/* Public — customer */}
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/cart" element={<CartPage />} />

              {/* Auth */}
              <Route
                path="/login"
                element={
                  <LoginRedirect>
                    <LoginPage />
                  </LoginRedirect>
                }
              />

              {/* Protected — kasir & admin */}
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <OrdersPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders/:id/billing"
                element={
                  <ProtectedRoute>
                    <BillingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute role="admin">
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected — admin only */}
              <Route
                path="/stock"
                element={
                  <ProtectedRoute role="admin">
                    <StockPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/stock/:id/history"
                element={
                  <ProtectedRoute role="admin">
                    <StockHistoryPage />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/menu" replace />} />
              <Route path="*" element={<Navigate to="/menu" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
