import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import CartDrawer from '../cart/CartDrawer'

export default function Navbar() {
  const { user, isLoggedIn, isAdmin, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const [scrolled,     setScrolled]     = useState(false)
  const [menuOpen,     setMenuOpen]     = useState(false)
  const [cartOpen,     setCartOpen]     = useState(false)
  const [profileOpen,  setProfileOpen]  = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleLogout = () => {
    logout()
    setProfileOpen(false)
    navigate('/')
  }

  const totalItems = cart?.totalItems || 0

  return (
    <>
      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">✦</span>
            <span className="logo-text">LuxeShop</span>
          </Link>

          {/* Desktop Nav */}
          <div className="navbar-links">
            <NavLink to="/"        className={({isActive})=>isActive?'nav-link active':'nav-link'}>Home</NavLink>
            <NavLink to="/products"className={({isActive})=>isActive?'nav-link active':'nav-link'}>Shop</NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={({isActive})=>isActive?'nav-link active':'nav-link'}>Admin</NavLink>
            )}
          </div>

          {/* Right actions */}
          <div className="navbar-actions">
            {/* Cart button */}
            {isLoggedIn && (
              <button className="icon-btn" onClick={() => setCartOpen(true)} title="Cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
                {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
              </button>
            )}

            {/* Profile */}
            {isLoggedIn ? (
              <div className="profile-dropdown">
                <button className="avatar-btn" onClick={() => setProfileOpen(o => !o)}>
                  <span className="avatar">{user?.name?.[0]?.toUpperCase()}</span>
                  <span className="avatar-name">{user?.name?.split(' ')[0]}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <path d="M6 8L1 3h10z"/>
                  </svg>
                </button>
                {profileOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <span className="dropdown-name">{user?.name}</span>
                      <span className="dropdown-email">{user?.email}</span>
                    </div>
                    <div className="dropdown-divider"/>
                    <Link to="/profile" className="dropdown-item" onClick={()=>setProfileOpen(false)}>
                      👤 My Profile
                    </Link>
                    <Link to="/orders" className="dropdown-item" onClick={()=>setProfileOpen(false)}>
                      📦 My Orders
                    </Link>
                    {isAdmin && (
                      <Link to="/admin" className="dropdown-item" onClick={()=>setProfileOpen(false)}>
                        🛡️ Admin Panel
                      </Link>
                    )}
                    <div className="dropdown-divider"/>
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/login?tab=register" className="btn btn-primary btn-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button className="hamburger" onClick={() => setMenuOpen(o => !o)}>
              <span/><span/><span/>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu">
            <Link to="/"         onClick={() => setMenuOpen(false)} className="mobile-link">Home</Link>
            <Link to="/products" onClick={() => setMenuOpen(false)} className="mobile-link">Shop</Link>
            {isLoggedIn && <Link to="/orders"  onClick={() => setMenuOpen(false)} className="mobile-link">Orders</Link>}
            {isLoggedIn && <Link to="/profile" onClick={() => setMenuOpen(false)} className="mobile-link">Profile</Link>}
            {isAdmin    && <Link to="/admin"   onClick={() => setMenuOpen(false)} className="mobile-link">Admin</Link>}
            {!isLoggedIn && <Link to="/login"  onClick={() => setMenuOpen(false)} className="mobile-link">Login / Sign Up</Link>}
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <style>{`
        .navbar {
          position: sticky; top: 0; z-index: 1000;
          background: rgba(7,7,15,0.8);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid var(--border);
          transition: var(--transition);
        }
        .navbar-scrolled {
          background: rgba(7,7,15,0.95);
          box-shadow: 0 4px 24px rgba(0,0,0,0.5);
        }
        .navbar-inner {
          display: flex; align-items: center; gap: 2rem;
          height: 64px;
        }
        .navbar-logo {
          display: flex; align-items: center; gap: 0.5rem;
          flex-shrink: 0;
        }
        .logo-icon { color: var(--accent); font-size: 1.3rem; }
        .logo-text {
          font-family: var(--font-display);
          font-size: 1.4rem; font-weight: 700;
          background: linear-gradient(135deg, var(--accent-bright), var(--gold));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .navbar-links {
          display: flex; gap: 0.5rem; flex: 1;
        }
        .nav-link {
          padding: 0.4rem 0.85rem;
          border-radius: var(--radius-full);
          font-size: 0.9rem; font-weight: 500;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .nav-link:hover, .nav-link.active {
          color: var(--text-primary);
          background: var(--glass-strong);
        }
        .navbar-actions { display: flex; align-items: center; gap: 0.75rem; }
        .icon-btn {
          position: relative;
          width: 40px; height: 40px;
          border-radius: var(--radius-full);
          background: var(--glass);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          transition: var(--transition);
        }
        .icon-btn:hover { color: var(--text-primary); background: var(--glass-strong); }
        .cart-badge {
          position: absolute; top: -4px; right: -4px;
          background: var(--accent);
          color: white; font-size: 0.65rem; font-weight: 700;
          width: 18px; height: 18px;
          border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          animation: popIn 0.2s ease;
        }
        @keyframes popIn { from { transform: scale(0); } to { transform: scale(1); } }
        .profile-dropdown { position: relative; }
        .avatar-btn {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.35rem 0.75rem 0.35rem 0.35rem;
          background: var(--glass);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          color: var(--text-secondary);
          font-size: 0.85rem;
          transition: var(--transition);
        }
        .avatar-btn:hover { color: var(--text-primary); border-color: var(--border-accent); }
        .avatar {
          width: 28px; height: 28px; border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--accent), var(--accent-bright));
          color: white; font-size: 0.75rem; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .avatar-name { font-weight: 500; }
        .dropdown-menu {
          position: absolute; top: calc(100% + 8px); right: 0;
          min-width: 220px;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          padding: 0.5rem;
          animation: fadeInUp 0.15s ease;
        }
        .dropdown-header { padding: 0.5rem 0.75rem; }
        .dropdown-name { display: block; font-weight: 600; font-size: 0.9rem; }
        .dropdown-email { display: block; font-size: 0.78rem; color: var(--text-muted); }
        .dropdown-divider { height: 1px; background: var(--border); margin: 0.4rem 0; }
        .dropdown-item {
          display: flex; align-items: center; gap: 0.5rem;
          padding: 0.55rem 0.75rem;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          color: var(--text-secondary);
          transition: var(--transition);
          width: 100%; text-align: left;
        }
        .dropdown-item:hover { background: var(--glass-strong); color: var(--text-primary); }
        .dropdown-logout { color: var(--red) !important; }
        .auth-buttons { display: flex; gap: 0.5rem; }
        .hamburger {
          display: none; flex-direction: column; gap: 5px;
          padding: 8px;
        }
        .hamburger span {
          display: block; width: 20px; height: 2px;
          background: var(--text-secondary); border-radius: 2px;
          transition: var(--transition);
        }
        .mobile-menu {
          border-top: 1px solid var(--border);
          padding: 0.75rem 1rem;
          display: flex; flex-direction: column; gap: 0.25rem;
          background: var(--bg-primary);
        }
        .mobile-link {
          padding: 0.75rem 1rem;
          border-radius: var(--radius-sm);
          color: var(--text-secondary); font-size: 0.95rem;
          transition: var(--transition);
        }
        .mobile-link:hover { background: var(--glass-strong); color: var(--text-primary); }
        @media (max-width: 768px) {
          .navbar-links { display: none; }
          .avatar-name { display: none; }
          .hamburger { display: flex; }
        }
      `}</style>
    </>
  )
}
