import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

function MainLayout() {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="pointer-events-none fixed inset-0 z-0 bg-mesh-fade opacity-100" />
      <Navbar />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
