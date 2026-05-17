import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'

function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [ideas, setIdeas] = useState([])
  const [loading, setLoading] = useState(user?.role === 'admin')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAdminData = async () => {
      if (user?.role !== 'admin') {
        setLoading(false)
        return
      }

      setLoading(true)
      setError('')

      try {
        const [statsResponse, usersResponse, ideasResponse] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/ideas'),
        ])

        setStats(statsResponse.data.stats)
        setUsers(usersResponse.data.users || [])
        setIdeas(ideasResponse.data.ideas || [])
      } catch (fetchError) {
        setError(
          fetchError.response?.data?.message ||
            'Unable to load admin dashboard data right now.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [user])

  if (user?.role !== 'admin') {
    return (
      <div className="page-shell py-16">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-red-400/30 bg-card p-8 shadow-soft">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-300">
            Access Denied
          </p>
          <h1 className="mt-3 text-3xl font-bold text-ink">Admin access required</h1>
          <p className="mt-4 leading-7 text-slate-400">
            This area is available only to administrators. Your current account does not have permission to view system-wide Startup Validator data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-shell space-y-8 py-10 lg:py-14">
      <div className="rounded-[2rem] border border-line bg-panel p-8 shadow-float">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
          Admin Panel
        </p>
        <h1 className="mt-3 text-3xl font-extrabold text-ink">
          Startup Validator Administration
        </h1>
        <p className="mt-3 max-w-3xl text-slate-400">
          Monitor platform usage, review submitted startup ideas, and track report performance from one AI analytics console.
        </p>
      </div>

      {loading ? (
        <div className="rounded-3xl border border-line bg-card p-6 text-slate-400 shadow-soft">
          Loading admin dashboard...
        </div>
      ) : null}

      {error ? (
        <div className="rounded-3xl border border-red-400/30 bg-red-500/10 p-6 text-red-300 shadow-soft">
          {error}
        </div>
      ) : null}

      {!loading && !error && stats ? (
        <>
          <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <article className="rounded-2xl border border-line bg-card p-6 shadow-soft">
              <p className="text-sm text-slate-500">Total Users</p>
              <p className="mt-3 text-4xl font-extrabold text-ink">{stats.totalUsers}</p>
            </article>
            <article className="rounded-2xl border border-line bg-card p-6 shadow-soft">
              <p className="text-sm text-slate-500">Total Ideas</p>
              <p className="mt-3 text-4xl font-extrabold text-ink">{stats.totalIdeas}</p>
            </article>
            <article className="rounded-2xl border border-line bg-card p-6 shadow-soft">
              <p className="text-sm text-slate-500">Total Reports</p>
              <p className="mt-3 text-4xl font-extrabold text-ink">{stats.totalReports}</p>
            </article>
            <article className="rounded-2xl border border-line bg-card p-6 shadow-soft">
              <p className="text-sm text-slate-500">Average Score</p>
              <p className="mt-3 text-4xl font-extrabold text-ink">{stats.averageScore}</p>
            </article>
          </section>

          <section className="grid gap-8 xl:grid-cols-2">
            <div className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold text-ink">Recent Users</h2>
                <p className="mt-2 text-slate-400">
                  Latest registered users on the platform.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-line text-slate-500">
                    <tr>
                      <th className="px-3 py-3 font-medium">Name</th>
                      <th className="px-3 py-3 font-medium">Email</th>
                      <th className="px-3 py-3 font-medium">Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 8).map((adminUser) => (
                      <tr
                        key={adminUser._id}
                        className="border-b border-line last:border-b-0"
                      >
                        <td className="px-3 py-4 font-medium text-ink">
                          {adminUser.name}
                        </td>
                        <td className="px-3 py-4 text-slate-400">
                          {adminUser.email}
                        </td>
                        <td className="px-3 py-4">
                          <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                            {adminUser.role}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-[2rem] border border-line bg-card p-6 shadow-soft">
              <div className="mb-5">
                <h2 className="text-2xl font-semibold text-ink">Recent Ideas</h2>
                <p className="mt-2 text-slate-400">
                  Latest startup ideas submitted by users.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-line text-slate-500">
                    <tr>
                      <th className="px-3 py-3 font-medium">Title</th>
                      <th className="px-3 py-3 font-medium">User</th>
                      <th className="px-3 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ideas.slice(0, 8).map((idea) => (
                      <tr
                        key={idea._id}
                        className="border-b border-line last:border-b-0"
                      >
                        <td className="px-3 py-4">
                          <div className="font-medium text-ink">{idea.title}</div>
                          <div className="mt-1 text-slate-500">{idea.industry}</div>
                        </td>
                        <td className="px-3 py-4 text-slate-400">
                          <div>{idea.userId?.name || 'Unknown user'}</div>
                          <div className="mt-1 text-slate-500">
                            {idea.userId?.email || 'No email'}
                          </div>
                        </td>
                        <td className="px-3 py-4">
                          <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                            {idea.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  )
}

export default AdminDashboard
