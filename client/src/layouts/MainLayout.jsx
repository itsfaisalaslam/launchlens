import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'

function MainLayout() {
  return (
    <div className="min-h-screen bg-transparent">
      <Navbar />
      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout
