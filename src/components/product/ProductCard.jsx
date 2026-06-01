import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'

function StarRating({ rating }) {
  return (
    <div className="stars" style={{ display:'flex', gap:'2px' }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ color: s <= Math.round(rating||0) ? 'var(--gold)' : 'var(--text-muted)', fontSize:'0.75rem' }}>★</span>
      ))}
    </div>
  )
}

export default function ProductCard({ product }) {
  const { addItem } = useCart()
  const { isLoggedIn } = useAuth()
  const { show } = useToast()
  const navigate = useNavigate()

  const handleAddToCart = async (e) => {
    e.preventDefault(); e.stopPropagation()
    if (!isLoggedIn) { navigate('/login'); return }
    try {
      await addItem(product.id, 1)
      show(`${product.name} added to cart!`, 'success')
    } catch (err) {
      show(err.response?.data?.message || 'Failed to add to cart', 'error')
    }
  }

  const img = product.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=1a1a2e&color=7c6ffa&size=400`

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="product-img-wrap">
        <img src={img} alt={product.name} className="product-img"
          onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=1a1a2e&color=7c6ffa&size=400` }} />
        {product.stockQuantity === 0 && <div className="out-of-stock">Out of Stock</div>}
        <div className="product-overlay">
          <button
            className="btn btn-primary btn-sm quick-add"
            onClick={handleAddToCart}
            disabled={product.stockQuantity === 0}
          >
            + Add to Cart
          </button>
        </div>
      </div>
      <div className="product-info">
        <span className="product-category">{product.category?.name}</span>
        <h3 className="product-name">{product.name}</h3>
        {product.averageRating > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.4rem', marginTop:'0.25rem' }}>
            <StarRating rating={product.averageRating}/>
            <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>({product.reviewCount})</span>
          </div>
        )}
        <div className="product-footer">
          <span className="price">${Number(product.price).toFixed(2)}</span>
          <span className={`stock-indicator ${product.stockQuantity > 0 ? 'in-stock' : 'no-stock'}`}>
            {product.stockQuantity > 0 ? `${product.stockQuantity} left` : 'Sold out'}
          </span>
        </div>
      </div>
      <style>{`
        .product-card {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition-slow);
        }
        .product-card:hover {
          border-color: var(--border-accent);
          box-shadow: var(--shadow-accent);
          transform: translateY(-4px);
        }
        .product-img-wrap {
          position: relative; overflow: hidden;
          aspect-ratio: 1; background: var(--bg-elevated);
        }
        .product-img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.4s ease;
        }
        .product-card:hover .product-img { transform: scale(1.06); }
        .out-of-stock {
          position: absolute; inset: 0;
          background: rgba(7,7,15,0.7);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; font-weight: 600; color: var(--text-muted);
        }
        .product-overlay {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 1rem;
          background: linear-gradient(transparent, rgba(7,7,15,0.9));
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }
        .product-card:hover .product-overlay { transform: translateY(0); }
        .quick-add { width: 100%; }
        .product-info { padding: 1rem; }
        .product-category {
          font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--accent-bright);
        }
        .product-name {
          font-family: var(--font-body);
          font-size: 0.95rem; font-weight: 600;
          color: var(--text-primary);
          margin-top: 0.2rem;
          display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .product-footer {
          display: flex; align-items: center;
          justify-content: space-between;
          margin-top: 0.75rem;
        }
        .stock-indicator { font-size: 0.72rem; }
        .in-stock { color: var(--teal); }
        .no-stock { color: var(--red); }
      `}</style>
    </div>
  )
}
