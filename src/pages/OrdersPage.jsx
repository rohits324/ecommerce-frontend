import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, cancelOrder } from '../api/orders'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const STATUS_STYLES = {
  PENDING:    'badge-orange', CONFIRMED: 'badge-accent',
  PROCESSING: 'badge-accent', SHIPPED:   'badge-teal',
  DELIVERED:  'badge-teal',   CANCELLED: 'badge-red',
  REFUNDED:   'badge-red',
}

export default function OrdersPage() {
  const { isLoggedIn } = useAuth()
  const { show } = useToast()
  const navigate = useNavigate()
  const [orders,  setOrders]  = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded,setExpanded]= useState(null)

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    getOrders({ size:50 }).then(r => setOrders(r.data.data.content || []))
      .finally(() => setLoading(false))
  }, [isLoggedIn])

  const handleCancel = async (orderId) => {
    if (!confirm('Cancel this order?')) return
    try {
      const res = await cancelOrder(orderId)
      setOrders(ords => ords.map(o => o.id===orderId ? res.data.data : o))
      show('Order cancelled', 'success')
    } catch (e) { show(e.response?.data?.message || 'Cannot cancel order', 'error') }
  }

  if (loading) return <div className="page"><div className="container" style={{ paddingTop:'3rem' }}>
    {Array(3).fill(0).map((_,i)=><div key={i} className="skeleton" style={{ height:'100px', borderRadius:'var(--radius-lg)', marginBottom:'1rem' }}/>)}
  </div></div>

  return (
    <div className="page page-enter">
      <div className="container" style={{ maxWidth:'900px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', marginBottom:'2rem' }}>My Orders</h1>
        {orders.length === 0 ? (
          <div style={{ textAlign:'center', paddingTop:'4rem', color:'var(--text-muted)' }}>
            <span style={{ fontSize:'4rem' }}>📦</span>
            <h3 style={{ marginTop:'1rem' }}>No orders yet</h3>
            <button className="btn btn-primary" style={{ marginTop:'1.5rem' }} onClick={()=>navigate('/products')}>Start Shopping</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header" onClick={() => setExpanded(e => e===order.id ? null : order.id)}>
                  <div className="order-id">
                    <span style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>Order</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontWeight:600 }}>#{order.id}</span>
                  </div>
                  <span className={`badge ${STATUS_STYLES[order.status] || 'badge-accent'}`}>{order.status}</span>
                  <span className="price">${Number(order.totalAmount).toFixed(2)}</span>
                  <span style={{ color:'var(--text-muted)', fontSize:'0.78rem' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  <span style={{ color:'var(--text-muted)' }}>{expanded===order.id?'▲':'▼'}</span>
                </div>

                {expanded === order.id && (
                  <div className="order-detail">
                    <div className="order-items">
                      {order.orderItems.map(item => (
                        <div key={item.id} className="order-item">
                          <span style={{ flex:1 }}>{item.productName}</span>
                          <span style={{ color:'var(--text-muted)' }}>×{item.quantity}</span>
                          <span className="price">${Number(item.subtotal).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="divider"/>
                    <div className="order-ship-info">
                      <strong>📍 Shipping to:</strong>
                      <span>{order.shippingFullName} · {order.shippingCity}, {order.shippingState}, {order.shippingCountry}</span>
                    </div>
                    {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
                      <button className="btn btn-danger btn-sm" style={{ marginTop:'0.75rem', width:'fit-content' }}
                        onClick={() => handleCancel(order.id)}>Cancel Order</button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        .orders-list { display:flex; flex-direction:column; gap:1rem; }
        .order-card { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-lg); overflow:hidden; }
        .order-header { display:flex; align-items:center; gap:1.5rem; padding:1.25rem 1.5rem; cursor:pointer; transition:var(--transition); }
        .order-header:hover { background:var(--glass); }
        .order-id { display:flex; flex-direction:column; gap:0.1rem; }
        .order-detail { border-top:1px solid var(--border); padding:1.25rem 1.5rem; display:flex; flex-direction:column; gap:0.75rem; animation:fadeInUp 0.2s ease; }
        .order-items { display:flex; flex-direction:column; gap:0.5rem; }
        .order-item { display:flex; gap:1rem; font-size:0.875rem; padding:0.35rem 0; }
        .order-ship-info { display:flex; flex-direction:column; gap:0.25rem; font-size:0.875rem; color:var(--text-secondary); }
        .order-ship-info strong { color:var(--text-primary); }
      `}</style>
    </div>
  )
}
