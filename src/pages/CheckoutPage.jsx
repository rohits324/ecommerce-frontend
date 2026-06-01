import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getAddresses, addAddress } from '../api/addresses'
import { placeOrder } from '../api/orders'

export default function CheckoutPage() {
  const { cart, clearLocalCart, fetchCart } = useCart()
  const { isLoggedIn } = useAuth()
  const { show } = useToast()
  const navigate = useNavigate()
  const [addresses,   setAddresses]   = useState([])
  const [selectedAddr,setSelectedAddr]= useState(null)
  const [placing,     setPlacing]     = useState(false)
  const [showNewAddr, setShowNewAddr] = useState(false)
  const [newAddr,     setNewAddr]     = useState({ fullName:'',phone:'',street:'',city:'',state:'',zipCode:'',country:'India',isDefault:false })

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    getAddresses().then(r => {
      const addrs = r.data.data || []
      setAddresses(addrs)
      const def = addrs.find(a=>a.isDefault) || addrs[0]
      if (def) setSelectedAddr(def.id)
    })
  }, [isLoggedIn])

  const handleAddAddress = async (e) => {
    e.preventDefault()
    try {
      const res = await addAddress(newAddr)
      const added = res.data.data
      setAddresses(a => [...a, added])
      setSelectedAddr(added.id)
      setShowNewAddr(false)
      show('Address added!', 'success')
    } catch (err) {
      const apiError = err.response?.data
      if (apiError && apiError.data && typeof apiError.data === 'object') {
        const validationMsg = Object.values(apiError.data).join(', ')
        show(validationMsg, 'error')
      } else {
        show(apiError?.message || 'Failed to add address', 'error')
      }
    }
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddr) { show('Please select a shipping address', 'error'); return }
    setPlacing(true)
    try {
      const res = await placeOrder({ addressId: selectedAddr })
      await fetchCart()
      show('Order placed successfully! 🎉', 'success')
      navigate(`/orders`)
    } catch (err) { show(err.response?.data?.message || 'Failed to place order', 'error') }
    finally { setPlacing(false) }
  }

  if (!cart.items || cart.items.length === 0) return (
    <div className="page"><div className="container" style={{ textAlign:'center', paddingTop:'5rem' }}>
      <span style={{ fontSize:'4rem' }}>🛒</span>
      <h2>Your cart is empty</h2>
      <button className="btn btn-primary" style={{ marginTop:'1.5rem' }} onClick={()=>navigate('/products')}>Shop Now</button>
    </div></div>
  )

  const na = k => v => setNewAddr(a => ({...a,[k]:v}))

  return (
    <div className="page page-enter">
      <div className="container">
        <h1 style={{ fontFamily:'var(--font-display)', marginBottom:'2rem' }}>Checkout</h1>
        <div className="checkout-grid">

          {/* Left: Address */}
          <div className="checkout-section">
            <h3>Shipping Address</h3>
            <div className="address-list">
              {addresses.map(addr => (
                <div key={addr.id} className={`address-option ${selectedAddr===addr.id?'selected':''}`}
                  onClick={() => setSelectedAddr(addr.id)}>
                  <div className="addr-radio">{selectedAddr===addr.id ? '●' : '○'}</div>
                  <div className="addr-details">
                    <strong>{addr.fullName}</strong> · {addr.phone}
                    <div>{addr.street}{addr.street2?', '+addr.street2:''}</div>
                    <div>{addr.city}, {addr.state} {addr.zipCode}, {addr.country}</div>
                    {addr.isDefault && <span className="badge badge-accent" style={{marginTop:'0.25rem'}}>Default</span>}
                  </div>
                </div>
              ))}
              <button className="btn btn-outline btn-sm" onClick={() => setShowNewAddr(s=>!s)}>
                {showNewAddr ? '✕ Cancel' : '+ Add New Address'}
              </button>
            </div>

            {showNewAddr && (
              <form onSubmit={handleAddAddress} className="new-addr-form">
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                  {[['fullName','Full Name'],['phone','Phone'],['street','Street'],['city','City'],['state','State'],['zipCode','ZIP Code'],['country','Country']].map(([k,label])=>(
                    <div key={k} className="input-group" style={{gridColumn:k==='street'?'span 2':'auto'}}>
                      <label>{label}</label>
                      <input className="input" required value={newAddr[k]} onChange={e=>na(k)(e.target.value)}/>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary btn-sm" type="submit">Save Address</button>
              </form>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="checkout-summary">
            <h3>Order Summary</h3>
            <div className="summary-items">
              {cart.items.map(item => (
                <div key={item.id} className="summary-item">
                  <img src={item.productImageUrl||`https://ui-avatars.com/api/?name=${encodeURIComponent(item.productName)}&background=1a1a2e&color=7c6ffa`}
                    alt={item.productName}
                    onError={e=>e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(item.productName)}&background=1a1a2e&color=7c6ffa`}
                    style={{ width:'48px',height:'48px',borderRadius:'var(--radius-sm)',objectFit:'cover' }}/>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.875rem', fontWeight:500 }}>{item.productName}</div>
                    <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>×{item.quantity}</div>
                  </div>
                  <span className="price">${Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-divider"/>
            <div className="summary-row"><span>Subtotal</span><span className="price">${Number(cart.totalAmount).toFixed(2)}</span></div>
            <div className="summary-row"><span>Shipping</span><span style={{ color:'var(--teal)' }}>Free</span></div>
            <div className="summary-row total"><span>Total</span><span className="price price-large">${Number(cart.totalAmount).toFixed(2)}</span></div>
            <button className="btn btn-primary btn-full btn-lg" style={{ marginTop:'1rem' }}
              onClick={handlePlaceOrder} disabled={placing || !selectedAddr}>
              {placing ? 'Placing Order…' : '🛍 Place Order'}
            </button>
            <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textAlign:'center', marginTop:'0.75rem' }}>
              🔒 Mock payment — no real charges
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .checkout-grid { display:grid; grid-template-columns:1fr 400px; gap:2rem; align-items:start; }
        .checkout-section { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:1.75rem; display:flex; flex-direction:column; gap:1.25rem; }
        .checkout-section h3 { font-family:var(--font-display); font-size:1.2rem; }
        .address-list { display:flex; flex-direction:column; gap:0.75rem; }
        .address-option {
          display:flex; gap:1rem; padding:1rem;
          background:var(--bg-elevated); border:1px solid var(--border);
          border-radius:var(--radius-md); cursor:pointer; transition:var(--transition);
        }
        .address-option:hover { border-color:var(--border-accent); }
        .address-option.selected { border-color:var(--accent); background:rgba(124,111,250,0.08); }
        .addr-radio { font-size:1.1rem; color:var(--accent); margin-top:2px; }
        .addr-details { display:flex; flex-direction:column; gap:0.2rem; font-size:0.875rem; color:var(--text-secondary); }
        .addr-details strong { color:var(--text-primary); }
        .new-addr-form { background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--radius-md); padding:1.25rem; display:flex; flex-direction:column; gap:1rem; }
        .checkout-summary { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:1.75rem; position:sticky; top:80px; display:flex; flex-direction:column; gap:0.75rem; }
        .checkout-summary h3 { font-family:var(--font-display); font-size:1.2rem; }
        .summary-items { display:flex; flex-direction:column; gap:0.75rem; }
        .summary-item { display:flex; align-items:center; gap:0.75rem; }
        .summary-divider { height:1px; background:var(--border); margin:0.25rem 0; }
        .summary-row { display:flex; justify-content:space-between; align-items:center; font-size:0.9rem; }
        .summary-row.total { font-size:1.05rem; font-weight:700; margin-top:0.25rem; }
        @media(max-width:900px) { .checkout-grid{grid-template-columns:1fr;} .checkout-summary{position:static;} }
      `}</style>
    </div>
  )
}
