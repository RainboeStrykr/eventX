import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { EVENT_BY_KEY } from '../constants/events'

const API_URL = import.meta.env.VITE_API_URL || ''

const INITIAL_FORM = {
  fullName: '',
  phoneNumber: '',
  sameAsPhone: true,
  whatsappNumber: '',
  email: '',
  numGuests: 0,
  mealPreferences: [],
  vegGuests: 0,
  nonVegGuests: 0,
  chauffeurComing: 'no',
  chauffeurFoodPreference: 'veg',
  specialRequests: '',
}

function EventRegisterPage() {
  const navigate = useNavigate()
  const { eventKey } = useParams()
  const selectedEvent = EVENT_BY_KEY[eventKey]
  const isMarriage = eventKey === 'marriage'

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState(INITIAL_FORM)

  const derivedWhatsappNumber = useMemo(() => {
    return formData.sameAsPhone ? formData.phoneNumber : formData.whatsappNumber
  }, [formData.sameAsPhone, formData.phoneNumber, formData.whatsappNumber])

  if (!selectedEvent) {
    return (
      <div className="page-container">
        <div className="register-page">
          <div className="card">
            <p style={{ marginBottom: '1rem' }}>Invalid event selected.</p>
            <button className="btn btn-primary" onClick={() => navigate('/register')}>
              Back to Event Selection
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const nextValue = type === 'checkbox' ? checked : value
    setFormData(prev => ({ ...prev, [name]: nextValue }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleMealToggle = (meal) => {
    setFormData((prev) => {
      const hasMeal = prev.mealPreferences.includes(meal)
      return {
        ...prev,
        mealPreferences: hasMeal
          ? prev.mealPreferences.filter(item => item !== meal)
          : [...prev.mealPreferences, meal],
      }
    })
  }

  const validate = () => {
    const nextErrors = {}
    const phoneRegex = /^\+\d{10,15}$/

    if (!formData.fullName.trim()) nextErrors.fullName = 'Name is required'
    if (!formData.phoneNumber.trim()) {
      nextErrors.phoneNumber = 'Phone number is required'
    } else if (!phoneRegex.test(formData.phoneNumber.replace(/\s/g, ''))) {
      nextErrors.phoneNumber = 'Include country code e.g. +919876543210'
    }

    if (!derivedWhatsappNumber.trim()) {
      nextErrors.whatsappNumber = 'WhatsApp number is required'
    } else if (!phoneRegex.test(derivedWhatsappNumber.replace(/\s/g, ''))) {
      nextErrors.whatsappNumber = 'Include country code e.g. +919876543210'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nextErrors.email = 'Enter a valid email address'
    }

    const numGuests = parseInt(formData.numGuests, 10) || 0
    const vegGuests = parseInt(formData.vegGuests, 10) || 0
    const nonVegGuests = parseInt(formData.nonVegGuests, 10) || 0
    if (numGuests < 0) nextErrors.numGuests = 'Cannot be negative'
    if (vegGuests < 0) nextErrors.vegGuests = 'Cannot be negative'
    if (nonVegGuests < 0) nextErrors.nonVegGuests = 'Cannot be negative'
    if (vegGuests + nonVegGuests > numGuests) {
      nextErrors.nonVegGuests = 'Veg + Non-veg guests cannot exceed total guests'
    }

    if (isMarriage && formData.mealPreferences.length === 0) {
      nextErrors.mealPreferences = 'Select at least one meal option'
    }

    if (formData.chauffeurComing === 'yes' && !formData.chauffeurFoodPreference) {
      nextErrors.chauffeurFoodPreference = 'Choose chauffeur food preference'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const payload = {
        eventKey,
        fullName: formData.fullName.trim(),
        phoneNumber: formData.phoneNumber.replace(/\s/g, ''),
        whatsappNumber: derivedWhatsappNumber.replace(/\s/g, ''),
        email: formData.email ? formData.email.trim() : '',
        numGuests: parseInt(formData.numGuests, 10) || 0,
        mealPreferences: isMarriage ? formData.mealPreferences : [],
        vegGuests: parseInt(formData.vegGuests, 10) || 0,
        nonVegGuests: parseInt(formData.nonVegGuests, 10) || 0,
        chauffeurComing: formData.chauffeurComing === 'yes',
        chauffeurFoodPreference:
          formData.chauffeurComing === 'yes' ? formData.chauffeurFoodPreference : null,
        specialRequests: formData.specialRequests.trim(),
      }

      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')

      navigate('/confirmation', {
        state: {
          participantId: data.participant.participantId,
          fullName: data.participant.fullName,
          qrCode: data.participant.qrCode,
          eventKey: data.participant.eventKey,
          eventName: data.participant.eventName,
          whatsappNumber: payload.whatsappNumber,
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
          <h1>{selectedEvent.label} Registration</h1>
          <p>Answer the event-specific questions below</p>
        </div>

        <form className="card" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="fullName">Name <span className="required">*</span></label>
            <input id="fullName" name="fullName" type="text" className="form-input" value={formData.fullName} onChange={handleChange} />
            {errors.fullName && <span className="form-error">{errors.fullName}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="phoneNumber">Phone Number <span className="required">*</span></label>
            <input id="phoneNumber" name="phoneNumber" type="tel" className="form-input" placeholder="+919876543210" value={formData.phoneNumber} onChange={handleChange} />
            {errors.phoneNumber && <span className="form-error">{errors.phoneNumber}</span>}
          </div>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" name="sameAsPhone" checked={formData.sameAsPhone} onChange={handleChange} />
              WhatsApp number same as phone number
            </label>
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
              value={formData.sameAsPhone ? formData.phoneNumber : formData.whatsappNumber}
              onChange={handleChange}
              disabled={formData.sameAsPhone}
            />
            {errors.whatsappNumber && <span className="form-error">{errors.whatsappNumber}</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email (optional)</label>
            <input id="email" name="email" type="email" className="form-input" value={formData.email} onChange={handleChange} />
            {errors.email && <span className="form-error">{errors.email}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="numGuests">Number of Guests</label>
              <input id="numGuests" name="numGuests" type="number" min="0" className="form-input" value={formData.numGuests} onChange={handleChange} />
              {errors.numGuests && <span className="form-error">{errors.numGuests}</span>}
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="vegGuests">Guests preferring Veg</label>
              <input id="vegGuests" name="vegGuests" type="number" min="0" className="form-input" value={formData.vegGuests} onChange={handleChange} />
              {errors.vegGuests && <span className="form-error">{errors.vegGuests}</span>}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="nonVegGuests">Guests preferring Non-veg</label>
            <input id="nonVegGuests" name="nonVegGuests" type="number" min="0" className="form-input" value={formData.nonVegGuests} onChange={handleChange} />
            {errors.nonVegGuests && <span className="form-error">{errors.nonVegGuests}</span>}
          </div>

          {isMarriage && (
            <div className="form-group">
              <label className="form-label">Select meal(s)</label>
              <div className="event-options">
                {['breakfast', 'lunch', 'dinner'].map((meal) => (
                  <label key={meal} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      type="checkbox"
                      checked={formData.mealPreferences.includes(meal)}
                      onChange={() => handleMealToggle(meal)}
                    />
                    {meal[0].toUpperCase() + meal.slice(1)}
                  </label>
                ))}
              </div>
              {errors.mealPreferences && <span className="form-error">{errors.mealPreferences}</span>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="chauffeurComing">Chauffeur coming?</label>
            <select id="chauffeurComing" name="chauffeurComing" className="form-select" value={formData.chauffeurComing} onChange={handleChange}>
              <option value="no">No</option>
              <option value="yes">Yes</option>
            </select>
          </div>

          {formData.chauffeurComing === 'yes' && (
            <div className="form-group">
              <label className="form-label" htmlFor="chauffeurFoodPreference">Chauffeur food preference</label>
              <select id="chauffeurFoodPreference" name="chauffeurFoodPreference" className="form-select" value={formData.chauffeurFoodPreference} onChange={handleChange}>
                <option value="veg">Veg</option>
                <option value="non-veg">Non-veg</option>
              </select>
              {errors.chauffeurFoodPreference && <span className="form-error">{errors.chauffeurFoodPreference}</span>}
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="specialRequests">Special requests</label>
            <textarea id="specialRequests" name="specialRequests" className="form-textarea" value={formData.specialRequests} onChange={handleChange} />
          </div>

          {errors.submit && <div className="form-error" style={{ marginBottom: '0.75rem' }}>{errors.submit}</div>}

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Processing...' : `Submit ${selectedEvent.label} Registration`}
          </button>
        </form>
      </div>
    </div>
  )
}

export default EventRegisterPage
