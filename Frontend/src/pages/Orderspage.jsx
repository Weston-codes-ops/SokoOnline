import { useState, useEffect } from 'react'
import { Package, ShoppingBag, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const STATUS_STYLES = {
  PENDING:    'bg-yellow-50 text-yellow-700',
  CONFIRMED:  'bg-blue-50 text-blue-700',
  PROCESSING: 'bg-purple-50 text-purple-700',
  SHIPPED:    'bg-indigo-50 text-indigo-700',
  DELIVERED:  'bg-green-50 text-green-700',
  CANCELLED:  'bg-red-50 text-red-500',
}

export default function OrdersPage() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get('/orders')
      .then(res => {
        // Handle both array and paginated response
        const data = res.data.content ?? res.data
        setOrders(Array.isArray(data) ? data : [])
      })
      .catch(err => {
        console.error('Orders fetch error:', err)
        setError('Could not load orders.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Page header */}
      <div className="bg-[#0f4c35]">
        <div className="max-w-4xl mx-auto px-6 py-10">
          <h1 className="text-2xl font-extrabold text-white">My Orders</h1>
          <p className="text-white/60 text-sm mt-1">Track and manage your purchases</p>
        </div>
      </div>

      <main className="flex-1 bg-[#f9fafb]">
        <div className="max-w-4xl mx-auto px-6 py-8">

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-7 h-7 border-2 border-[#0f4c35] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <div className="w-14 h-14 bg-[#e8f5ee] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package size={24} className="text-[#0f4c35]" />
              </div>
              <h3 className="text-sm font-bold text-gray-900 mb-1">No orders yet</h3>
              <p className="text-xs text-gray-400 mb-5">Your order history will appear here</p>
              <Link to="/store"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f4c35] text-white text-sm font-semibold rounded-lg hover:bg-[#1a6b4a] transition-colors">
                Start shopping <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false)
  const status = STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      {/* Order header — always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left">

        <div className="w-10 h-10 bg-[#e8f5ee] rounded-xl flex items-center justify-center shrink-0">
          <Package size={16} className="text-[#0f4c35]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-gray-900">Order #{order.id}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${status}`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString('en-KE', {
              day: 'numeric', month: 'long', year: 'numeric'
            })}
            {' · '}
            {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-sm font-extrabold text-gray-900">
            KSh {Number(order.totalAmount).toLocaleString()}
          </p>
          <p className="text-xs text-[#0f4c35] mt-0.5">
            {expanded ? 'Hide details ↑' : 'View details ↓'}
          </p>
        </div>
      </button>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50">
          <div className="space-y-3">
            {order.items?.map(item => (
              <div key={item.id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 overflow-hidden shrink-0">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag size={13} className="text-gray-200" />
                      </div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="text-xs font-bold text-gray-900 shrink-0">
                  KSh {Number(item.subtotal).toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Shipping address if available */}
          {order.shippingAddress && (
            <p className="text-xs text-gray-400 mt-3 pt-3 border-t border-gray-200 flex items-start gap-1.5">
              <span>📍</span> {order.shippingAddress}
            </p>
          )}
        </div>
      )}
    </div>
  )
}