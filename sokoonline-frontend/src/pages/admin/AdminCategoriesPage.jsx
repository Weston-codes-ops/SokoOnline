/*
 * AdminCategoriesPage.jsx — Manage Categories & Subcategories
 *
 * Admin page for managing the category hierarchy.
 *
 * Features:
 * - List of categories with expandable subcategory rows
 * - Add / edit / delete categories
 * - Add / edit / delete subcategories per category
 * - Separate modals for category and subcategory forms
 */

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, ChevronDown, ChevronRight, Tag } from 'lucide-react'
import api from '../../api/axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

export default function AdminCategoriesPage() {
  const [categories, setCategories]       = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading]             = useState(true)
  const [expanded, setExpanded]           = useState({})

  // Category modal state
  const [catModal, setCatModal]   = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [catForm, setCatForm]     = useState({ name: '', description: '' })

  // Subcategory modal state
  const [subModal, setSubModal]     = useState(false)
  const [editingSub, setEditingSub] = useState(null)
  const [subForm, setSubForm]       = useState({ name: '', categoryId: '' })

  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const fetchAll = async () => {
    try {
      const [catRes, subRes] = await Promise.all([
        api.get('/categories'),
        api.get('/subcategories'),
      ])
      setCategories(catRes.data)
      setSubcategories(subRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const subsForCat = (catId) => subcategories.filter(s => s.categoryId === catId)

  // ── Category actions ──────────────────────────────────────────
  const openCreateCat = () => {
    setEditingCat(null)
    setCatForm({ name: '', description: '' })
    setError('')
    setCatModal(true)
  }

  const openEditCat = (cat) => {
    setEditingCat(cat)
    setCatForm({ name: cat.name, description: cat.description || '' })
    setError('')
    setCatModal(true)
  }

  const saveCat = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingCat) {
        await api.put(`/categories/${editingCat.id}`, catForm)
      } else {
        await api.post('/categories', catForm)
      }
      setCatModal(false)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category.')
    } finally {
      setSaving(false)
    }
  }

  const deleteCat = async (id) => {
    if (!window.confirm('Delete this category? All subcategories will also be deleted.')) return
    await api.delete(`/categories/${id}`)
    fetchAll()
  }

  // ── Subcategory actions ───────────────────────────────────────
  const openCreateSub = (catId) => {
    setEditingSub(null)
    setSubForm({ name: '', categoryId: catId })
    setError('')
    setSubModal(true)
  }

  const openEditSub = (sub) => {
    setEditingSub(sub)
    setSubForm({ name: sub.name, categoryId: sub.categoryId })
    setError('')
    setSubModal(true)
  }

  const saveSub = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editingSub) {
        await api.put(`/subcategories/${editingSub.id}`, subForm)
      } else {
        await api.post('/subcategories', subForm)
      }
      setSubModal(false)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save subcategory.')
    } finally {
      setSaving(false)
    }
  }

  const deleteSub = async (id) => {
    if (!window.confirm('Delete this subcategory?')) return
    await api.delete(`/subcategories/${id}`)
    fetchAll()
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Categories</h1>
            <p className="text-xs text-gray-400 mt-0.5">{categories.length} categories</p>
          </div>
          <button onClick={openCreateCat}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0f4c35] hover:bg-[#1a6b4a] text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus size={15} /> Add Category
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-6 w-full flex-1">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 border-2 border-[#0f4c35] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-xl">
            <Tag size={24} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-4">No categories yet</p>
            <button onClick={openCreateCat}
              className="px-4 py-2 bg-[#0f4c35] text-white text-xs font-semibold rounded-lg hover:bg-[#1a6b4a]">
              Add first category
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {categories.map(cat => {
              const subs = subsForCat(cat.id)
              const isExpanded = expanded[cat.id]

              return (
                <div key={cat.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">

                  {/* Category row */}
                  <div className="flex items-center gap-3 px-5 py-4">
                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpanded(p => ({ ...p, [cat.id]: !p[cat.id] }))}
                      className="text-gray-400 hover:text-gray-600 transition-colors">
                      {isExpanded
                        ? <ChevronDown size={15} />
                        : <ChevronRight size={15} />}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{cat.description}</p>
                      )}
                    </div>

                    {/* Subcategory count badge */}
                    <span className="text-xs bg-[#e8f5ee] text-[#0f4c35] px-2 py-0.5 rounded-full font-semibold shrink-0">
                      {subs.length} sub{subs.length !== 1 ? 's' : ''}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => openCreateSub(cat.id)}
                        className="p-1.5 text-gray-400 hover:text-[#0f4c35] hover:bg-[#e8f5ee] rounded-lg transition-colors"
                        title="Add subcategory">
                        <Plus size={13} />
                      </button>
                      <button onClick={() => openEditCat(cat)}
                        className="p-1.5 text-gray-400 hover:text-[#0f4c35] hover:bg-[#e8f5ee] rounded-lg transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => deleteCat(cat.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Subcategory rows — shown when expanded */}
                  {isExpanded && (
                    <div className="border-t border-gray-50">
                      {subs.length === 0 ? (
                        <p className="px-12 py-3 text-xs text-gray-400 italic">
                          No subcategories yet —{' '}
                          <button onClick={() => openCreateSub(cat.id)}
                            className="text-[#0f4c35] font-semibold hover:underline">
                            add one
                          </button>
                        </p>
                      ) : (
                        subs.map(sub => (
                          <div key={sub.id}
                            className="flex items-center gap-3 px-5 py-3 pl-12 border-t border-gray-50 hover:bg-gray-50 transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                            <p className="text-xs font-medium text-gray-700 flex-1">{sub.name}</p>
                            <div className="flex items-center gap-1">
                              <button onClick={() => openEditSub(sub)}
                                className="p-1.5 text-gray-400 hover:text-[#0f4c35] hover:bg-[#e8f5ee] rounded-lg transition-colors">
                                <Pencil size={12} />
                              </button>
                              <button onClick={() => deleteSub(sub.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── CATEGORY MODAL ─────────────────────────────────────── */}
      {catModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-extrabold text-gray-900">
                {editingCat ? 'Edit Category' : 'New Category'}
              </h2>
              <button onClick={() => setCatModal(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={saveCat} className="px-6 py-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">{error}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Name</label>
                <input value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })}
                  placeholder="e.g. Fresh Produce" required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Description <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                  placeholder="Brief description..."
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35]" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setCatModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-[#0f4c35] text-white rounded-lg text-sm font-semibold hover:bg-[#1a6b4a] disabled:opacity-50">
                  {saving ? 'Saving...' : editingCat ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SUBCATEGORY MODAL ──────────────────────────────────── */}
      {subModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-extrabold text-gray-900">
                {editingSub ? 'Edit Subcategory' : 'New Subcategory'}
              </h2>
              <button onClick={() => setSubModal(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={saveSub} className="px-6 py-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">{error}</div>}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Name</label>
                <input value={subForm.name} onChange={e => setSubForm({ ...subForm, name: e.target.value })}
                  placeholder="e.g. Vegetables" required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35]" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category</label>
                <select value={subForm.categoryId} onChange={e => setSubForm({ ...subForm, categoryId: e.target.value })}
                  required className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35]">
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setSubModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-[#0f4c35] text-white rounded-lg text-sm font-semibold hover:bg-[#1a6b4a] disabled:opacity-50">
                  {saving ? 'Saving...' : editingSub ? 'Save' : 'Create'}
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