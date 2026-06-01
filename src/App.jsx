import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import HomePage          from './pages/HomePage'
import ProductsPage      from './pages/ProductsPage'
import ProductDetailPage from './pages/ProductDetailPage'
import LoginPage         from './pages/LoginPage'
import CheckoutPage      from './pages/CheckoutPage'
import OrdersPage        from './pages/OrdersPage'
import ProfilePage       from './pages/ProfilePage'
import AdminDashboard    from './pages/AdminDashboard'

function ProtectedRoute({ children, adminOnly = false }) {
  const { isLoggedIn, isAdmin } = useAuth()
  if (!isLoggedIn) return <Navigate to="/login" replace/>
  if (adminOnly && !isAdmin) return <Navigate to="/" replace/>
  return children
}

function AppRoutes() {
  return (
    <>
      <Navbar/>
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"          element={<HomePage/>}/>
          <Route path="/products"  element={<ProductsPage/>}/>
          <Route path="/products/:id" element={<ProductDetailPage/>}/>
          <Route path="/login"     element={<LoginPage/>}/>
          <Route path="/checkout"  element={<ProtectedRoute><CheckoutPage/></ProtectedRoute>}/>
          <Route path="/orders"    element={<ProtectedRoute><OrdersPage/></ProtectedRoute>}/>
          <Route path="/profile"   element={<ProtectedRoute><ProfilePage/></ProtectedRoute>}/>
          <Route path="/admin"     element={<ProtectedRoute adminOnly><AdminDashboard/></ProtectedRoute>}/>
          <Route path="*"          element={
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'50vh', gap:'1rem', color:'var(--text-muted)' }}>
              <span style={{ fontSize:'5rem' }}>404</span>
              <h2 style={{ fontFamily:'var(--font-display)' }}>Page Not Found</h2>
              <a href="/" className="btn btn-primary">Go Home</a>
            </div>
          }/>
        </Routes>
      </main>
      <Footer/>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <CartProvider>
            <AppRoutes/>
          </CartProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
