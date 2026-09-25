// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import { lazy, Suspense } from 'react'

// Lazy imports
const MenuPage         = lazy(() => import('./pages/customer/MenuPage'))
const CartPage         = lazy(() => import('./pages/customer/CartPage'))
const LoginPage        = lazy(() => import('./pages/auth/LoginPage'))
const OrdersPage       = lazy(() => import('./pages/admin/OrdersPage'))
const BillingPage      = lazy(() => import('./pages/admin/BillingPage'))
const StockPage        = lazy(() => import('./pages/admin/StockPage'))
const StockHistoryPage = lazy(() => import('./pages/admin/StockHistoryPage'))
const DashboardPage    = lazy(() => import('./pages/admin/DashboardPage'))

function ProtectedRoute({ children, role }) {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (role && user?.role !== role) return <Navigate to="/orders" replace />
  return children
}

function LoginRedirect({ children }) {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/orders" replace />
  return children
}

function Loader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-500 border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public — customer */}
          <Route path="/menu"  element={<MenuPage />} />
          <Route path="/cart"  element={<CartPage />} />

          {/* Auth */}
          <Route path="/login" element={<LoginRedirect><LoginPage /></LoginRedirect>} />

          {/* Protected — kasir & admin */}
          <Route path="/orders" element={
            <ProtectedRoute><OrdersPage /></ProtectedRoute>
          } />
          <Route path="/billing/:id" element={
            <ProtectedRoute><BillingPage /></ProtectedRoute>
          } />

          {/* Protected — admin only */}
          <Route path="/stock" element={
            <ProtectedRoute role="admin"><StockPage /></ProtectedRoute>
          } />
          <Route path="/stock/:id/history" element={
            <ProtectedRoute role="admin"><StockHistoryPage /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute role="admin"><DashboardPage /></ProtectedRoute>
          } />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/menu" replace />} />
          <Route path="*" element={<Navigate to="/menu" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
