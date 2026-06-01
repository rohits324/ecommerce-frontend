import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getProducts, createProduct, updateProduct, deleteProduct, getCategories, createCategory } from '../api/products'
import { getAllOrders, updateOrderStatus } from '../api/orders'
import { getAllUsers } from '../api/users'

const STATUS_OPTIONS = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED','REFUNDED']

export default function AdminDashboard() {
  const { isAdmin, isLoggedIn } = useAuth()
  const { show } = useToast()
  const navigate = useNavigate()
  const [tab,      setTab]      = useState('products')
  const [products, setProducts] = useState([])
  const [categories,setCats]    = useState([])
  const [orders,   setOrders]   = useState([])
  const [users,    setUsers]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [editProd, setEditProd] = useState(null)
  const [showProd, setShowProd] = useState(false)
  const [prodForm, setProdForm] = useState({ name:'',description:'',price:'',stockQuantity:'',categoryId:'',imageUrl:'',active:true })

  useEffect(() => {
    if (!isLoggedIn || !isAdmin) { navigate('/'); return }
    Promise.all([
      getProducts({ size:100 }),
      getCategories(),
      getAllOrders({ size:100 }),
      getAllUsers({ size:100 })
    ]).then(([pR,cR,oR,uR]) => {
      setProducts(pR.data.data.content || [])
      setCats(cR.data.data || [])
      setOrders(oR.data.data.content || [])
      setUsers(uR.data.data.content || [])
    }).finally(() => setLoading(false))
  }, [isLoggedIn, isAdmin])

  const openEdit = (p) => {
    setEditProd(p)
    setProdForm({ name:p.name, description:p.description||'', price:p.price, stockQuantity:p.stockQuantity, categoryId:p.category.id, imageUrl:p.imageUrl||'', active:p.active })
    setShowProd(true)
  }

  const openCreate = () => {
    setEditProd(null)
    setProdForm({ name:'',description:'',price:'',stockQuantity:'',categoryId:categories[0]?.id||'',imageUrl:'',active:true })
    setShowProd(true)
  }

  const handleSaveProd = async (e) => {
    e.preventDefault()
    try {
      const data = { ...prodForm, price: parseFloat(prodForm.price), stockQuantity: parseInt(prodForm.stockQuantity), categoryId: parseInt(prodForm.categoryId) }
      if (editProd) {
        const res = await updateProduct(editProd.id, data)
        setProducts(ps => ps.map(p => p.id===editProd.id ? res.data.data : p))
        show('Product updated!', 'success')
      } else {
        const res = await createProduct(data)
        setProducts(ps => [res.data.data, ...ps])
        show('Product created!', 'success')
      }
      setShowProd(false)
    } catch (e) { show(e.response?.data?.message || 'Failed', 'error') }
  }

  const handleDeleteProd = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      await deleteProduct(id)
      setProducts(ps => ps.filter(p => p.id!==id))
      show('Product deleted', 'success')
    } catch { show('Failed to delete', 'error') }
  }

  const handleOrderStatus = async (orderId, status) => {
    try {
      const res = await updateOrderStatus(orderId, { status })
      setOrders(ords => ords.map(o => o.id===orderId ? res.data.data : o))
      show(`Status updated to ${status}`, 'success')
    } catch (e) { show(e.response?.data?.message || 'Failed', 'error') }
  }

  const pf = k => v => setProdForm(f => ({...f,[k]:v}))

  const STATUS_COLORS = { PENDING:'badge-orange',CONFIRMED:'badge-accent',PROCESSING:'badge-accent',SHIPPED:'badge-teal',DELIVERED:'badge-teal',CANCELLED:'badge-red',REFUNDED:'badge-red' }

  // Stats
  const revenue = orders.filter(o=>o.status!=='CANCELLED'&&o.status!=='REFUNDED').reduce((s,o)=>s+Number(o.totalAmount),0)

  return (
    <div className="page page-enter">
      <div className="container">
        <h1 style={{ fontFamily:'var(--font-display)', marginBottom:'0.5rem' }}>Admin Dashboard</h1>
        <p style={{ color:'var(--text-muted)', marginBottom:'2rem' }}>Manage your store</p>

        {/* Stats */}
        <div className="stats-grid">
          {[
            { label:'Total Revenue', value:`$${revenue.toFixed(2)}`, icon:'💰', color:'var(--gold)' },
            { label:'Total Orders',  value:orders.length,           icon:'📦', color:'var(--accent-bright)' },
            { label:'Products',      value:products.length,         icon:'🛍️', color:'var(--teal)' },
            { label:'Users',         value:users.length,            icon:'👥', color:'var(--orange)' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <span style={{ fontSize:'2rem' }}>{s.icon}</span>
              <div>
                <div style={{ fontSize:'1.75rem', fontWeight:700, fontFamily:'var(--font-mono)', color:s.color }}>{s.value}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.06em' }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {['products','orders','users'].map(t=>(
            <button key={t} className={`admin-tab ${tab===t?'active':''}`} onClick={()=>setTab(t)}>
              {t.charAt(0).toUpperCase()+t.slice(1)}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {tab === 'products' && (
          <div>
            <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'1rem' }}>
              <button className="btn btn-primary" onClick={openCreate}>+ New Product</button>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead><tr>
                  <th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Actions</th>
                </tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td>
                        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                          <img src={p.imageUrl||`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=1a1a2e&color=7c6ffa`}
                            onError={e=>e.target.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(p.name)}&background=1a1a2e&color=7c6ffa`}
                            style={{ width:'40px',height:'40px',borderRadius:'var(--radius-sm)',objectFit:'cover' }} alt=""/>
                          <span style={{ fontWeight:500 }}>{p.name}</span>
                        </div>
                      </td>
                      <td><span className="badge badge-accent">{p.category?.name}</span></td>
                      <td className="price">${Number(p.price).toFixed(2)}</td>
                      <td><span style={{ color: p.stockQuantity>10?'var(--teal)':p.stockQuantity>0?'var(--orange)':'var(--red)', fontWeight:600 }}>{p.stockQuantity}</span></td>
                      <td>
                        <div style={{ display:'flex', gap:'0.5rem' }}>
                          <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(p)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={()=>handleDeleteProd(p.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Order #</th><th>Customer</th><th>Amount</th><th>Status</th><th>Date</th><th>Update Status</th></tr></thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td><span style={{ fontFamily:'var(--font-mono)' }}>#{o.id}</span></td>
                    <td>{o.shippingFullName}</td>
                    <td className="price">${Number(o.totalAmount).toFixed(2)}</td>
                    <td><span className={`badge ${STATUS_COLORS[o.status]||'badge-accent'}`}>{o.status}</span></td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>
                      <select className="input" style={{ padding:'0.35rem 0.5rem', fontSize:'0.8rem', width:'130px' }}
                        value={o.status} onChange={e=>handleOrderStatus(o.id, e.target.value)}>
                        {STATUS_OPTIONS.map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight:500 }}>{u.name}</td>
                    <td style={{ color:'var(--text-muted)' }}>{u.email}</td>
                    <td><span className={`badge ${u.role==='ADMIN'?'badge-gold':'badge-accent'}`}>{u.role}</span></td>
                    <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProd && (
        <>
          <div className="modal-backdrop" onClick={()=>setShowProd(false)}/>
          <div className="modal">
            <div className="modal-header">
              <h3>{editProd ? 'Edit Product' : 'New Product'}</h3>
              <button className="drawer-close" onClick={()=>setShowProd(false)}>✕</button>
            </div>
            <form onSubmit={handleSaveProd} className="modal-body">
              <div className="modal-grid">
                {[['name','Name','text',true],['price','Price','number',true],['stockQuantity','Stock','number',true],['imageUrl','Image URL','text',false]].map(([k,label,type,req])=>(
                  <div key={k} className="input-group" style={{ gridColumn:k==='name'||k==='imageUrl'?'span 2':'auto' }}>
                    <label>{label}</label>
                    <input className="input" type={type} required={req} value={prodForm[k]}
                      step={k==='price'?'0.01':undefined}
                      onChange={e=>pf(k)(e.target.value)}/>
                  </div>
                ))}
                <div className="input-group" style={{ gridColumn:'span 2' }}>
                  <label>Description</label>
                  <textarea className="input" rows={3} value={prodForm.description} onChange={e=>pf('description')(e.target.value)} style={{ resize:'vertical' }}/>
                </div>
                <div className="input-group">
                  <label>Category</label>
                  <select className="input" value={prodForm.categoryId} onChange={e=>pf('categoryId')(e.target.value)}>
                    {categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="input-group" style={{ justifyContent:'center' }}>
                  <label style={{ display:'flex', gap:'0.5rem', alignItems:'center', cursor:'pointer', paddingTop:'1.5rem' }}>
                    <input type="checkbox" checked={prodForm.active} onChange={e=>pf('active')(e.target.checked)}/>
                    Active (visible in store)
                  </label>
                </div>
              </div>
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', marginTop:'1rem' }}>
                <button type="button" className="btn btn-ghost" onClick={()=>setShowProd(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editProd?'Save Changes':'Create Product'}</button>
              </div>
            </form>
          </div>
        </>
      )}

      <style>{`
        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:1rem; margin-bottom:2rem; }
        .stat-card { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:1.5rem; display:flex; align-items:center; gap:1rem; transition:var(--transition); }
        .stat-card:hover { border-color:var(--border-accent); transform:translateY(-2px); }
        .admin-tabs { display:flex; gap:0.5rem; margin-bottom:1.5rem; border-bottom:1px solid var(--border); }
        .admin-tab { padding:0.65rem 1.25rem; font-size:0.875rem; font-weight:600; color:var(--text-muted); transition:var(--transition); border-bottom:2px solid transparent; margin-bottom:-1px; }
        .admin-tab:hover { color:var(--text-primary); }
        .admin-tab.active { color:var(--accent-bright); border-bottom-color:var(--accent-bright); }
        .admin-table-wrap { overflow-x:auto; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-lg); }
        .admin-table { width:100%; border-collapse:collapse; font-size:0.875rem; }
        .admin-table th { padding:0.875rem 1.25rem; text-align:left; font-size:0.72rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; border-bottom:1px solid var(--border); }
        .admin-table td { padding:0.875rem 1.25rem; border-bottom:1px solid rgba(255,255,255,0.04); }
        .admin-table tr:last-child td { border-bottom:none; }
        .admin-table tr:hover td { background:var(--glass); }
        .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.7); backdrop-filter:blur(4px); z-index:2000; }
        .modal { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); width:min(600px,95vw); max-height:90vh; overflow-y:auto; background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--radius-xl); z-index:2001; animation:fadeInUp 0.2s ease; }
        .modal-header { display:flex; align-items:center; justify-content:space-between; padding:1.5rem; border-bottom:1px solid var(--border); }
        .modal-header h3 { font-family:var(--font-display); font-size:1.2rem; }
        .modal-body { padding:1.5rem; display:flex; flex-direction:column; gap:1rem; }
        .modal-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
        @media(max-width:900px){ .stats-grid{grid-template-columns:1fr 1fr;} }
        @media(max-width:600px){ .stats-grid{grid-template-columns:1fr;} .modal-grid{grid-template-columns:1fr;} .modal-grid [style*="span 2"]{grid-column:auto;} }
      `}</style>
    </div>
  )
}
