import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getProducts, getCategories } from '../api/products'
import ProductCard from '../components/product/ProductCard'

function SkeletonCard() {
  return (
    <div style={{ borderRadius:'var(--radius-lg)', overflow:'hidden', border:'1px solid var(--border)' }}>
      <div className="skeleton" style={{ aspectRatio:'1' }}/>
      <div style={{ padding:'1rem', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
        <div className="skeleton" style={{ height:'12px', width:'60%' }}/>
        <div className="skeleton" style={{ height:'16px', width:'85%' }}/>
        <div className="skeleton" style={{ height:'20px', width:'40%' }}/>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [featured, setFeatured]     = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([
      getProducts({ size: 8, sort: 'createdAt,desc' }),
      getCategories()
    ]).then(([pRes, cRes]) => {
      setFeatured(pRes.data.data.content || [])
      setCategories(cRes.data.data || [])
    }).finally(() => setLoading(false))
  }, [])

  const categoryIcons = { Electronics:'⚡', Clothing:'👗', Books:'📚', 'Home & Garden':'🏡' }

  return (
    <div className="page-enter">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-bg"/>
        <div className="container hero-content">
          <div className="hero-badge">New Collection 2024</div>
          <h1 className="hero-title">
            Discover <span className="gradient-text">Premium</span><br/>Products
          </h1>
          <p className="hero-subtitle">
            Curated electronics, fashion, books and more. Free shipping on orders over $50.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/products')}>
              Shop Now →
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => navigate('/products')}>
              View Catalog
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat"><strong>12+</strong><span>Products</span></div>
            <div className="stat-divider"/>
            <div className="stat"><strong>4</strong><span>Categories</span></div>
            <div className="stat-divider"/>
            <div className="stat"><strong>100%</strong><span>Satisfaction</span></div>
          </div>
        </div>
      </section>

      {/* ── Categories ───────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <Link to="/products" className="section-link">View all →</Link>
          </div>
          <div className="categories-grid">
            {categories.map(cat => (
              <Link key={cat.id} to={`/products?categoryId=${cat.id}`} className="category-tile">
                <div className="cat-icon">{categoryIcons[cat.name] || '🛍️'}</div>
                <h4>{cat.name}</h4>
                <p>{cat.description?.slice(0, 50)}…</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ─────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2>Featured Products</h2>
            <Link to="/products" className="section-link">See all →</Link>
          </div>
          <div className="products-grid">
            {loading
              ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i}/>)
              : featured.map(p => <ProductCard key={p.id} product={p}/>)
            }
          </div>
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <section className="cta-section">
        <div className="container cta-inner">
          <div>
            <h2 style={{ color:'var(--text-primary)' }}>Ready to start shopping?</h2>
            <p>Join thousands of happy customers. Register today.</p>
          </div>
          <button className="btn btn-gold btn-lg" onClick={() => navigate('/login?tab=register')}>
            Create Account →
          </button>
        </div>
      </section>

      <style>{`
        .hero {
          position: relative; overflow: hidden;
          min-height: 80vh;
          display: flex; align-items: center;
          padding: 4rem 0;
        }
        .hero-bg {
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 0%, rgba(124,111,250,0.15) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 80% 80%, rgba(0,212,170,0.08) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero-content {
          position: relative; max-width: 700px;
          display: flex; flex-direction: column; gap: 1.5rem;
        }
        .hero-badge {
          display: inline-flex; align-items: center;
          padding: 0.35rem 1rem;
          background: rgba(124,111,250,0.15);
          border: 1px solid var(--border-accent);
          border-radius: var(--radius-full);
          font-size: 0.78rem; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: var(--accent-bright); width: fit-content;
        }
        .hero-title { line-height: 1.1; }
        .gradient-text {
          background: linear-gradient(135deg, var(--accent-bright) 0%, var(--gold) 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .hero-subtitle { font-size: 1.1rem; color: var(--text-secondary); max-width: 500px; }
        .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
        .hero-stats {
          display: flex; align-items: center; gap: 1.5rem;
          margin-top: 0.5rem;
        }
        .stat { display: flex; flex-direction: column; gap: 0.15rem; }
        .stat strong { font-size: 1.5rem; font-weight: 700; font-family: var(--font-display); color: var(--text-primary); }
        .stat span { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-divider { width: 1px; height: 40px; background: var(--border); }
        .section { padding: 4rem 0; }
        .section-header {
          display: flex; justify-content: space-between; align-items: baseline;
          margin-bottom: 2rem;
        }
        .section-link {
          font-size: 0.875rem; font-weight: 600;
          color: var(--accent-bright);
          transition: var(--transition);
        }
        .section-link:hover { color: var(--accent); }
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }
        .category-tile {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 1.75rem 1.25rem;
          display: flex; flex-direction: column; gap: 0.5rem;
          transition: var(--transition-slow);
        }
        .category-tile:hover {
          border-color: var(--border-accent);
          background: var(--bg-elevated);
          transform: translateY(-3px);
          box-shadow: var(--shadow-accent);
        }
        .cat-icon { font-size: 2rem; }
        .category-tile h4 { font-size: 1rem; font-weight: 700; }
        .category-tile p { font-size: 0.78rem; color: var(--text-muted); line-height: 1.4; }
        .cta-section {
          background: linear-gradient(135deg, rgba(124,111,250,0.12) 0%, rgba(0,212,170,0.06) 100%);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 4rem 0;
          margin: 2rem 0;
        }
        .cta-inner {
          display: flex; align-items: center; justify-content: space-between;
          gap: 2rem; flex-wrap: wrap;
        }
        .cta-inner p { color: var(--text-secondary); margin-top: 0.5rem; }
      `}</style>
    </div>
  )
}
