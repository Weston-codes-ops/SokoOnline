/*
 * AdminProductsPage.jsx — Manage Products
 *
 * Admin-only page for creating, editing and deleting products.
 *
 * Features:
 * - Tabs: one per category + "All" tab
 * - 10 products per page within each tab
 * - Search bar filters within active tab
 * - Add / Edit modal with Cloudinary image upload
 * - Delete with confirmation
 *
 * Data flow:
 * - On mount: fetch all products, categories, subcategories
 * - Tab click: filter products client-side by categoryName
 * - Add/Edit: POST or PUT to /products
 * - Delete: DELETE /products/:id
 *
 * The modal is shared for both Add and Edit.
 * When editing, we pre-fill the form with the product's data.
 * When adding, the form starts empty.
 */

import { useState, useEffect, useMemo } from 'react'
import { Plus, Pencil, Trash2, X, Package, Search } from 'lucide-react'
import api from '../../api/axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const EMPTY_FORM = {
  name: '', description: '', price: '',
  stockQuantity: '', imageUrl: '', categoryId: '', subcategoryId: ''
}
const PAGE_SIZE = 10

export default function AdminProductsPage() {
  const [products, setProducts]           = useState([])
  const [categories, setCategories]       = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading]             = useState(true)
  const [activeTab, setActiveTab]         = useState('all')
  const [search, setSearch]               = useState('')
  const [tabPages, setTabPages]           = useState({})
  const [modal, setModal]                 = useState(false)
  const [editing, setEditing]             = useState(null)
  const [form, setForm]                   = useState(EMPTY_FORM)
  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState('')

  // Fetch everything on mount
  const fetchAll = async () => {
    try {
      const [prodRes, catRes, subRes] = await Promise.all([
        api.get('/products?size=500'),
        api.get('/categories'),
        api.get('/subcategories'),
      ])
      setProducts(prodRes.data.content ?? prodRes.data)
      setCategories(catRes.data)
      setSubcategories(subRes.data)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // Filter products by search query
  const searched = useMemo(() => {
    if (!search.trim()) return products
    const q = search.toLowerCase()
    return products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q) ||
      p.subcategoryName?.toLowerCase().includes(q)
    )
  }, [products, search])

  // Filter by active tab
  const tabProducts = useMemo(() => {
    if (activeTab === 'all') return searched
    return searched.filter(p => p.categoryName === activeTab)
  }, [searched, activeTab])

  // Pagination for current tab
  const currentPage  = tabPages[activeTab] || 0
  const totalPages   = Math.ceil(tabProducts.length / PAGE_SIZE)
  const paginated    = tabProducts.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)
  const setPage      = (p) => setTabPages(prev => ({ ...prev, [activeTab]: p }))

  // Subcategories for the selected category in the modal
  const modalSubs = useMemo(() =>
    subcategories.filter(s => s.categoryId === Number(form.categoryId)),
    [subcategories, form.categoryId]
  )

  // Tab definitions
  const tabs = [
    { key: 'all', label: 'All', count: products.length },
    ...categories.map(c => ({
      key: c.name,
      label: c.name,
      count: products.filter(p => p.categoryName === c.name).length
    }))
  ]

  // Open modal for creating a new product
  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setModal(true)
  }

  // Open modal pre-filled for editing
  const openEdit = (p) => {
    setEditing(p)
    // Resolve IDs from names since the API returns names not IDs
    const cat = categories.find(c => c.name === p.categoryName)
    const sub = subcategories.find(s => s.name === p.subcategoryName)
    setForm({
      name:          p.name,
      description:   p.description || '',
      price:         p.price,
      stockQuantity: p.stockQuantity,
      imageUrl:      p.imageUrl || '',
      categoryId:    cat?.id || '',
      subcategoryId: sub?.id || '',
    })
    setError('')
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, subcategoryId: form.subcategoryId || null }
      if (editing) {
        await api.put(`/products/${editing.id}`, payload)
      } else {
        await api.post('/products', payload)
      }
      setModal(false)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    await api.delete(`/products/${id}`)
    fetchAll()
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Navbar />

      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Products</h1>
            <p className="text-xs text-gray-400 mt-0.5">{products.length} total products</p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0f4c35] hover:bg-[#1a6b4a] text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus size={15} /> Add Product
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 w-full flex-1">

        {/* ── TABS ─────────────────────────────────────────────── */}
        <div className="flex items-center gap-1 border-b border-gray-200 mb-5 overflow-x-auto pb-px">
          {tabs.map(tab => (
            <button key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSearch('') }}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.key
                  ? 'border-[#0f4c35] text-[#0f4c35]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}>
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                activeTab === tab.key ? 'bg-[#e8f5ee] text-[#0f4c35]' : 'bg-gray-100 text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* ── SEARCH ───────────────────────────────────────────── */}
        <div className="relative max-w-xs mb-5">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search products..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(0) }}
            className="w-full pl-8 pr-8 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#0f4c35]" />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
              <X size={11} />
            </button>
          )}
        </div>

        {/* ── TABLE ────────────────────────────────────────────── */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 border-2 border-[#0f4c35] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : tabProducts.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-xl">
            <Package size={24} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">
              {search ? `No results for "${search}"` : 'No products in this category'}
            </p>
            {!search && (
              <button onClick={openCreate}
                className="mt-4 px-4 py-2 bg-[#0f4c35] text-white text-xs font-semibold rounded-lg hover:bg-[#1a6b4a] transition-colors">
                Add first product
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Subcategory</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Stock</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginated.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gray-100 overflow-hidden shrink-0">
                            {p.imageUrl
                              ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center">
                                  <Package size={12} className="text-gray-300" />
                                </div>
                            }
                          </div>
                          <span className="text-xs font-semibold text-gray-900 line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">{p.categoryName}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        {p.subcategoryName
                          ? <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{p.subcategoryName}</span>
                          : <span className="text-gray-300 text-xs">—</span>
                        }
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-gray-900">
                        KSh {Number(p.price).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          p.stockQuantity > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-500'
                        }`}>
                          {p.stockQuantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(p)}
                            className="p-1.5 text-gray-400 hover:text-[#0f4c35] hover:bg-[#e8f5ee] rounded-lg transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(p.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-gray-400">
                  Showing {currentPage * PAGE_SIZE + 1}–{Math.min((currentPage + 1) * PAGE_SIZE, tabProducts.length)} of {tabProducts.length}
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage(currentPage - 1)} disabled={currentPage === 0}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setPage(i)}
                      className={`w-7 h-7 text-xs rounded-lg transition-colors ${
                        i === currentPage
                          ? 'bg-[#0f4c35] text-white font-semibold'
                          : 'border border-gray-200 text-gray-500 hover:bg-gray-50'
                      }`}>
                      {i + 1}
                    </button>
                  ))}
                  <button onClick={() => setPage(currentPage + 1)} disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── ADD / EDIT MODAL ─────────────────────────────────────── */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-extrabold text-gray-900">
                {editing ? 'Edit Product' : 'New Product'}
              </h2>
              <button onClick={() => setModal(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">{error}</div>
              )}

              {/* Product name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Product Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Fresh Tomatoes" required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent" />
              </div>

              {/* Image URL + Cloudinary upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Product Image</label>
                <div className="flex gap-2">
                  <input value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="Paste image URL or click Upload"
                    className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent" />
                  {/*
                   * Cloudinary Upload Widget
                   * Replace YOUR_CLOUD_NAME and YOUR_UPLOAD_PRESET
                   * with your actual Cloudinary credentials.
                   * The widget opens a popup for selecting/uploading images.
                   * On success, it sets the imageUrl in the form.
                   */}
                  <button type="button"
                    onClick={() => window.cloudinary?.openUploadWidget(
                      {
                        cloudName: 'dgtbvqtti',
                        uploadPreset: 'Nonononono',
                        sources: ['local', 'url', 'camera'],
                        multiple: false,
                      },
                      (err, result) => {
                        if (!err && result.event === 'success') {
                          setForm(f => ({ ...f, imageUrl: result.info.secure_url }))
                        }
                      }
                    )}
                    className="px-4 py-2.5 bg-[#0f4c35] text-white rounded-lg text-xs font-semibold hover:bg-[#1a6b4a] whitespace-nowrap">
                    Upload
                  </button>
                </div>
                {/* Image preview */}
                {form.imageUrl && (
                  <div className="mt-2 relative inline-block">
                    <img src={form.imageUrl} alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    <button type="button" onClick={() => setForm(f => ({ ...f, imageUrl: '' }))}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600">
                      ×
                    </button>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Description</label>
                <textarea value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={2} placeholder="Brief product description..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent resize-none" />
              </div>

              {/* Price + Stock in a row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Price (KSh)</label>
                  <input type="number" min="0.01" step="0.01" value={form.price}
                    onChange={e => setForm({ ...form, price: e.target.value })} required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Stock Quantity</label>
                  <input type="number" min="0" value={form.stockQuantity}
                    onChange={e => setForm({ ...form, stockQuantity: e.target.value })} required
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent" />
                </div>
              </div>

              {/* Category dropdown */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                <select value={form.categoryId}
                  onChange={e => setForm({ ...form, categoryId: e.target.value, subcategoryId: '' })}
                  required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35]">
                  <option value="">Select a category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              {/*
               * Subcategory dropdown — only shows if a category is selected
               * AND that category has subcategories
               */}
              {form.categoryId && modalSubs.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Subcategory <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <select value={form.subcategoryId}
                    onChange={e => setForm({ ...form, subcategoryId: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35]">
                    <option value="">No subcategory</option>
                    {modalSubs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              {/* Form actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-[#0f4c35] text-white rounded-lg text-sm font-semibold hover:bg-[#1a6b4a] disabled:opacity-50 transition-colors">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}