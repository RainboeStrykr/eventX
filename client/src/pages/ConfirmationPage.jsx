import { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

function ConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { participantId, fullName, qrCode, whatsappNumber } = location.state || {}
  const [waLoading, setWaLoading] = useState(false)
  const [waFallback, setWaFallback] = useState(false)

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

  // Format phone: strip + and any non-digits, ensure it's ready for wa.me
  const formatPhone = (num) => {
    if (!num) return null
    return num.replace(/\D/g, '')
  }

  const handleWhatsAppShare = () => {
    const phone = formatPhone(whatsappNumber)
    if (!phone) return

    setWaLoading(true)
    setWaFallback(false)

    const qrUrl = `${window.location.origin}/api/qr/${participantId}`

    const message = encodeURIComponent(
      `Hello ${fullName},\n\nYour registration for EventX is confirmed! 🎉\n\n` +
      `📋 *Participant ID:* ${participantId}\n\n` +
      `🔲 *Your QR Code:*\n${qrUrl}\n\n` +
      `Tap the link above to view and save your QR code.\n` +
      `Show it at the entrance for check-in. 🚀`
    )

    const waUrl = `https://wa.me/${phone}?text=${message}`
    const newTab = window.open(waUrl, '_blank', 'noopener,noreferrer')

    // Show fallback if popup was blocked
    setTimeout(() => {
      setWaLoading(false)
      if (!newTab || newTab.closed || typeof newTab.closed === 'undefined') {
        setWaFallback(true)
      }
    }, 1500)
  }

  const phone = formatPhone(whatsappNumber)
  const hasValidPhone = phone && phone.length >= 10

  return (
    <div className="page-container">
      <div className="confirmation-page">
        <div className="success-icon">✓</div>

        <div className="confirmation-details">
          <h1>Registration Successful</h1>
          <p>You're all set for the event!</p>
        </div>

        {/* Participant Info */}
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
          {whatsappNumber && (
            <div className="info-item">
              <span className="info-label">WhatsApp</span>
              <span className="info-value">{whatsappNumber}</span>
            </div>
          )}
        </div>

        {/* QR Code */}
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

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', width: '100%', flexWrap: 'wrap' }}>
          <button
            id="download-qr-btn"
            className="btn btn-secondary"
            onClick={handleDownloadQR}
            style={{ flex: 1, minWidth: '140px' }}
          >
            📥 Download QR
          </button>

          <button
            id="whatsapp-share-btn"
            className="btn"
            onClick={handleWhatsAppShare}
            disabled={!hasValidPhone || waLoading}
            style={{
              flex: 1,
              minWidth: '140px',
              background: hasValidPhone ? 'linear-gradient(135deg, #25d366, #128c7e)' : undefined,
              color: hasValidPhone ? 'white' : undefined,
              boxShadow: hasValidPhone ? '0 4px 20px rgba(37, 211, 102, 0.35)' : undefined,
              opacity: !hasValidPhone ? 0.5 : 1,
              cursor: !hasValidPhone ? 'not-allowed' : 'pointer',
            }}
          >
            {waLoading ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} />
                Opening…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Send to WhatsApp
              </>
            )}
          </button>
        </div>

        {/* Fallback notice */}
        {waFallback && (
          <div style={{
            width: '100%',
            padding: '0.875rem 1rem',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            color: 'var(--color-warning)',
            animation: 'fadeIn 0.3s ease',
          }}>
            ⚠️ If WhatsApp did not open, try downloading the QR code and sharing it manually.
          </div>
        )}

        {!hasValidPhone && (
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
            WhatsApp button unavailable — no valid number provided.
          </p>
        )}

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
