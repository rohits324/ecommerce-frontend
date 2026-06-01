import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { getMe, updateMe } from '../api/users'
import { getAddresses, addAddress, deleteAddress } from '../api/addresses'

export default function ProfilePage() {
  const { user, isLoggedIn, logout } = useAuth()
  const { show } = useToast()
  const navigate = useNavigate()
  const [name,      setName]      = useState(user?.name || '')
  const [saving,    setSaving]    = useState(false)
  const [addresses, setAddresses] = useState([])
  const [showForm,  setShowForm]  = useState(false)
  const [newAddr,   setNewAddr]   = useState({ fullName:'',phone:'',street:'',city:'',state:'',zipCode:'',country:'India',isDefault:false })

  useEffect(() => {
    if (!isLoggedIn) { navigate('/login'); return }
    getAddresses().then(r => setAddresses(r.data.data || []))
  }, [isLoggedIn])

  const handleSave = async (e) => {
    e.preventDefault(); setSaving(true)
    try { await updateMe({ name }); show('Profile updated!', 'success') }
    catch { show('Update failed', 'error') }
    finally { setSaving(false) }
  }

  const handleAddAddr = async (e) => {
    e.preventDefault()
    try {
      const res = await addAddress(newAddr)
      setAddresses(a => [...a, res.data.data])
      setShowForm(false)
      setNewAddr({ fullName:'',phone:'',street:'',city:'',state:'',zipCode:'',country:'India',isDefault:false })
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

  const handleDeleteAddr = async (id) => {
    if (!confirm('Delete this address?')) return
    try {
      await deleteAddress(id)
      setAddresses(a => a.filter(x => x.id !== id))
      show('Address deleted', 'success')
    } catch { show('Failed to delete', 'error') }
  }

  const na = k => v => setNewAddr(a => ({...a,[k]:v}))

  return (
    <div className="page page-enter">
      <div className="container" style={{ maxWidth:'800px' }}>
        <h1 style={{ fontFamily:'var(--font-display)', marginBottom:'2rem' }}>My Profile</h1>

        {/* Profile info */}
        <div className="profile-card">
          <div className="profile-avatar-lg">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="profile-info-header">
            <h3>{user?.name}</h3>
            <span className={`badge ${user?.role==='ADMIN'?'badge-gold':'badge-accent'}`}>{user?.role}</span>
            <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>{user?.email}</p>
          </div>
        </div>

        {/* Edit name */}
        <div className="section-card">
          <h4>Update Name</h4>
          <form onSubmit={handleSave} style={{ display:'flex', gap:'0.75rem', alignItems:'flex-end', flexWrap:'wrap' }}>
            <div className="input-group" style={{ flex:1, minWidth:'200px' }}>
              <label>Full Name</label>
              <input className="input" value={name} onChange={e=>setName(e.target.value)} required/>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving}>{saving?'Saving…':'Save'}</button>
          </form>
        </div>

        {/* Addresses */}
        <div className="section-card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h4>Saved Addresses</h4>
            <button className="btn btn-outline btn-sm" onClick={() => setShowForm(s=>!s)}>
              {showForm ? '✕ Cancel' : '+ Add Address'}
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleAddAddr} className="addr-form">
              <div className="addr-form-grid">
                {[['fullName','Full Name'],['phone','Phone'],['street','Street Address'],['city','City'],['state','State/Province'],['zipCode','ZIP Code'],['country','Country']].map(([k,label])=>(
                  <div key={k} className="input-group" style={{ gridColumn:k==='street'||k==='fullName'?'span 2':'auto' }}>
                    <label>{label}</label>
                    <input className="input" required value={newAddr[k]} onChange={e=>na(k)(e.target.value)}/>
                  </div>
                ))}
              </div>
              <label style={{ display:'flex', gap:'0.5rem', alignItems:'center', fontSize:'0.875rem', color:'var(--text-secondary)', cursor:'pointer' }}>
                <input type="checkbox" checked={newAddr.isDefault} onChange={e=>na('isDefault')(e.target.checked)}/>
                Set as default address
              </label>
              <button className="btn btn-primary btn-sm" type="submit">Save Address</button>
            </form>
          )}

          {addresses.length === 0 && !showForm && (
            <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>No saved addresses yet.</p>
          )}

          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem', marginTop:'0.5rem' }}>
            {addresses.map(addr => (
              <div key={addr.id} className="addr-row">
                <div className="addr-row-content">
                  <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
                    <strong style={{ fontSize:'0.9rem' }}>{addr.fullName}</strong>
                    {addr.isDefault && <span className="badge badge-accent">Default</span>}
                  </div>
                  <span style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{addr.phone}</span>
                  <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>
                    {addr.street}, {addr.city}, {addr.state} {addr.zipCode}, {addr.country}
                  </span>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAddr(addr.id)}>Delete</button>
              </div>
            ))}
          </div>
        </div>

        {/* Danger zone */}
        <div className="section-card" style={{ borderColor:'rgba(255,77,109,0.2)' }}>
          <h4 style={{ color:'var(--red)' }}>Sign Out</h4>
          <p style={{ fontSize:'0.875rem', color:'var(--text-muted)' }}>You'll need to sign in again to access your account.</p>
          <button className="btn btn-danger" style={{ marginTop:'0.75rem' }} onClick={() => { logout(); navigate('/') }}>Sign Out</button>
        </div>
      </div>

      <style>{`
        .profile-card { display:flex; align-items:center; gap:1.5rem; padding:1.75rem; background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-lg); margin-bottom:1.5rem; }
        .profile-avatar-lg { width:64px; height:64px; border-radius:50%; background:linear-gradient(135deg,var(--accent),var(--accent-bright)); color:#fff; font-weight:700; font-size:1.5rem; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .profile-info-header { display:flex; flex-direction:column; gap:0.3rem; }
        .profile-info-header h3 { font-family:var(--font-display); }
        .section-card { background:var(--bg-surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:1.75rem; margin-bottom:1.5rem; }
        .section-card h4 { font-size:1rem; font-weight:700; margin-bottom:1rem; }
        .addr-row { display:flex; align-items:center; gap:1rem; padding:0.9rem 1rem; background:var(--bg-elevated); border-radius:var(--radius-md); border:1px solid var(--border); }
        .addr-row-content { flex:1; display:flex; flex-direction:column; gap:0.2rem; }
        .addr-form { background:var(--bg-elevated); border:1px solid var(--border); border-radius:var(--radius-md); padding:1.25rem; margin-bottom:1rem; display:flex; flex-direction:column; gap:1rem; }
        .addr-form-grid { display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; }
        @media(max-width:600px) { .addr-form-grid{grid-template-columns:1fr;} .addr-form-grid [style*="span 2"]{grid-column:auto;} }
      `}</style>
    </div>
  )
}
