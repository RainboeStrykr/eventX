import { useNavigate } from 'react-router-dom'
import { EVENTS } from '../constants/events'

function RegisterPage() {
  const navigate = useNavigate()

  return (
    <div className="page-container">
      <div className="register-page">
        <div className="register-header">
          <h1>Choose Your Event</h1>
          <p>Select which event you want to register for</p>
        </div>

        <div className="card">
          <div className="event-options">
            {EVENTS.map((event) => (
              <button
                key={event.key}
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate(`/register/${event.key}`)}
                style={{ width: '100%' }}
              >
                Register for {event.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
