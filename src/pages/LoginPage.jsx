import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

export default function LoginPage() {
  const [params]  = useSearchParams()
  const [tab, setTab]         = useState(params.get('tab') === 'register' ? 'register' : 'login')
  const [loading, setLoading] = useState(false)
  const [form, setForm]       = useState({ name:'', email:'', password:'' })
  const { login, register, isLoggedIn } = useAuth()
  const { show }   = useToast()
  const navigate   = useNavigate()

  useEffect(() => { if (isLoggedIn) navigate('/') }, [isLoggedIn])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true)
    try {
      if (tab === 'login') { await login({ email: form.email, password: form.password }); show('Welcome back!', 'success') }
      else                 { await register(form); show('Account created! Welcome!', 'success') }
      navigate('/')
    } catch (err) {
      show(err.response?.data?.message || (tab==='login'?'Invalid credentials':'Registration failed'), 'error')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page page-enter">
      <div className="auth-bg"/>
      <div className="auth-card glass">
        {/* Header */}
        <Link to="/" className="auth-logo">
          <span style={{ color:'var(--accent)', fontSize:'1.5rem' }}>✦</span>
          <span style={{ fontFamily:'var(--font-display)', fontWeight:700, fontSize:'1.3rem',
            background:'linear-gradient(135deg,var(--accent-bright),var(--gold))',
            WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>LuxeShop</span>
        </Link>

        {/* Tab switcher */}
        <div className="auth-tabs">
          <button className={`auth-tab ${tab==='login'?'active':''}`} onClick={()=>setTab('login')}>Sign In</button>
          <button className={`auth-tab ${tab==='register'?'active':''}`} onClick={()=>setTab('register')}>Create Account</button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {tab === 'register' && (
            <div className="input-group">
              <label>Full Name</label>
              <input className="input" required placeholder="John Doe"
                value={form.name} onChange={e=>set('name',e.target.value)}/>
            </div>
          )}
          <div className="input-group">
            <label>Email</label>
            <input className="input" type="email" required placeholder="you@example.com"
              value={form.email} onChange={e=>set('email',e.target.value)}/>
          </div>
          <div className="input-group">
            <label>Password</label>
            <input className="input" type="password" required placeholder="••••••••"
              minLength={6} value={form.password} onChange={e=>set('password',e.target.value)}/>
          </div>
          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? 'Please wait…' : tab==='login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          {tab === 'login'
            ? <>New here? <button className="text-btn" onClick={()=>setTab('register')}>Create an account</button></>
            : <>Already have an account? <button className="text-btn" onClick={()=>setTab('login')}>Sign in</button></>}
        </p>

        {tab === 'login' && (
          <div className="demo-creds">
            <p>Demo credentials:</p>
            <div className="cred-row" onClick={() => setForm({name:'',email:'admin@ecommerce.com',password:'admin123'})}>
              <span className="badge badge-accent">Admin</span>
              <code>admin@ecommerce.com / admin123</code>
            </div>
            <div className="cred-row" onClick={() => setForm({name:'',email:'john@example.com',password:'password123'})}>
              <span className="badge badge-teal">Customer</span>
              <code>john@example.com / password123</code>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh; display:flex; align-items:center; justify-content:center;
          padding: 2rem; position:relative;
        }
        .auth-bg {
          position:fixed; inset:0; pointer-events:none;
          background: radial-gradient(ellipse 70% 70% at 50% 0%, rgba(124,111,250,0.2) 0%, transparent 70%);
        }
        .auth-card {
          width:100%; max-width:440px; padding:2.5rem;
          display:flex; flex-direction:column; gap:1.5rem;
          position:relative; z-index:1;
        }
        .auth-logo { display:flex; align-items:center; gap:0.5rem; justify-content:center; }
        .auth-tabs {
          display:flex; background:var(--bg-elevated);
          border-radius:var(--radius-md); padding:3px; gap:3px;
        }
        .auth-tab {
          flex:1; padding:0.5rem; border-radius:calc(var(--radius-md) - 2px);
          font-size:0.875rem; font-weight:600; color:var(--text-muted);
          transition:var(--transition);
        }
        .auth-tab.active { background:var(--accent); color:white; }
        .auth-form { display:flex; flex-direction:column; gap:1rem; }
        .auth-footer { text-align:center; font-size:0.875rem; color:var(--text-muted); }
        .text-btn { color:var(--accent-bright); font-weight:600; font-size:inherit; text-decoration:underline; text-decoration-color:transparent; transition:var(--transition); }
        .text-btn:hover { text-decoration-color:var(--accent-bright); }
        .demo-creds {
          background:rgba(124,111,250,0.08); border:1px solid var(--border-accent);
          border-radius:var(--radius-md); padding:1rem;
          display:flex; flex-direction:column; gap:0.5rem; font-size:0.8rem;
        }
        .demo-creds p { color:var(--text-muted); font-weight:600; text-transform:uppercase; letter-spacing:0.06em; font-size:0.7rem; }
        .cred-row {
          display:flex; align-items:center; gap:0.5rem;
          cursor:pointer; padding:0.4rem 0.5rem; border-radius:var(--radius-sm);
          transition:var(--transition);
        }
        .cred-row:hover { background:var(--glass-strong); }
        .cred-row code { font-family:var(--font-mono); font-size:0.75rem; color:var(--text-secondary); }
      `}</style>
    </div>
  )
}
