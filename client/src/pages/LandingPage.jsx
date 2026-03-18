import { useNavigate } from 'react-router-dom'

function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <div className="landing-badge">
        ✨ Exclusive Event
      </div>

      <h1 className="landing-title">
        Welcome to EventX registration
      </h1>

      <p className="landing-subtitle">
        Secure your spot at the most anticipated event of the year. 
        Quick registration, instant QR code, and WhatsApp confirmation.
      </p>

      <div className="landing-features">
        <div className="landing-feature">
          <span className="icon">⚡</span>
          More than 1000+ participants
        </div>
        <div className="landing-feature">
          <span className="icon">📱</span>
          Hybrid Mode
        </div>
        <div className="landing-feature">
          <span className="icon">💬</span>
          Sponsored by SRMIST
        </div>
      </div>

      <button
        id="start-registration-btn"
        className="btn btn-primary btn-lg"
        onClick={() => navigate('/register')}
      >
        Register for the event →
      </button>
    </div>
  )
}

export default LandingPage
