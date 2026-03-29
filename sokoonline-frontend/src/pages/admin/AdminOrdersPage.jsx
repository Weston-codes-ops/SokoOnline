/*
 * AdminOrdersPage.jsx — Manage Orders
 *
 * Admin page for viewing and updating all orders.
 *
 * Features:
 * - Table of all orders with customer, date, total, status
 * - Filter by status (All, Pending, Confirmed etc.)
 * - Click order to expand and see items
 * - Update order status via dropdown
 */

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Package } from 'lucide-react'
import api from '../../api/axios'
import Navbar from '../../components/Navbar'
import Footer from '../../components/Footer'

const STATUSES = ['ALL', 'PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']

const STATUS_STYLES = {
  PENDING:    'bg-yellow-50 text-yellow-700',
  CONFIRMED:  'bg-blue-50 text-blue-700',
  PROCESSING: 'bg-purple-50 text-purple-700',
  SHIPPED:    'bg-indigo-50 text-indigo-700',
  DELIVERED:  'bg-green-50 text-green-700',
  CANCELLED:  'bg-red-50 text-red-500',
}

export default function AdminOrdersPage() {
  const [orders, setOrders]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('ALL')
  const [expanded, setExpanded] = useState({})
  const [updating, setUpdating] = useState(null)

  const fetchOrders = () => {
    api.get('/orders/all')
      .then(res => setOrders(res.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId)
    try {
      await api.patch(`/orders/${orderId}/status`, { status })
      fetchOrders()
    } finally {
      setUpdating(null)
    }
  }

  const filteredOrders = filter === 'ALL'
    ? orders
    : orders.filter(o => o.status === filter)

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Navbar />

      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <h1 className="text-xl font-extrabold text-gray-900">Orders</h1>
          <p className="text-xs text-gray-400 mt-0.5">{orders.length} total orders</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 w-full flex-1">

        {/* Status filter tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200 mb-5 overflow-x-auto pb-px">
          {STATUSES.map(s => (
            <button key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors ${
                filter === s
                  ? 'border-[#0f4c35] text-[#0f4c35]'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}>
              {s === 'ALL' ? 'All Orders' : s.charAt(0) + s.slice(1).toLowerCase()}
              {s !== 'ALL' && (
                <span className="ml-1.5 text-xs text-gray-400">
                  ({orders.filter(o => o.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-7 h-7 border-2 border-[#0f4c35] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-dashed border-gray-200 rounded-xl">
            <Package size={24} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No orders found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider w-8"></th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Order</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredOrders.map(order => (
                  <>
                    <tr key={order.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setExpanded(p => ({ ...p, [order.id]: !p[order.id] }))}>

                      {/* Expand toggle */}
                      <td className="px-4 py-3 text-gray-400">
                        {expanded[order.id]
                          ? <ChevronDown size={13} />
                          : <ChevronRight size={13} />}
                      </td>

                      <td className="px-4 py-3">
                        <p className="text-xs font-bold text-gray-900">#{order.id}</p>
                        <p className="text-xs text-gray-400">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                      </td>

                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-xs font-medium text-gray-900">{order.userName || '—'}</p>
                        <p className="text-xs text-gray-400">{order.userEmail || ''}</p>
                      </td>

                      <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell">
                        {new Date(order.createdAt).toLocaleDateString('en-KE', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </td>

                      <td className="px-4 py-3 text-xs font-bold text-gray-900">
                        KSh {Number(order.totalAmount).toLocaleString()}
                      </td>

                      {/* Status dropdown — stops click propagation so it doesn't toggle expand */}
                      <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={e => updateStatus(order.id, e.target.value)}
                          disabled={updating === order.id}
                          className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#0f4c35] disabled:opacity-60 ${
                            STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'
                          }`}>
                          {STATUSES.filter(s => s !== 'ALL').map(s => (
                            <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                          ))}
                        </select>
                      </td>
                    </tr>

                    {/* Expanded order items */}
                    {expanded[order.id] && (
                      <tr key={`${order.id}-items`}>
                        <td colSpan={6} className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                          <div className="pl-4 space-y-2">
                            {order.items?.map(item => (
                              <div key={item.id} className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 overflow-hidden shrink-0">
                                  {item.imageUrl
                                    ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center">
                                        <Package size={11} className="text-gray-300" />
                                      </div>
                                  }
                                </div>
                                <p className="text-xs text-gray-700 flex-1">{item.productName}</p>
                                <p className="text-xs text-gray-400">×{item.quantity}</p>
                                <p className="text-xs font-semibold text-gray-900">
                                  KSh {Number(item.subtotal).toLocaleString()}
                                </p>
                              </div>
                            ))}
                            {/* Shipping address */}
                            {order.shippingAddress && (
                              <p className="text-xs text-gray-400 pt-2 border-t border-gray-200 mt-2">
                                📍 {order.shippingAddress}
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}