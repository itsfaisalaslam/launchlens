import { BrowserRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import MainLayout from './layouts/MainLayout.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import CompareIdeas from './pages/CompareIdeas.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import MentorChat from './pages/MentorChat.jsx'
import NotFound from './pages/NotFound.jsx'
import Register from './pages/Register.jsx'
import ReportDetails from './pages/ReportDetails.jsx'
import SubmitIdea from './pages/SubmitIdea.jsx'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/compare" element={<CompareIdeas />} />
            <Route path="/mentor" element={<MentorChat />} />
            <Route path="/submit-idea" element={<SubmitIdea />} />
            <Route path="/report/:reportId" element={<ReportDetails />} />
            <Route path="/reports/:reportId" element={<ReportDetails />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
