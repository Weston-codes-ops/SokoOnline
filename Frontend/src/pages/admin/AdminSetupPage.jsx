import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import logo from '../../assets/sokoonline-logo.svg'

export default function AdminSetupPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminSecret: '',
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setMessage('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      await api.post('/users/admin', {
        name: form.name,
        email: form.email,
        password: form.password,
        adminSecret: form.adminSecret,
      })
      setMessage('Admin account created successfully. You can now sign in and access the admin area.')
      setForm({ name: '', email: '', password: '', confirmPassword: '', adminSecret: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Admin setup failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7faf8] px-4 py-10">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-[#0f4c35] px-8 py-8 text-white">
          <Link to="/" className="inline-flex items-center mb-4">
            <img src={logo} alt="SokoOnline" className="h-8 w-auto" />
          </Link>
          <h1 className="text-2xl font-bold">Create the first admin</h1>
          <p className="text-sm text-white/70 mt-2">Use this page to create an admin account without touching the database or a separate API tool.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}
          {message && <div className="p-3 rounded-lg bg-green-50 text-green-700 text-sm">{message}</div>}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Full name</label>
            <input name="name" value={form.name} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm password</label>
            <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Admin secret</label>
            <input name="adminSecret" value={form.adminSecret} onChange={handleChange} required className="w-full px-4 py-3 border border-gray-200 rounded-xl" placeholder="Use the same value as app.admin.create-secret" />
            <p className="text-xs text-gray-500 mt-2">Set this to the same value you configured in the backend as <span className="font-semibold text-[#0f4c35]">app.admin.create-secret</span>.</p>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 rounded-xl bg-[#0f4c35] text-white font-semibold hover:bg-[#1a6b4a] disabled:opacity-60">
            {loading ? 'Creating admin...' : 'Create admin'}
          </button>

          <p className="text-sm text-gray-500">
            After creation, go to <Link to="/login" className="text-[#0f4c35] font-semibold">Login</Link> and sign in as the new admin.
          </p>
        </form>
      </div>
    </div>
  )
}
