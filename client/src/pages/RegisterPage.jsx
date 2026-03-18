import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

function RegisterPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    fullName: '',
    whatsappNumber: '',
    email: '',
    numGuests: 0,
    foodPreference: 'veg',
    specialRequests: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }
    if (!formData.whatsappNumber.trim()) {
      newErrors.whatsappNumber = 'WhatsApp number is required'
    } else {
      const phone = formData.whatsappNumber.replace(/\s/g, '')
      if (!/^\+\d{10,15}$/.test(phone)) {
        newErrors.whatsappNumber = 'Include country code e.g. +919876543210'
      }
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address'
    }
    if (formData.numGuests < 0) {
      newErrors.numGuests = 'Cannot be negative'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          whatsappNumber: formData.whatsappNumber.replace(/\s/g, ''),
          numGuests: parseInt(formData.numGuests) || 0,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      navigate('/confirmation', {
        state: {
          participantId: data.participant.participantId,
          fullName: data.participant.fullName,
          qrCode: data.participant.qrCode,
        },
      })
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="register-page">
        <div className="register-header">
          <h1>Event Registration</h1>
          <p>Fill in your details to secure your spot</p>
        </div>

        <form className="card" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">
              Full Name <span className="required">*</span>
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              className="form-input"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
            />
            {errors.fullName && <span className="form-error">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="whatsappNumber">
              WhatsApp Number <span className="required">*</span>
            </label>
            <input
              id="whatsappNumber"
              name="whatsappNumber"
              type="tel"
              className="form-input"
              placeholder="+919876543210"
              value={formData.whatsappNumber}
              onChange={handleChange}
            />
            {errors.whatsappNumber && <span className="form-error">{errors.whatsappNumber}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email <span style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>(optional)</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="numGuests">
                Number of Guests
              </label>
              <input
                id="numGuests"
                name="numGuests"
                type="number"
                min="0"
                className="form-input"
                value={formData.numGuests}
                onChange={handleChange}
              />
              {errors.numGuests && <span className="form-error">{errors.numGuests}</span>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="foodPreference">
                Food Preference
              </label>
              <select
                id="foodPreference"
                name="foodPreference"
                className="form-select"
                value={formData.foodPreference}
                onChange={handleChange}
              >
                <option value="veg">🥗 Vegetarian</option>
                <option value="non-veg">🍗 Non-Vegetarian</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="specialRequests">
              Special Requests
            </label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              className="form-textarea"
              placeholder="Any dietary needs, accessibility requirements, etc."
              value={formData.specialRequests}
              onChange={handleChange}
            />
          </div>

          {errors.submit && (
            <div style={{
              padding: '0.75rem 1rem',
              background: 'var(--color-error-bg)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-error)',
              fontSize: '0.9rem',
              marginBottom: '1rem',
            }}>
              {errors.submit}
            </div>
          )}

          <button
            id="confirm-participation-btn"
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%' }}
          >
            {loading ? (
              <>
                <div className="spinner spinner-sm" style={{ borderTopColor: '#fff' }} />
                Processing...
              </>
            ) : (
              'Confirm Participation'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
