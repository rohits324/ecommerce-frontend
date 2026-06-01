import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useToast } from '../../context/ToastContext'

export default function CartDrawer({ open, onClose }) {
  const { cart, updateQty, removeCartItem } = useCart()
  const { show } = useToast()
  const navigate = useNavigate()

  if (!open) return null

  const handleCheckout = () => {
    onClose()
    navigate('/checkout')
  }

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose}/>
      <div className="cart-drawer">
        <div className="drawer-header">
          <h3>Your Cart</h3>
          <button className="drawer-close" onClick={onClose}>✕</button>
        </div>

        {cart.items.length === 0 ? (
          <div className="drawer-empty">
            <span style={{ fontSize:'3rem' }}>🛒</span>
            <p>Your cart is empty</p>
            <button className="btn btn-primary btn-sm" onClick={onClose}>Continue Shopping</button>
          </div>
        ) : (
          <>
            <div className="drawer-items">
              {cart.items.map(item => (
                <div key={item.id} className="drawer-item">
                  <div className="drawer-item-img">
                    <img
                      src={item.productImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.productName)}&background=1a1a2e&color=7c6ffa`}
                      alt={item.productName}
                      onError={e=>e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(item.productName)}&background=1a1a2e&color=7c6ffa`}
                    />
                  </div>
                  <div className="drawer-item-info">
                    <p className="drawer-item-name">{item.productName}</p>
                    <span className="price">${Number(item.unitPrice).toFixed(2)}</span>
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => {
                        if (item.quantity === 1) removeCartItem(item.id).catch(()=>show('Error', 'error'))
                        else updateQty(item.id, item.quantity - 1).catch(()=>show('Error', 'error'))
                      }}>−</button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() =>
                        updateQty(item.id, item.quantity + 1).catch(()=>show('Error', 'error'))
                      }>+</button>
                      <button className="remove-btn" onClick={() =>
                        removeCartItem(item.id).catch(()=>show('Error', 'error'))
                      }>🗑</button>
                    </div>
                  </div>
                  <span className="drawer-item-subtotal">${Number(item.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="drawer-footer">
              <div className="drawer-total">
                <span>Total</span>
                <span className="price price-large">${Number(cart.totalAmount).toFixed(2)}</span>
              </div>
              <button className="btn btn-primary btn-full btn-lg" onClick={handleCheckout}>
                Checkout →
              </button>
              <button className="btn btn-ghost btn-full" onClick={onClose} style={{marginTop:'0.5rem'}}>
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
      <style>{`
        .drawer-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          z-index: 1100;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .cart-drawer {
          position: fixed; right: 0; top: 0; bottom: 0;
          width: min(420px, 100vw);
          background: var(--bg-surface);
          border-left: 1px solid var(--border);
          z-index: 1101;
          display: flex; flex-direction: column;
          animation: slideInFromRight 0.3s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes slideInFromRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        .drawer-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid var(--border);
        }
        .drawer-header h3 { font-family: var(--font-display); font-size:1.3rem; }
        .drawer-close {
          width: 32px; height: 32px; border-radius: var(--radius-full);
          background: var(--glass); color: var(--text-muted);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; transition: var(--transition);
        }
        .drawer-close:hover { color: var(--text-primary); background: var(--glass-strong); }
        .drawer-empty {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center; gap: 1rem;
          color: var(--text-muted); text-align: center;
        }
        .drawer-items { flex: 1; overflow-y: auto; padding: 1rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
        .drawer-item {
          display: flex; gap: 1rem; align-items: flex-start;
          padding: 0.75rem; background: var(--glass);
          border-radius: var(--radius-md); border: 1px solid var(--border);
        }
        .drawer-item-img {
          width: 70px; height: 70px; border-radius: var(--radius-sm);
          overflow: hidden; flex-shrink: 0; background: var(--bg-elevated);
        }
        .drawer-item-img img { width: 100%; height: 100%; object-fit: cover; }
        .drawer-item-info { flex: 1; display: flex; flex-direction: column; gap: 0.3rem; }
        .drawer-item-name { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); line-height: 1.3; }
        .qty-controls { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.25rem; }
        .qty-btn {
          width: 26px; height: 26px; border-radius: var(--radius-sm);
          background: var(--bg-elevated); border: 1px solid var(--border);
          color: var(--text-primary); font-size: 1rem; font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          transition: var(--transition);
        }
        .qty-btn:hover { border-color: var(--accent); color: var(--accent); }
        .qty-value { font-size: 0.9rem; font-weight: 600; min-width: 20px; text-align: center; }
        .remove-btn { font-size: 0.9rem; color: var(--text-muted); transition: var(--transition); margin-left: 0.25rem; }
        .remove-btn:hover { color: var(--red); }
        .drawer-item-subtotal { font-family: var(--font-mono); font-weight: 600; color: var(--gold); font-size: 0.9rem; }
        .drawer-footer {
          padding: 1.25rem 1.5rem;
          border-top: 1px solid var(--border);
          background: var(--bg-elevated);
        }
        .drawer-total {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 1rem; font-weight: 600;
        }
      `}</style>
    </>
  )
}
