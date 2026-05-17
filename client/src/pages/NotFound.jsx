import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div className="page-shell py-16">
      <div className="mx-auto max-w-2xl page-card text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">
          404 Error
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="mt-3 text-slate-600">
          The page you are looking for does not exist yet or the route is
          incorrect.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Back to Home
        </Link>
      </div>
    </div>
  )
}

export default NotFound
