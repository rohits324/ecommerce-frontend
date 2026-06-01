import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts, getCategories } from '../api/products'
import ProductCard from '../components/product/ProductCard'

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products,   setProducts]   = useState([])
  const [categories, setCategories] = useState([])
  const [total,      setTotal]      = useState(0)
  const [loading,    setLoading]    = useState(true)
  const [page,       setPage]       = useState(0)

  const keyword    = searchParams.get('keyword')    || ''
  const categoryId = searchParams.get('categoryId') || ''
  const minPrice   = searchParams.get('minPrice')   || ''
  const maxPrice   = searchParams.get('maxPrice')   || ''
  const sort       = searchParams.get('sort')       || 'createdAt,desc'

  useEffect(() => { getCategories().then(r => setCategories(r.data.data || [])) }, [])

  useEffect(() => {
    setLoading(true)
    const params = { page, size: 12, sort }
    if (keyword)    params.keyword    = keyword
    if (categoryId) params.categoryId = categoryId
    if (minPrice)   params.minPrice   = minPrice
    if (maxPrice)   params.maxPrice   = maxPrice
    getProducts(params).then(r => {
      setProducts(r.data.data.content || [])
      setTotal(r.data.data.totalElements || 0)
    }).finally(() => setLoading(false))
  }, [keyword, categoryId, minPrice, maxPrice, sort, page])

  const set = (key, val) => {
    const next = new URLSearchParams(searchParams)
    val ? next.set(key, val) : next.delete(key)
    next.delete('page')
    setPage(0)
    setSearchParams(next)
  }

  const sortOptions = [
    { label: 'Newest', value: 'createdAt,desc' },
    { label: 'Price: Low→High', value: 'price,asc' },
    { label: 'Price: High→Low', value: 'price,desc' },
    { label: 'Name A→Z', value: 'name,asc' },
  ]

  return (
    <div className="page page-enter">
      <div className="container">
        <div className="products-page-header">
          <h1 style={{ fontSize:'clamp(1.5rem,3vw,2rem)' }}>
            {keyword ? `Results for "${keyword}"` : categoryId
              ? categories.find(c=>c.id==categoryId)?.name || 'Products'
              : 'All Products'}
          </h1>
          <span style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>
            {total} product{total !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="products-layout">
          {/* ── Sidebar Filters ── */}
          <aside className="filters-panel">
            <h4>Filters</h4>
            <div className="filter-section">
              <label>Search</label>
              <input className="input" placeholder="Search products…"
                defaultValue={keyword}
                onKeyDown={e => e.key === 'Enter' && set('keyword', e.target.value)}
                onChange={e => !e.target.value && set('keyword', '')}
              />
            </div>
            <div className="filter-section">
              <label>Category</label>
              <select className="input" value={categoryId} onChange={e=>set('categoryId', e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="filter-section">
              <label>Price Range</label>
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <input className="input" type="number" placeholder="Min $"
                  defaultValue={minPrice} onBlur={e=>set('minPrice', e.target.value)}/>
                <input className="input" type="number" placeholder="Max $"
                  defaultValue={maxPrice} onBlur={e=>set('maxPrice', e.target.value)}/>
              </div>
            </div>
            <button className="btn btn-ghost btn-full btn-sm" onClick={() => {
              setSearchParams({}); setPage(0)
            }}>Clear Filters</button>
          </aside>

          {/* ── Products ── */}
          <div className="products-main">
            {/* Sort bar */}
            <div className="sort-bar">
              <div className="sort-options">
                {sortOptions.map(o => (
                  <button key={o.value}
                    className={`sort-btn ${sort===o.value?'active':''}`}
                    onClick={() => set('sort', o.value)}
                  >{o.label}</button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="products-grid">
                {Array(12).fill(0).map((_,i)=>(
                  <div key={i} style={{ borderRadius:'var(--radius-lg)', overflow:'hidden', border:'1px solid var(--border)' }}>
                    <div className="skeleton" style={{ aspectRatio:'1' }}/>
                    <div style={{ padding:'1rem', display:'flex', flexDirection:'column', gap:'0.5rem' }}>
                      <div className="skeleton" style={{ height:'12px', width:'60%' }}/>
                      <div className="skeleton" style={{ height:'16px' }}/>
                      <div className="skeleton" style={{ height:'20px', width:'40%' }}/>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <span style={{ fontSize:'3rem' }}>🔍</span>
                <h3>No products found</h3>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="products-grid">
                {products.map(p => <ProductCard key={p.id} product={p}/>)}
              </div>
            )}

            {/* Pagination */}
            {total > 12 && (
              <div className="pagination">
                <button className="btn btn-ghost btn-sm" disabled={page===0} onClick={()=>setPage(p=>p-1)}>← Prev</button>
                <span style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>
                  Page {page+1} of {Math.ceil(total/12)}
                </span>
                <button className="btn btn-ghost btn-sm" disabled={(page+1)*12>=total} onClick={()=>setPage(p=>p+1)}>Next →</button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .products-page-header {
          display: flex; align-items: baseline; justify-content: space-between;
          margin-bottom: 2rem;
        }
        .products-layout { display: grid; grid-template-columns: 260px 1fr; gap: 2rem; align-items: start; }
        .filters-panel {
          background: var(--bg-surface); border: 1px solid var(--border);
          border-radius: var(--radius-lg); padding: 1.5rem;
          position: sticky; top: 80px;
          display: flex; flex-direction: column; gap: 1.25rem;
        }
        .filters-panel h4 { font-family: var(--font-display); font-size:1.1rem; margin-bottom:0.25rem; }
        .filter-section { display:flex; flex-direction:column; gap:0.5rem; }
        .filter-section label { font-size:0.8rem; font-weight:600; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.06em; }
        .sort-bar { display:flex; justify-content:flex-end; margin-bottom:1rem; }
        .sort-options { display:flex; gap:0.35rem; flex-wrap:wrap; }
        .sort-btn {
          padding: 0.35rem 0.75rem; border-radius: var(--radius-full);
          font-size: 0.78rem; font-weight: 500;
          background: var(--glass); color: var(--text-muted);
          border: 1px solid var(--border); transition: var(--transition);
        }
        .sort-btn:hover { color: var(--text-primary); }
        .sort-btn.active { background: rgba(124,111,250,0.15); color: var(--accent-bright); border-color: var(--border-accent); }
        .empty-state {
          text-align: center; padding: 5rem 0;
          display: flex; flex-direction: column; align-items: center; gap: 1rem;
          color: var(--text-muted);
        }
        .pagination {
          display: flex; align-items: center; justify-content: center; gap: 1.5rem;
          margin-top: 3rem;
        }
        @media (max-width: 900px) {
          .products-layout { grid-template-columns: 1fr; }
          .filters-panel { position: static; }
        }
      `}</style>
    </div>
  )
}
