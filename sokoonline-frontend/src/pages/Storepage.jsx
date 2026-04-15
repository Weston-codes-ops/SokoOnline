import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Search, Package, X, SlidersHorizontal } from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const [products, setProducts]           = useState([])
  const [categories, setCategories]       = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState(searchParams.get('search') || '')
  const [selectedSubcategories, setSelectedSubcategories] = useState([])
  const [page, setPage]             = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/subcategories')])
      .then(([catRes, subRes]) => {
        setCategories(catRes.data)
        setSubcategories(subRes.data)
      }).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (search) params.append('search', search)
    params.append('page', 0)
    params.append('size', 500)
    api.get(`/products?${params}`)
      .then(res => {
        setProducts(res.data.content ?? res.data)
      })
      .finally(() => setLoading(false))
  }, [search])

  const subsForCat = (catId) => subcategories.filter(s => s.categoryId === catId)
  const selectedSubcategorySet = new Set(selectedSubcategories.map(String))
  const selectedSubObj = subcategories.filter(s => selectedSubcategorySet.has(String(s.id)))
  const selectedSubcategoryNames = selectedSubObj.map(sub => sub.name.toLowerCase())
  const hasFilters = Boolean(search || selectedSubcategories.length > 0)

  const displayProducts = products.filter(product => {
    if (selectedSubcategoryNames.length === 0) return true
    return selectedSubcategoryNames.includes(product.subcategoryName?.toLowerCase())
  })
  const pageSize = 20
  const totalPages = Math.max(1, Math.ceil(displayProducts.length / pageSize))
  const pagedProducts = displayProducts.slice(page * pageSize, (page + 1) * pageSize)

  const clearFilters = () => {
    setSearch('')
    setSelectedSubcategories([])
    setPage(0)
  }

  const handleSubChange = (subId) => {
    const nextId = String(subId)
    setSelectedSubcategories(prev => (
      prev.includes(nextId) ? prev.filter(id => id !== nextId) : [...prev, nextId]
    ))
    setPage(0)
  }

  const gridClasses = 'grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5'

  return (
    <div className="min-h-screen flex flex-col bg-[#f7faf6]">
      <Navbar />

      <div className="flex flex-1 h-full overflow-hidden min-h-0">

        <aside className={`
          ${sidebarOpen ? 'fixed inset-0 z-40 bg-black/40' : 'hidden'}
          lg:block lg:sticky lg:self-start lg:top-0 lg:bg-transparent lg:z-0 lg:h-screen
        `}
          aria-label="Product filters"
          onClick={e => { if (e.target === e.currentTarget) setSidebarOpen(false) }}>

          <div className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed left-0 top-0 bottom-0 z-50 w-72 bg-white border-r border-gray-200 shadow-2xl
            lg:static lg:translate-x-0 lg:shadow-none lg:w-72 lg:bg-white lg:border-none lg:top-0 lg:h-full
          `}>
            <div className="px-5 py-5 border-b border-gray-100">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal size={15} className="text-gray-900" />
                    <span className="text-sm font-extrabold text-gray-900">Shop by</span>
                  </div>
                  {hasFilters && (
                    <button onClick={clearFilters}
                      className="text-xs text-[#0f4c35] font-semibold hover:underline cursor-pointer">
                      Clear all
                    </button>
                  )}
                </div>

                {hasFilters && (
                  <div className="flex flex-wrap gap-2">
                    {selectedSubObj.map(sub => (
                      <span key={sub.id} className="inline-flex items-center gap-1 text-xs bg-[#fff7ed] text-[#92400e] px-2 py-0.5 rounded-full border border-[#f59e0b]/30 font-medium">
                        {sub.name}
                        <button onClick={() => handleSubChange(sub.id)}><X size={9} /></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="px-5 py-5 border-b border-gray-100">
              <div className="mb-3">
                <p className="text-sm font-semibold text-[#92400e]">Search your product</p>
                <p className="text-xs text-slate-500">Get whatever you want within minutes! Save the scroll time.</p>
              </div>
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(0) }}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-3 bg-slate-50 border border-gray-200 rounded-full text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50 focus:border-transparent"
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            <div className="px-5 py-4 space-y-6">
              {categories.map(cat => {
                const subs = subsForCat(cat.id)
                if (subs.length === 0) return null
                return (
                  <div key={cat.id}>
                    <div className="mb-3">
                      <p className="text-sm font-bold text-gray-800">{cat.name}</p>
                    </div>
                    <div className="space-y-2">
                      {subs.map(sub => {
                        const isSubSelected = selectedSubcategorySet.has(String(sub.id))
                        return (
                          <label key={sub.id} className="flex items-center gap-2.5 cursor-pointer group">
                            <input
                              type="checkbox"
                              checked={isSubSelected}
                              onChange={() => handleSubChange(sub.id)}
                              className="w-4 h-4 rounded border-gray-300 accent-[#0f4c35] cursor-pointer"
                            />
                            <span className={`text-sm transition-colors ${
                              isSubSelected
                                ? 'text-[#0f4c35] font-semibold'
                                : 'text-gray-600 group-hover:text-[#0f4c35] font-medium'
                            }`}>
                              {sub.name}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

          </div>
        </aside>

        {/* ══ MAIN CONTENT ═══════════════════════════════════════════ */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto">
          <div className="px-4 pt-6 pb-10 sm:px-6 lg:px-8">

            {/* Top bar — search + mobile filter + count */}
            <div className="flex items-center gap-3 mb-4 lg:hidden">
              <button onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center gap-2 px-3 py-2 bg-[#f59e0b] border border-[#f59e0b] rounded-full text-xs font-semibold text-white hover:bg-[#d97706] transition">
                <SlidersHorizontal size={14} /> Filters
              </button>
              <p className="text-xs text-slate-400">Use the sidebar on desktop or the filter button on mobile.</p>
            </div>

            <div className="pb-10">
              {/* ── PRODUCT GRID ───────────────────────────────────── */}
              {loading ? (
                <div className={gridClasses}>
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="bg-white rounded-3xl animate-pulse border border-gray-100 overflow-hidden">
                      <div className="aspect-[4/3] bg-gray-100" />
                      <div className="p-4 space-y-3">
                        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
                        <div className="h-4 bg-gray-100 rounded-full w-full" />
                        <div className="h-4 bg-gray-100 rounded-full w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayProducts.length === 0 ? (
                <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-3xl">
                  <Package size={32} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-700 mb-2">No products matched your search or filters.</p>
                  <p className="text-sm text-slate-500 mb-5">Try removing a filter, changing the search terms, or resetting the store view.</p>
                  <button onClick={clearFilters}
                    className="mt-2 inline-flex items-center justify-center rounded-full bg-[#f59e0b] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#d97706]">
                    Reset filters
                  </button>
                </div>
              ) : (
                <>
                  <div className={gridClasses}>
                    {pagedProducts.map(p => <ProductCard key={p.id} product={p} />)}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-10">
                      <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                        className="px-4 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                        ← Previous
                      </button>
                      <span className="text-xs text-gray-400 px-2">{page + 1} / {totalPages}</span>
                      <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                        className="px-4 py-2 text-xs font-semibold bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                        Next →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
      </main>
      </div>
    </div>
  )
}

function ProductCard({ product }) {
  return (
    <Link to={`/products/${product.slug}`}
      className="bg-white rounded-[28px] border border-[#f59e0b]/20 ring-1 ring-amber-50 overflow-hidden hover:shadow-xl transition duration-300 ease-out group flex flex-col">
      <div className="h-1.5 bg-[#f59e0b]" />
      <div className="aspect-[4/3] bg-slate-50 overflow-hidden relative">
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center">
              <Package size={20} className="text-gray-300" />
            </div>
        }
        {product.stockQuantity === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-semibold text-gray-400">Out of stock</span>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#fff7ed] text-[#92400e] text-[11px] font-semibold uppercase tracking-[0.15em] border border-[#f59e0b]/30">
            {product.subcategoryName || product.categoryName}
          </span>
          {product.reviewCount != null && (
            <span className="text-[11px] text-slate-400">{product.reviewCount} reviews</span>
          )}
        </div>
        <h2 className="text-sm font-semibold text-slate-950 line-clamp-2 leading-snug">
          {product.name}
        </h2>
        <div className="mt-auto flex items-center justify-between gap-3">
          <p className="text-base font-extrabold text-slate-950">
            KSh {Number(product.price).toLocaleString()}
          </p>
          <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${product.stockQuantity > 0 ? 'bg-[#e8f5ee] text-[#0f4c35]' : 'bg-slate-100 text-slate-500'}`}>
            {product.stockQuantity > 0 ? 'In stock' : 'Sold out'}
          </span>
        </div>
      </div>
    </Link>
  )
}