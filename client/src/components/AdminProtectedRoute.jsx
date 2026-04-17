import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''
const ADMIN_AUTH_KEY = 'eventx_admin_authenticated'

function AdminProtectedRoute({ children }) {
  const [authorized, setAuthorized] = useState(
    sessionStorage.getItem(ADMIN_AUTH_KEY) === 'true'
  )
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('Please enter admin password')
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/admin/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Invalid password')
      }

      sessionStorage.setItem(ADMIN_AUTH_KEY, 'true')
      setAuthorized(true)
      setPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (authorized) return children

  return (
    <div className="page-container">
      <div className="register-page">
        <div className="register-header">
          <h1>Admin Access</h1>
          <p>Enter password to continue</p>
        </div>
        <form className="card" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
            />
          </div>

          {error && <span className="form-error">{error}</span>}

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '1rem' }}
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Unlock Admin'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AdminProtectedRoute
