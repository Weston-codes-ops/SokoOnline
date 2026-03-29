/*
 * AdminPromotionsPage.jsx — Manage Promotions
 *
 * Admin page for creating and managing time-limited deals.
 *
 * Each promotion links to a product and has:
 * - Badge label (e.g. "50% OFF", "HOT DEAL")
 * - Discount % (informational)
 * - Start and end date/time
 * - Active toggle
 *
 * Status is automatically calculated:
 * - ACTIVE   : active=true AND within date window
 * - SCHEDULED: active=true AND startDate is in the future
 * - EXPIRED  : endDate has passed
 * - DISABLED : active=false
 */

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Zap } from 'lucide-react'
import api from '../../api/axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const EMPTY_FORM = {
  productId: '', badge: '', discountPercent: '',
  startDate: '', endDate: '', active: true
}

const BADGE_SUGGESTIONS = ['HOT DEAL', 'NEW', '20% OFF', '50% OFF', 'LIMITED', 'FRESH', 'POPULAR']

// Compute display status from promotion data
function getStatus(promo) {
  const now = new Date()
  const start = new Date(promo.startDate)
  const end = new Date(promo.endDate)
  if (!promo.active) return { label: 'Disabled', style: 'bg-gray-100 text-gray-500' }
  if (now < start)   return { label: 'Scheduled', style: 'bg-blue-50 text-blue-600' }
  if (now > end)     return { label: 'Expired',   style: 'bg-red-50 text-red-500' }
  return               { label: 'Active',    style: 'bg-green-50 text-green-700' }
}

export default function AdminPromotionsPage() {
  const [promos, setPromos]       = useState([])
  const [products, setProducts]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [modal, setModal]         = useState(false)
  const [editing, setEditing]     = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const fetchAll = async () => {
    try {
      const [promoRes, prodRes] = await Promise.all([
        api.get('/promotions'),
        api.get('/products?size=500'),
      ])
      setPromos(promoRes.data)
      setProducts(prodRes.data.content ?? prodRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const openCreate = () => {
    setEditing(null)
    setForm(EMPTY_FORM)
    setError('')
    setModal(true)
  }

  const openEdit = (promo) => {
    setEditing(promo)
    setForm({
      productId:       promo.productId,
      badge:           promo.badge,
      discountPercent: promo.discountPercent || '',
      // Format datetime for input[type=datetime-local]
      startDate:       promo.startDate?.slice(0, 16) || '',
      endDate:         promo.endDate?.slice(0, 16) || '',
      active:          promo.active ?? true,
    })
    setError('')
    setModal(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        ...form,
        productId:       Number(form.productId),
        discountPercent: form.discountPercent ? Number(form.discountPercent) : null,
      }
      if (editing) {
        await api.put(`/promotions/${editing.id}`, payload)
      } else {
        await api.post('/promotions', payload)
      }
      setModal(false)
      fetchAll()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save promotion.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promotion?')) return
    await api.delete(`/promotions/${id}`)
    fetchAll()
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-gray-900">Promotions</h1>
            <p className="text-xs text-gray-400 mt-0.5">
              {promos.filter(p => getStatus(p).label === 'Active').length} active promotions
            </p>
          </div>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0f4c35] hover:bg-[#1a6b4a] text-white text-sm font-semibold rounded-lg transition-colors">
            <Plus size={15} /> Add Promotion
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 w-full flex-1">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 border-2 border-[#0f4c35] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : promos.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-xl">
            <Zap size={24} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400 mb-4">No promotions yet</p>
            <button onClick={openCreate}
              className="px-4 py-2 bg-[#0f4c35] text-white text-xs font-semibold rounded-lg hover:bg-[#1a6b4a]">
              Create first promotion
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Badge</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Discount</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Start</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Expires</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {promos.map(promo => {
                  const status = getStatus(promo)
                  return (
                    <tr key={promo.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="text-xs font-semibold text-gray-900 line-clamp-1">{promo.name}</p>
                        <p className="text-xs text-gray-400">{promo.categoryName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold bg-[#f59e0b] text-white px-2 py-0.5 rounded-full">
                          {promo.badge}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden md:table-cell">
                        {promo.discountPercent ? `${promo.discountPercent}%` : '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                        {new Date(promo.startDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {new Date(promo.endDate).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status.style}`}>
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(promo)}
                            className="p-1.5 text-gray-400 hover:text-[#0f4c35] hover:bg-[#e8f5ee] rounded-lg transition-colors">
                            <Pencil size={13} />
                          </button>
                          <button onClick={() => handleDelete(promo.id)}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-sm font-extrabold text-gray-900">
                {editing ? 'Edit Promotion' : 'New Promotion'}
              </h2>
              <button onClick={() => setModal(false)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSave} className="px-6 py-5 space-y-4">
              {error && <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">{error}</div>}

              {/* Product selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Product</label>
                <select value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value })}
                  required className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35]">
                  <option value="">Select a product</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* Badge */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Badge Label</label>
                <input value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })}
                  placeholder="e.g. 50% OFF" required
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35]" />
                {/* Quick badge suggestions */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {BADGE_SUGGESTIONS.map(b => (
                    <button key={b} type="button"
                      onClick={() => setForm({ ...form, badge: b })}
                      className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                        form.badge === b
                          ? 'bg-[#f59e0b] text-white border-[#f59e0b]'
                          : 'border-gray-200 text-gray-500 hover:border-[#f59e0b] hover:text-[#f59e0b]'
                      }`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Discount % */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Discount % <span className="text-gray-400 font-normal">(optional, informational only)</span>
                </label>
                <input type="number" min="0" max="100" value={form.discountPercent}
                  onChange={e => setForm({ ...form, discountPercent: e.target.value })}
                  placeholder="e.g. 20"
                  className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35]" />
              </div>

              {/* Date range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Start Date</label>
                  <input type="datetime-local" value={form.startDate}
                    onChange={e => setForm({ ...form, startDate: e.target.value })} required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0f4c35]" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">End Date</label>
                  <input type="datetime-local" value={form.endDate}
                    onChange={e => setForm({ ...form, endDate: e.target.value })} required
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#0f4c35]" />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center gap-3">
                <button type="button"
                  onClick={() => setForm({ ...form, active: !form.active })}
                  className={`relative w-10 h-5 rounded-full transition-colors ${form.active ? 'bg-[#0f4c35]' : 'bg-gray-200'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
                <span className="text-xs font-medium text-gray-700">
                  {form.active ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-[#0f4c35] text-white rounded-lg text-sm font-semibold hover:bg-[#1a6b4a] disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Save Changes' : 'Create Promotion'}
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