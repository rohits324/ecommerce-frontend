import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct } from '../api/products'
import { getReviews, addReview } from '../api/reviews'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display:'flex', gap:'4px', cursor:'pointer' }}>
      {[1,2,3,4,5].map(s => (
        <span key={s} style={{ fontSize:'1.75rem', color: s<=(hover||value)?'var(--gold)':'var(--border)', transition:'color 0.1s' }}
          onMouseEnter={()=>setHover(s)} onMouseLeave={()=>setHover(0)} onClick={()=>onChange(s)}>★</span>
      ))}
    </div>
  )
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const { isLoggedIn } = useAuth()
  const { show } = useToast()
  const [product,  setProduct]  = useState(null)
  const [reviews,  setReviews]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [qty,      setQty]      = useState(1)
  const [adding,   setAdding]   = useState(false)
  const [myRating, setMyRating] = useState(0)
  const [myComment,setMyComment]= useState('')
  const [submitting,setSubmitting]=useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([getProduct(id), getReviews(id, { size: 20 })])
      .then(([pRes, rRes]) => {
        setProduct(pRes.data.data)
        setReviews(rRes.data.data.content || [])
      })
      .catch(() => navigate('/products'))
      .finally(() => setLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    if (!isLoggedIn) { navigate('/login'); return }
    setAdding(true)
    try { await addItem(product.id, qty); show(`Added ${qty}× ${product.name} to cart!`, 'success') }
    catch (e) { show(e.response?.data?.message || 'Failed to add', 'error') }
    finally { setAdding(false) }
  }

  const handleReview = async (e) => {
    e.preventDefault()
    if (!isLoggedIn) { navigate('/login'); return }
    if (!myRating) { show('Please select a rating', 'error'); return }
    setSubmitting(true)
    try {
      const res = await addReview(id, { rating: myRating, comment: myComment })
      setReviews(prev => [res.data.data, ...prev])
      setMyRating(0); setMyComment('')
      show('Review submitted!', 'success')
    } catch (e) { show(e.response?.data?.message || 'Could not submit review', 'error') }
    finally { setSubmitting(false) }
  }

  if (loading) return (
    <div className="page"><div className="container" style={{ paddingTop:'3rem' }}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'3rem' }}>
        <div className="skeleton" style={{ aspectRatio:'1', borderRadius:'var(--radius-lg)' }}/>
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          {[30,60,20,40,80].map((w,i)=><div key={i} className="skeleton" style={{ height:'20px', width:`${w}%` }}/>)}
        </div>
      </div>
    </div></div>
  )
  if (!product) return null

  const img = product.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=1a1a2e&color=7c6ffa&size=600`

  return (
    <div className="page page-enter">
      <div className="container">
        {/* Breadcrumb */}
        <div className="breadcrumb">
          <span onClick={() => navigate('/')} className="bc-link">Home</span>
          <span className="bc-sep">›</span>
          <span onClick={() => navigate('/products')} className="bc-link">Products</span>
          <span className="bc-sep">›</span>
          <span style={{ color:'var(--text-muted)' }}>{product.name}</span>
        </div>

        {/* Product Main */}
        <div className="product-detail-grid">
          {/* Image */}
          <div className="detail-img-wrap">
            <img src={img} alt={product.name} className="detail-img"
              onError={e=>e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(product.name)}&background=1a1a2e&color=7c6ffa&size=600`}/>
          </div>

          {/* Info */}
          <div className="detail-info">
            <div className="detail-category">{product.category?.name}</div>
            <h1 style={{ fontSize:'clamp(1.5rem,3vw,2rem)', fontFamily:'var(--font-display)' }}>{product.name}</h1>

            {product.averageRating > 0 && (
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{ display:'flex', gap:'2px' }}>
                  {[1,2,3,4,5].map(s=>(
                    <span key={s} style={{ fontSize:'1.1rem', color:s<=Math.round(product.averageRating)?'var(--gold)':'var(--text-muted)' }}>★</span>
                  ))}
                </div>
                <span style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>
                  {Number(product.averageRating).toFixed(1)} ({product.reviewCount} reviews)
                </span>
              </div>
            )}

            <div className="price price-large">${Number(product.price).toFixed(2)}</div>

            <p style={{ lineHeight:'1.8', color:'var(--text-secondary)' }}>{product.description}</p>

            <div className="detail-stock">
              {product.stockQuantity > 0
                ? <><span className="stock-dot in"/>In Stock ({product.stockQuantity} available)</>
                : <><span className="stock-dot out"/>Out of Stock</>}
            </div>

            {product.stockQuantity > 0 && (
              <div className="add-to-cart-row">
                <div className="qty-box">
                  <button className="qty-btn-lg" onClick={() => setQty(q=>Math.max(1,q-1))}>−</button>
                  <span style={{ fontWeight:700, fontSize:'1.1rem', minWidth:'2rem', textAlign:'center' }}>{qty}</span>
                  <button className="qty-btn-lg" onClick={() => setQty(q=>Math.min(product.stockQuantity, q+1))}>+</button>
                </div>
                <button className="btn btn-primary btn-lg" style={{ flex:1 }}
                  onClick={handleAddToCart} disabled={adding}>
                  {adding ? 'Adding…' : '+ Add to Cart'}
                </button>
              </div>
            )}

            <div className="detail-meta">
              <div><span>Category</span><strong>{product.category?.name}</strong></div>
              <div><span>Stock</span><strong>{product.stockQuantity}</strong></div>
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div className="reviews-section">
          <h2>Customer Reviews</h2>

          {isLoggedIn && (
            <form className="review-form" onSubmit={handleReview}>
              <h4>Write a Review</h4>
              <StarPicker value={myRating} onChange={setMyRating}/>
              <textarea className="input" rows={4} placeholder="Share your experience…"
                value={myComment} onChange={e=>setMyComment(e.target.value)}
                style={{ resize:'vertical' }}/>
              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <div style={{ color:'var(--text-muted)', padding:'2rem 0', textAlign:'center' }}>
              No reviews yet. Be the first!
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map(r => (
                <div key={r.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-avatar">{r.userName?.[0]?.toUpperCase()}</div>
                    <div>
                      <strong>{r.userName}</strong>
                      <div style={{ display:'flex', gap:'2px' }}>
                        {[1,2,3,4,5].map(s=>(
                          <span key={s} style={{ fontSize:'0.85rem', color:s<=r.rating?'var(--gold)':'var(--text-muted)' }}>★</span>
                        ))}
                      </div>
                    </div>
                    <span style={{ marginLeft:'auto', fontSize:'0.75rem', color:'var(--text-muted)' }}>
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.comment && <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', lineHeight:'1.7' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .breadcrumb { display:flex; gap:0.5rem; align-items:center; margin-bottom:2rem; font-size:0.875rem; }
        .bc-link { color:var(--text-secondary); cursor:pointer; }
        .bc-link:hover { color:var(--accent-bright); }
        .bc-sep { color:var(--text-muted); }
        .product-detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:3rem; margin-bottom:4rem; align-items:start; }
        .detail-img-wrap {
          aspect-ratio:1; border-radius:var(--radius-xl); overflow:hidden;
          background:var(--bg-surface); border:1px solid var(--border);
        }
        .detail-img { width:100%; height:100%; object-fit:cover; }
        .detail-info { display:flex; flex-direction:column; gap:1.25rem; }
        .detail-category { font-size:0.75rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--accent-bright); }
        .detail-stock { display:flex; align-items:center; gap:0.5rem; font-size:0.875rem; font-weight:500; }
        .stock-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }
        .stock-dot.in  { background:var(--teal); box-shadow:0 0 8px var(--teal); }
        .stock-dot.out { background:var(--red); }
        .add-to-cart-row { display:flex; gap:1rem; align-items:center; }
        .qty-box {
          display:flex; align-items:center; gap:0.75rem;
          background:var(--bg-elevated); border:1px solid var(--border);
          border-radius:var(--radius-md); padding:0.5rem 1rem;
        }
        .qty-btn-lg { font-size:1.25rem; font-weight:700; color:var(--text-secondary); width:24px; text-align:center; transition:var(--transition); }
        .qty-btn-lg:hover { color:var(--accent); }
        .detail-meta { display:flex; gap:2rem; padding:1rem; background:var(--glass); border:1px solid var(--border); border-radius:var(--radius-md); }
        .detail-meta div { display:flex; flex-direction:column; gap:0.2rem; }
        .detail-meta span { font-size:0.75rem; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; }
        .detail-meta strong { font-size:0.95rem; }
        .reviews-section { border-top:1px solid var(--border); padding-top:3rem; display:flex; flex-direction:column; gap:2rem; }
        .review-form {
          background:var(--bg-surface); border:1px solid var(--border);
          border-radius:var(--radius-lg); padding:1.5rem;
          display:flex; flex-direction:column; gap:1rem; max-width:600px;
        }
        .reviews-list { display:flex; flex-direction:column; gap:1rem; }
        .review-card { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-md); padding:1.25rem; display:flex; flex-direction:column; gap:0.75rem; }
        .review-header { display:flex; align-items:center; gap:0.75rem; }
        .reviewer-avatar { width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--accent-bright)); color:#fff; font-weight:700; font-size:0.875rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        @media(max-width:768px) { .product-detail-grid{grid-template-columns:1fr;} }
      `}</style>
    </div>
  )
}
