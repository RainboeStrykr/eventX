import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

const API_URL = import.meta.env.VITE_API_URL || ''

function AdminScannerPage() {
  const [scanResult, setScanResult] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [manualId, setManualId] = useState('')
  const scannerRef = useRef(null)
  const html5QrRef = useRef(null)

  const startScanner = async () => {
    setScanResult(null)
    setScanning(true)

    try {
      const html5Qr = new Html5Qrcode('qr-reader')
      html5QrRef.current = html5Qr

      await html5Qr.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleCheckin(decodedText)
          stopScanner()
        },
        () => {} // ignore errors
      )
    } catch (err) {
      console.error('Scanner error:', err)
      setScanResult({
        type: 'error',
        title: 'Camera Error',
        message: 'Unable to access camera. Please try manual entry or check permissions.',
      })
      setScanning(false)
    }
  }

  const stopScanner = async () => {
    if (html5QrRef.current) {
      try {
        await html5QrRef.current.stop()
        html5QrRef.current.clear()
      } catch (e) {
        // ignore
      }
      html5QrRef.current = null
    }
    setScanning(false)
  }

  const handleCheckin = async (participantId) => {
    if (loading) return
    setLoading(true)
    setScanResult(null)

    try {
      const res = await fetch(`${API_URL}/api/checkin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId }),
      })

      const data = await res.json()

      if (res.status === 404) {
        setScanResult({
          type: 'error',
          title: '❌ Invalid QR Code',
          message: `No participant found with ID: ${participantId}`,
        })
      } else if (data.status === 'already_checked_in') {
        setScanResult({
          type: 'warning',
          title: '⚠️ Already Checked In',
          message: `${data.participant.name} (${data.participant.participantId}) has already checked in.`,
        })
      } else if (data.status === 'success') {
        setScanResult({
          type: 'success',
          title: '✅ Entry Allowed',
          message: `Welcome ${data.participant.name}! ID: ${data.participant.participantId} | Guests: ${data.participant.numGuests} | Food: ${data.participant.foodPreference}`,
        })
      } else {
        setScanResult({
          type: 'error',
          title: 'Error',
          message: data.error || 'Something went wrong',
        })
      }
    } catch (err) {
      setScanResult({
        type: 'error',
        title: 'Connection Error',
        message: 'Unable to connect to the server. Check if the backend is running.',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleManualCheckin = (e) => {
    e.preventDefault()
    if (manualId.trim()) {
      handleCheckin(manualId.trim().toUpperCase())
      setManualId('')
    }
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  return (
    <div className="page-container">
      <div className="scanner-page">
        <div className="scanner-header">
          <h1>🔍 QR Code Scanner</h1>
          <p>Scan attendee QR codes for check-in</p>
        </div>

        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div className="scanner-viewport">
            <div id="qr-reader" ref={scannerRef} style={{ width: '100%' }} />
            {!scanning && !scanResult && (
              <p style={{ color: 'var(--color-text-muted)', padding: '2rem' }}>
                Camera preview will appear here
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {!scanning ? (
              <button
                id="start-scanner-btn"
                className="btn btn-primary"
                onClick={startScanner}
                style={{ flex: 1 }}
              >
                📷 Start Scanner
              </button>
            ) : (
              <button
                id="stop-scanner-btn"
                className="btn btn-secondary"
                onClick={stopScanner}
                style={{ flex: 1 }}
              >
                ⏹ Stop Scanner
              </button>
            )}
          </div>
        </div>

        {/* Manual Entry */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: 'var(--color-text-secondary)' }}>
            Manual Check-in
          </h3>
          <form className="manual-checkin" onSubmit={handleManualCheckin}>
            <input
              id="manual-id-input"
              type="text"
              className="form-input"
              placeholder="Enter participant ID (e.g. EVT-ABC123)"
              value={manualId}
              onChange={(e) => setManualId(e.target.value)}
            />
            <button
              id="manual-checkin-btn"
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={loading || !manualId.trim()}
            >
              {loading ? '...' : 'Check In'}
            </button>
          </form>
        </div>

        {/* Scan Result */}
        {scanResult && (
          <div className={`scan-result ${scanResult.type}`}>
            <h3>{scanResult.title}</h3>
            <p>{scanResult.message}</p>
          </div>
        )}

        {/* Scan Again */}
        {scanResult && !scanning && (
          <button
            className="btn btn-secondary"
            onClick={() => {
              setScanResult(null)
              startScanner()
            }}
            style={{ width: '100%', marginTop: '1rem' }}
          >
            🔄 Scan Another
          </button>
        )}
      </div>
    </div>
  )
}

export default AdminScannerPage
