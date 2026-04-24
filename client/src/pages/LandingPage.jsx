import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <div className="landing-badge">
        ✨ All in one event management platform
      </div>

      <h1 className="landing-title">
        Welcome to EventX
      </h1>

      <p className="landing-subtitle">
        A full-stack event management application with QR code-based check-in system and admin dashboard.      
      </p>

      <div className="landing-features">
        <div className="landing-feature">
          <span className="icon">⚡</span>
          Full-stack application
        </div>
        <div className="landing-feature">
          <span className="icon">📱</span>
          Scanner system for check-ins
        </div>
        <div className="landing-feature">
          <span className="icon">💻</span>
          Password-protected admin panel
        </div>
      </div>

      <button
        id="start-registration-btn"
        className="btn btn-primary btn-lg"
        onClick={() => navigate('/register')}
      >
        Register for an event →
      </button>
    </div>
  )
}

export default LandingPage
