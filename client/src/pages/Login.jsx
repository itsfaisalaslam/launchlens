import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading, authError, clearAuthError } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const redirectPath = location.state?.from?.pathname || '/dashboard'

  const handleChange = (event) => {
    clearAuthError()
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const data = await login(formData)

    if (data?.token && data?.user) {
      navigate(redirectPath, { replace: true })
    }
  }

  return (
    <div className="page-shell py-16">
      <div className="mx-auto max-w-xl page-card">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
          Auth Module
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Login</h1>
        <p className="mt-3 text-slate-600">
          Sign in to access your Startup Validator dashboard and startup evaluation
          workspace.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-primary"
              placeholder="Enter your password"
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
            className="w-full rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          New to Startup Validator?{' '}
          <Link to="/register" className="font-semibold text-primary">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login
