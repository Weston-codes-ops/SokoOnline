import { useState, useEffect } from 'react'
import { ShoppingBag, Package, UserRound, DollarSign, Loader2 } from 'lucide-react'
import api from '../../api/axios'

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [prodRes, ordersRes, catRes] = await Promise.all([
        api.get('/products?size=500'),
        api.get('/orders/all'),
        api.get('/categories'),
      ])
      setProducts(prodRes.data.content || prodRes.data)
      setOrders(ordersRes.data)
      setCategories(catRes.data)
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const totalProducts = products.length
  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, order) => sum + (Number(order.totalAmount) || 0), 0)
  const recentOrders = orders.slice(0, 4)

  const stats = [
    { label: 'Total Products', value: totalProducts.toLocaleString(), icon: ShoppingBag, color: 'bg-blue-500' },
    { label: 'Total Orders', value: totalOrders.toLocaleString(), icon: Package, color: 'bg-green-500' },
    { label: 'Total Users', value: 'N/A', icon: UserRound, color: 'bg-purple-500' },
    { label: 'Total Revenue', value: `KSh ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'bg-orange-500' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="text-[#0f4c35] animate-spin" />
          <p className="text-sm text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`${stat.color} w-12 h-12 rounded-full flex items-center justify-center text-white`}>
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-600">{order.userName || 'Unknown Customer'}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                    order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Categories</h2>
          {categories.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No categories yet</p>
          ) : (
            <div className="space-y-4">
              {categories.map((cat, i) => (
                <div key={cat.id} className="flex items-center justify-between">
                  <p className="text-gray-700">{cat.name}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-[#0f4c35] h-2 rounded-full"
                        style={{ width: `${100 - i * Math.min(20, 100 / categories.length)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}