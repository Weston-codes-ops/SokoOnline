import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ShoppingCart, Package, ArrowLeft, Plus, Minus, Check } from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function ProductDetailPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [product, setProduct]       = useState(null)
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading]       = useState(true)
  const [quantity, setQuantity]     = useState(1)
  const [adding, setAdding]         = useState(false)
  const [added, setAdded]           = useState(false)
  const [error, setError]           = useState('')

  useEffect(() => {
    setLoading(true)
    setAdded(false)
    setQuantity(1)
    api.get(`/products/${slug}`)
      .then(res => {
        setProduct(res.data)
        // Fetch suggestions from same category
        return api.get(`/products?categoryId=${res.data.categoryId}&size=8`)
      })
      .then(res => {
        const all = res.data.content ?? res.data
        // Exclude the current product
        setSuggestions(all.filter(p => p.slug !== slug).slice(0, 6))
      })
      .catch(() => setError('Product not found.'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleAddToCart = async () => {
    setAdding(true)
    setError('')
    try {
      await api.post('/cart/items', null, { params: { productId: product.id, quantity } })
      setAdded(true)
      setTimeout(() => setAdded(false), 2500)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add to cart.')
    } finally {
      setAdding(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#0f4c35] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (error || !product) return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <Package size={32} className="text-gray-200" />
        <p className="text-sm text-gray-400">{error || 'Product not found.'}</p>
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#0f4c35] font-semibold hover:underline">
          <ArrowLeft size={14} /> Go back
        </button>
      </div>
    </div>
  )

  const inStock = product.stockQuantity > 0

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">

        {/* ── GO BACK ─────────────────────────────────────────────── */}
        <button onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#0f4c35] font-medium mb-6 transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        {/* ── PRODUCT SECTION ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">

            {/* Image */}
            <div className="aspect-square bg-gray-50 overflow-hidden">
              {product.imageUrl
                ? <img src={product.imageUrl} alt={product.name}
                    className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center">
                    <Package size={48} className="text-gray-200" />
                  </div>
              }
            </div>

            {/* Details */}
            <div className="p-8 flex flex-col">
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                <Link to="/store" className="hover:text-[#0f4c35]">Store</Link>
                <span>/</span>
                <span>{product.categoryName}</span>
                {product.subcategoryName && (
                  <><span>/</span><span>{product.subcategoryName}</span></>
                )}
              </div>

              <h1 className="text-xl font-extrabold text-gray-900 mb-2 leading-snug">
                {product.name}
              </h1>

              {product.description && (
                <p className="text-sm text-gray-500 leading-relaxed mb-5">
                  {product.description}
                </p>
              )}

              {/* Price */}
              <div className="mb-5">
                <span className="text-3xl font-extrabold text-gray-900">
                  KSh {Number(product.price).toLocaleString()}
                </span>
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className={`text-xs font-semibold ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                  {inStock ? `In stock (${product.stockQuantity} available)` : 'Out of stock'}
                </span>
              </div>

              {/* Quantity selector */}
              {inStock && (
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-xs font-semibold text-gray-600">Quantity</span>
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors">
                      <Minus size={13} />
                    </button>
                    <span className="px-4 py-2 text-sm font-bold text-gray-900 border-x border-gray-200 min-w-[40px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(q => Math.min(product.stockQuantity, q + 1))}
                      className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors">
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-xs text-red-500 mb-3">{error}</p>
              )}

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                disabled={!inStock || adding}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                  added
                    ? 'bg-green-500 text-white'
                    : inStock
                    ? 'bg-[#0f4c35] hover:bg-[#1a6b4a] text-white'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}>
                {added ? (
                  <><Check size={16} /> Added to cart!</>
                ) : adding ? (
                  'Adding...'
                ) : (
                  <><ShoppingCart size={16} /> Add to cart</>
                )}
              </button>

              {added && (
                <Link to="/cart"
                  className="mt-3 text-center text-xs text-[#0f4c35] font-semibold hover:underline">
                  View cart →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── SUGGESTIONS ─────────────────────────────────────────── */}
        {suggestions.length > 0 && (
          <div className="mt-10">
            <h2 className="text-base font-extrabold text-gray-900 mb-4">
              More from <span className="text-[#0f4c35]">{product.categoryName}</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {suggestions.map(p => (
                <Link key={p.id} to={`/products/${p.slug}`}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-[#0f4c35]/30 hover:shadow-sm transition-all group flex flex-col">
                  <div className="aspect-square bg-gray-50 overflow-hidden">
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <Package size={18} className="text-gray-200" />
                        </div>
                    }
                  </div>
                  <div className="p-2.5 flex flex-col flex-1">
                    <p className="text-xs font-semibold text-gray-900 line-clamp-2 flex-1 leading-snug">
                      {p.name}
                    </p>
                    <p className="text-xs font-extrabold text-gray-900 mt-1.5">
                      KSh {Number(p.price).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

    </div>
  )
}