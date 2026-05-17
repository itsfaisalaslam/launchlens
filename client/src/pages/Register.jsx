import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Register() {
  const navigate = useNavigate()
  const { register, loading, authError, clearAuthError } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  })

  const handleChange = (event) => {
    clearAuthError()
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const data = await register(formData)

    if (data?.token && data?.user) {
      navigate('/dashboard', { replace: true })
    }
  }

  return (
    <div className="page-shell py-16">
      <div className="mx-auto max-w-xl page-card">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Auth Module
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Register</h1>
        <p className="mt-3 text-slate-600">
          Create your Startup Validator account to start validating business ideas.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              minLength="6"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              placeholder="Minimum 6 characters"
              required
            />
          </div>

          {authError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {authError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary">
            Login here
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register
