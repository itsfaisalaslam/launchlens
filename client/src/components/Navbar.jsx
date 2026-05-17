import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { navLinks } from '../utils/navigation.js'

function Navbar() {
  const { isAuthenticated, logout, user } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const visibleLinks = navLinks.filter((link) => {
    if (link.adminOnly) {
      return user?.role === 'admin'
    }

    return true
  })

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 ${
      isActive
        ? 'bg-cta-gradient text-white shadow-soft'
        : 'text-slate-300 hover:bg-card hover:text-white'
    }`

  const closeMobileMenu = () => setMobileOpen(false)

  return (
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div className="page-shell">
        <div className="rounded-2xl border border-line bg-panel px-4 py-3 shadow-soft">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3" onClick={closeMobileMenu}>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cta-gradient font-extrabold text-white shadow-soft">
                SV
              </div>
              <div>
                <p className="text-lg font-extrabold tracking-tight text-ink">
                  Startup Validator
                </p>
                <p className="text-xs text-slate-400">
                  Validate your startup ideas with AI-powered insights
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-line bg-card text-slate-200 lg:hidden"
              aria-label="Toggle navigation menu"
            >
              <span className="space-y-1.5">
                <span className="block h-0.5 w-5 rounded bg-current" />
                <span className="block h-0.5 w-5 rounded bg-current" />
                <span className="block h-0.5 w-5 rounded bg-current" />
              </span>
            </button>

            <div className="hidden items-center gap-3 lg:flex">
              <nav className="flex items-center gap-2 rounded-full border border-line bg-card p-1.5">
                {visibleLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={navLinkClass}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              {isAuthenticated ? (
                <>
                  <div className="rounded-full border border-line bg-card px-4 py-2.5 text-sm font-semibold text-slate-200">
                    {user?.name}
                  </div>
                  <button
                    type="button"
                    onClick={logout}
                    className="premium-button"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="premium-button-secondary">
                    Login
                  </Link>
                  <Link to="/register" className="premium-button">
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>

          {mobileOpen ? (
            <div className="mt-4 space-y-4 border-t border-line pt-4 lg:hidden">
              <nav className="grid gap-2">
                {visibleLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={navLinkClass}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </NavLink>
                ))}
              </nav>

              <div className="grid gap-3">
                {isAuthenticated ? (
                  <>
                    <div className="rounded-3xl border border-line bg-card px-4 py-3 text-sm font-semibold text-slate-200">
                      Signed in as {user?.name}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        closeMobileMenu()
                        logout()
                      }}
                      className="premium-button"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="premium-button-secondary"
                      onClick={closeMobileMenu}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="premium-button"
                      onClick={closeMobileMenu}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  )
}

export default Navbar
