import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand">
          <span className="logo-icon">✦</span>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.2rem',
            background:'linear-gradient(135deg, var(--accent-bright), var(--gold))',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>LuxeShop</span>
          <p>Premium products, curated for you.</p>
        </div>
        <div className="footer-links">
          <h5>Shop</h5>
          <Link to="/products">All Products</Link>
          <Link to="/products?categoryId=1">Electronics</Link>
          <Link to="/products?categoryId=2">Clothing</Link>
          <Link to="/products?categoryId=3">Books</Link>
        </div>
        <div className="footer-links">
          <h5>Account</h5>
          <Link to="/login">Sign In</Link>
          <Link to="/orders">My Orders</Link>
          <Link to="/profile">Profile</Link>
        </div>
        <div className="footer-links">
          <h5>Info</h5>
          <span>Built with Spring Boot 3</span>
          <span>Java 21 + React + Vite</span>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2024 LuxeShop. Built with ❤️ and Spring Boot.</span>
      </div>
      <style>{`
        .footer {
          background: var(--bg-surface);
          border-top: 1px solid var(--border);
          margin-top: auto;
        }
        .footer-inner {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 3rem; padding: 3rem 1.5rem;
        }
        .footer-brand { display: flex; flex-direction: column; gap: 0.5rem; }
        .footer-brand p { font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem; }
        .footer-links { display: flex; flex-direction: column; gap: 0.6rem; }
        .footer-links h5 { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em;
          text-transform: uppercase; color: var(--text-muted); margin-bottom: 0.25rem; }
        .footer-links a, .footer-links span {
          font-size: 0.875rem; color: var(--text-secondary);
          transition: var(--transition);
        }
        .footer-links a:hover { color: var(--accent-bright); }
        .footer-bottom {
          border-top: 1px solid var(--border);
          padding: 1rem 1.5rem;
          text-align: center;
          font-size: 0.78rem; color: var(--text-muted);
        }
        @media (max-width: 768px) {
          .footer-inner { grid-template-columns: 1fr 1fr; gap: 2rem; }
        }
      `}</style>
    </footer>
  )
}
