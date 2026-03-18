import { useLocation, useNavigate, Link } from 'react-router-dom'

function ConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { participantId, fullName, qrCode } = location.state || {}

  // If no state, redirect to home
  if (!participantId) {
    return (
      <div className="page-container">
        <div className="confirmation-page">
          <div className="success-icon">❓</div>
          <div className="confirmation-details">
            <h1 style={{ color: 'var(--color-text-primary)' }}>No Registration Data</h1>
            <p>It looks like you haven't registered yet.</p>
          </div>
          <Link to="/register" className="btn btn-primary">Go to Registration</Link>
        </div>
      </div>
    )
  }

  const handleDownloadQR = () => {
    const link = document.createElement('a')
    link.download = `${participantId}-qr.png`
    link.href = qrCode
    link.click()
  }

  return (
    <div className="page-container">
      <div className="confirmation-page">
        <div className="success-icon">✓</div>

        <div className="confirmation-details">
          <h1>Registration Successful</h1>
          <p>You're all set for the event!</p>
        </div>

        <div className="card participant-info" style={{ width: '100%' }}>
          <div className="info-item">
            <span className="info-label">Name</span>
            <span className="info-value">{fullName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Participant ID</span>
            <span className="info-value" style={{ color: 'var(--color-accent)', fontFamily: 'monospace' }}>
              {participantId}
            </span>
          </div>
        </div>

        <div className="card" style={{ width: '100%', padding: 0, overflow: 'hidden' }}>
          <div className="qr-container">
            <img
              src={qrCode}
              alt={`QR Code for ${participantId}`}
              id="qr-code-img"
            />
            <p style={{ color: '#333', fontSize: '0.8rem', fontWeight: 500 }}>{participantId}</p>
          </div>
        </div>

        <button
          id="download-qr-btn"
          className="btn btn-secondary"
          onClick={handleDownloadQR}
          style={{ width: '100%' }}
        >
          📥 Download QR Code
        </button>

        <div className="whatsapp-notice">
          <span style={{ fontSize: '1.5rem' }}>💬</span>
          <span>This QR code has also been sent to your WhatsApp</span>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/')}
          style={{ width: '100%' }}
        >
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default ConfirmationPage
