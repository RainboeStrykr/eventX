import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import LandingPage from './pages/LandingPage'
import RegisterPage from './pages/RegisterPage'
import EventRegisterPage from './pages/EventRegisterPage'
import ConfirmationPage from './pages/ConfirmationPage'
import AdminScannerPage from './pages/AdminScannerPage'
import AdminDashboardPage from './pages/AdminDashboardPage'

function App() {
  return (
    <>
      <div className="app-bg" />
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/:eventKey" element={<EventRegisterPage />} />
        <Route path="/confirmation" element={<ConfirmationPage />} />
        <Route path="/admin/scanner" element={<AdminScannerPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      </Routes>
    </>
  )
}

export default App
