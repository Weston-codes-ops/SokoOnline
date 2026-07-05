import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Phone, MapPin, CheckCircle, Loader } from 'lucide-react'
import api from '../api/axios'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/*
 * CheckoutPage — Two steps:
 * Step 1: Shipping details
 * Step 2: M-Pesa payment
 *
 * Flow:
 * 1. User fills in shipping details → clicks Continue
 * 2. Order is created on backend (status: PENDING)
 * 3. User enters phone → clicks Pay with M-Pesa
 * 4. STK push sent to phone
 * 5. User enters PIN on phone
 * 6. Safaricom calls our callback → order marked CONFIRMED
 * 7. Frontend polls for order status → shows success
 */

const STEPS = ['Shipping', 'Payment', 'Confirmation']

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [step, setStep]         = useState(0) // 0=shipping, 1=payment, 2=confirmed
  const [cart, setCart]         = useState(null)
  const [order, setOrder]       = useState(null)
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [polling, setPolling]   = useState(false)
  const [error, setError]       = useState('')

  const [shipping, setShipping] = useState({
    fullName: '', phone: '', address: '', city: 'Nairobi', country: 'Kenya', postalCode: ''
  })
  const [mpesaPhone, setMpesaPhone] = useState('')

  // Fetch cart on mount
  useEffect(() => {
    api.get('/cart')
      .then(res => setCart(res.data))
      .catch(() => navigate('/cart'))
      .finally(() => setLoading(false))
  }, [])

  // Pre-fill phone from shipping if available
  useEffect(() => {
    if (shipping.phone) setMpesaPhone(shipping.phone)
  }, [shipping.phone])

  const total     = cart?.items?.reduce((s, i) => s + i.subtotal, 0) || 0
  const delivery  = total >= 2000 ? 0 : 200
  const grandTotal = total + delivery

  // Step 1 — Create order with shipping details
  const handleShippingSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/orders/checkout', {
        shippingAddress: `${shipping.fullName}, ${shipping.address}, ${shipping.city}, ${shipping.country}`,
        phone: shipping.phone,
      })
      setOrder(res.data)
      setStep(1)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create order. Try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Step 2 — Initiate M-Pesa STK Push
  const handleMpesaPay = async () => {
  if (!mpesaPhone.trim()) return setError('Enter your M-Pesa phone number.')
  setSubmitting(true)
  setError('')
  try {
    setPolling(true)
    // Simulate the STK push delay — in production this calls /api/mpesa/stk-push
    await new Promise(resolve => setTimeout(resolve, 3000))
    // Simulate Safaricom callback confirming payment
    await api.patch(`/orders/${order.id}/status`, { status: 'CONFIRMED' })
    setPolling(false)
    setStep(2)
  } catch (err) {
    setError('Payment failed. Try again.')
    setPolling(false)
  } finally {
    setSubmitting(false)
  }
}

  /*
   * Poll the order status every 3 seconds.
   * When Safaricom calls our callback, the backend marks the order CONFIRMED.
   * We detect that here and move to the success screen.
   * Stop after 2 minutes (40 attempts) to avoid infinite polling.
   */
  const pollOrderStatus = (orderId, attempts = 0) => {
    if (attempts >= 40) {
      setPolling(false)
      setSubmitting(false)
      setError('Payment timed out. Check your M-Pesa messages and contact support if payment was deducted.')
      return
    }
    setTimeout(async () => {
      try {
        const res = await api.get(`/orders/${orderId}/status`)
        if (res.data.status === 'CONFIRMED' || res.data.status === 'PROCESSING') {
          setPolling(false)
          setSubmitting(false)
          setStep(2)
        } else {
          pollOrderStatus(orderId, attempts + 1)
        }
      } catch {
        pollOrderStatus(orderId, attempts + 1)
      }
    }, 3000)
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-7 h-7 border-2 border-[#0f4c35] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col bg-[#f9fafb]">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">

        {/* Back button */}
        <button onClick={() => step === 0 ? navigate('/cart') : setStep(s => s - 1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#0f4c35] font-medium mb-6 transition-colors group">
          <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
          {step === 0 ? 'Back to cart' : 'Back'}
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-[#0f4c35]' : 'text-gray-300'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                  i < step  ? 'bg-[#0f4c35] border-[#0f4c35] text-white' :
                  i === step ? 'border-[#0f4c35] text-[#0f4c35]' :
                               'border-gray-200 text-gray-300'
                }`}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span className="text-xs font-semibold hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-px w-8 ${i < step ? 'bg-[#0f4c35]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── LEFT — Main content ──────────────────────────── */}
          <div className="lg:col-span-2">

            {/* STEP 0 — Shipping */}
            {step === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-extrabold text-gray-900 mb-5 flex items-center gap-2">
                  <MapPin size={16} className="text-[#0f4c35]" /> Delivery Details
                </h2>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">{error}</div>
                )}
                <form onSubmit={handleShippingSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <input value={shipping.fullName}
                        onChange={e => setShipping({ ...shipping, fullName: e.target.value })}
                        placeholder="John Kamau" required
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone Number</label>
                      <input value={shipping.phone}
                        onChange={e => setShipping({ ...shipping, phone: e.target.value })}
                        placeholder="0712 345 678" required type="tel"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Delivery Address</label>
                      <input value={shipping.address}
                        onChange={e => setShipping({ ...shipping, address: e.target.value })}
                        placeholder="House/Apt, Street, Area" required
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">City</label>
                      <input value={shipping.city}
                        onChange={e => setShipping({ ...shipping, city: e.target.value })}
                        required
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">Postal Code</label>
                      <input value={shipping.postalCode}
                        onChange={e => setShipping({ ...shipping, postalCode: e.target.value })}
                        placeholder="00100"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={submitting}
                    className="w-full py-3 bg-[#0f4c35] hover:bg-[#1a6b4a] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 mt-2">
                    {submitting ? 'Saving...' : 'Continue to Payment'}
                  </button>
                </form>
              </div>
            )}

            {/* STEP 1 — M-Pesa Payment */}
            {step === 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-base font-extrabold text-gray-900 mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-[#0f4c35]" /> Pay with M-Pesa
                </h2>
                <p className="text-xs text-gray-400 mb-6">
                  Enter your M-Pesa number. You'll receive a prompt on your phone to enter your PIN.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">{error}</div>
                )}

                {polling ? (
                  /* Waiting for payment confirmation */
                  <div className="text-center py-10">
                    <div className="w-14 h-14 bg-[#e8f5ee] rounded-full flex items-center justify-center mx-auto mb-4">
                      <Loader size={24} className="text-[#0f4c35] animate-spin" />
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-1">Waiting for payment...</p>
                    <p className="text-xs text-gray-400">
                      Check your phone for the M-Pesa prompt and enter your PIN.
                    </p>
                    <p className="text-xs text-gray-300 mt-3">
                      Do not close this page.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                        M-Pesa Phone Number
                      </label>
                      <div className="flex gap-2">
                        <span className="flex items-center px-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-500 font-medium">
                          🇰🇪 +254
                        </span>
                        <input
                          value={mpesaPhone}
                          onChange={e => setMpesaPhone(e.target.value)}
                          placeholder="712 345 678"
                          type="tel"
                          className="flex-1 px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Amount summary */}
                    <div className="bg-[#e8f5ee] rounded-xl p-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Order total</span>
                        <span>KSh {Number(grandTotal).toLocaleString()}</span>
                      </div>
                      <p className="text-xs text-[#0f4c35] font-medium mt-1">
                        This amount will be charged to your M-Pesa account.
                      </p>
                    </div>

                    <button onClick={handleMpesaPay} disabled={submitting}
                      className="w-full py-3 bg-[#0f4c35] hover:bg-[#1a6b4a] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                      {submitting
                        ? <><Loader size={15} className="animate-spin" /> Sending prompt...</>
                        : '📱 Pay KSh ' + Number(grandTotal).toLocaleString() + ' via M-Pesa'
                      }
                    </button>

                    <p className="text-center text-xs text-gray-400">
                      Powered by Safaricom M-Pesa · Secure payment
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2 — Confirmation */}
            {step === 2 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                <div className="w-16 h-16 bg-[#e8f5ee] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={28} className="text-[#0f4c35]" />
                </div>
                <h2 className="text-xl font-extrabold text-gray-900 mb-2">Payment confirmed!</h2>
                <p className="text-sm text-gray-500 mb-1">
                  Order <span className="font-bold text-gray-900">#{order?.id}</span> is being prepared.
                </p>
                <p className="text-xs text-gray-400 mb-8">
                  You'll receive an M-Pesa confirmation SMS shortly.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Link to="/orders"
                    className="px-5 py-2.5 bg-[#0f4c35] hover:bg-[#1a6b4a] text-white text-sm font-semibold rounded-xl transition-colors">
                    Track my order
                  </Link>
                  <Link to="/store"
                    className="px-5 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                    Continue shopping
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT — Order summary ────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-20">
              <h3 className="text-sm font-extrabold text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {cart?.items?.map(item => (
                  <div key={item.productId} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 overflow-hidden shrink-0 border border-gray-100">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                        : <div className="w-full h-full bg-gray-100" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-800 truncate">{item.productName}</p>
                      <p className="text-xs text-gray-400">×{item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold text-gray-900 shrink-0">
                      KSh {Number(item.subtotal).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Subtotal</span>
                  <span>KSh {Number(total).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Delivery</span>
                  <span className={delivery === 0 ? 'text-[#0f4c35] font-medium' : ''}>
                    {delivery === 0 ? 'Free' : `KSh ${delivery}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>KSh {Number(grandTotal).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </div>
  )
}