/*
 * App.jsx — Root Component & Route Definitions
 *
 * This is the entry point of the React app (after main.jsx).
 * It sets up all the URL routes using React Router.
 *
 * How routing works:
 * - BrowserRouter    : enables URL-based navigation
 * - Routes           : container for all route definitions
 * - Route            : maps a URL path to a component
 *
 * Protected routes use a ProtectedRoute wrapper that checks
 * if the user is logged in before rendering the page.
 * If not logged in, it redirects to /login.
 *
 * Admin routes additionally check if user.role === 'ADMIN'.
 * If a non-admin tries to access /admin/*, they get redirected.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// ── Page imports ──────────────────────────────────────────────────
import Homepage          from './pages/Homepage'
import Storepage      from './pages/Storepage'
import ProductDetailpage from './pages/ProductDetailpage'
import Cartpage          from './pages/Cartpage'
import Checkoutpage      from './pages/Checkoutpage'
import Orderspage        from './pages/Orderspage'
import Loginpage         from './pages/Loginpage'
import Registerpage      from './pages/Registerpage'
import Aboutpage         from './pages/Aboutpage'
import FAQpage           from './pages/FAQpage'

// Admin pages
import AdminProductsPage   from './pages/admin/AdminProductsPage'
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage'
import AdminOrdersPage     from './pages/admin/AdminOrdersPage'
import AdminPromotionsPage from './pages/admin/AdminPromotionsPage'
/*
 * ProtectedRoute — Guards pages that require login
 *
 * Props:
 * - children  : the page component to render if allowed
 * - adminOnly : if true, also requires ADMIN role
 *
 * Usage:
 *   <ProtectedRoute><CartPage /></ProtectedRoute>
 *   <ProtectedRoute adminOnly><AdminProductsPage /></ProtectedRoute>
 */
function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, user } = useAuth()

  // Not logged in → redirect to login page
  if (!isLoggedIn) return <Navigate to="/login" replace />

  // Logged in but not admin → redirect to home
  if (adminOnly && user?.role !== 'ADMIN') return <Navigate to="/" replace />

  return children
}

/*
 * AppRoutes — Defines all routes in the app
 * Separated from App so we can use useAuth() inside
 * (hooks must be inside the AuthProvider tree)
 */
function AppRoutes() {
  return (
    <Routes>
      {/* ── Public routes — anyone can access ─────────────────── */}
      <Route path="/"        element={<Homepage />} />
      <Route path="/store"   element={<Storepage />} />
      <Route path="/products/:slug" element={<ProductDetailpage />} />
      <Route path="/about"   element={<Aboutpage />} />
      <Route path="/faqs"    element={<FAQpage />} />
      
      <Route path="/login"   element={<Loginpage />} />
      <Route path="/register" element={<Registerpage />} />

      {/* ── Protected routes — must be logged in ──────────────── */}
      <Route path="/cart" element={
        <ProtectedRoute><Cartpage /></ProtectedRoute>
      } />
      <Route path="/checkout" element={
        <ProtectedRoute><Checkoutpage /></ProtectedRoute>
      } />
      <Route path="/orders" element={
        <ProtectedRoute><Orderspage /></ProtectedRoute>
      } />

      {/* ── Admin routes — must be logged in as ADMIN ─────────── */}
      <Route path="/admin/products" element={
        <ProtectedRoute adminOnly><AdminProductsPage /></ProtectedRoute>
      } />
      <Route path="/admin/categories" element={
        <ProtectedRoute adminOnly><AdminCategoriesPage /></ProtectedRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedRoute adminOnly><AdminOrdersPage /></ProtectedRoute>
      } />
      <Route path="/admin/promotions" element={
  <ProtectedRoute adminOnly><AdminPromotionsPage /></ProtectedRoute>
} />

      {/* ── Catch-all — redirect unknown URLs to home ─────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

/*
 * App — Top level component
 * Wraps everything in:
 * 1. BrowserRouter  : enables React Router navigation
 * 2. AuthProvider   : makes auth state available everywhere
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}