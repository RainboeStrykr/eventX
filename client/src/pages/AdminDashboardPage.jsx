import { useState, useEffect } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'
import { EVENTS } from '../constants/events'

const API_URL = import.meta.env.VITE_API_URL || ''

function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalRegistrations: 0, totalCheckedIn: 0 })
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [foodFilter, setFoodFilter] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(EVENTS[0].key)

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch stats
      const statsRes = await fetch(`${API_URL}/api/stats?event=${selectedEvent}`)
      const statsData = await statsRes.json()
      setStats(statsData)

      // Fetch participants with filters
      const params = new URLSearchParams()
      params.set('event', selectedEvent)
      if (searchQuery) params.set('search', searchQuery)
      if (foodFilter) params.set('food', foodFilter)

      const participantsRes = await fetch(`${API_URL}/api/participants?${params}`)
      const participantsData = await participantsRes.json()
      setParticipants(participantsData.participants || [])
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData()
    }, 400)
    return () => clearTimeout(timeout)
  }, [searchQuery, foodFilter, selectedEvent])

  const pendingCount = stats.totalRegistrations - stats.totalCheckedIn

  const handleDownloadCSV = async () => {
    try {
      const res = await fetch(`${API_URL}/api/participants/export?event=${selectedEvent}`)
      if (!res.ok) throw new Error('Failed to download CSV')
      
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedEvent}_participants_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Download error:', err)
      alert('Failed to download CSV. Please try again.')
    }
  }

  return (
    <div className="page-container">
      <div className="dashboard-page">
        <div className="dashboard-header">
          <h1>📊 Admin Dashboard</h1>
          <p>Monitor registrations and check-in status</p>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="card stat-card">
            <div className="stat-icon blue">👥</div>
            <div className="stat-value">{stats.totalRegistrations}</div>
            <div className="stat-label">Total Registrations</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon green">✅</div>
            <div className="stat-value">{stats.totalCheckedIn}</div>
            <div className="stat-label">Checked In</div>
          </div>
          <div className="card stat-card">
            <div className="stat-icon yellow">⏳</div>
            <div className="stat-value">{pendingCount}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              id="search-input"
              type="text"
              className="search-input"
              placeholder="Search by name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="filter-select"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            {EVENTS.map((event) => (
              <option key={event.key} value={event.key}>
                {event.label}
              </option>
            ))}
          </select>
          <select
            id="food-filter"
            className="filter-select"
            value={foodFilter}
            onChange={(e) => setFoodFilter(e.target.value)}
          >
            <option value="">All Guest Preferences</option>
            <option value="veg">Has Veg Guests</option>
            <option value="non-veg">Has Non-veg Guests</option>
          </select>
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchData}
          >
            🔄 Refresh
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={handleDownloadCSV}
          >
            📥 Download CSV
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : participants.length === 0 ? (
          <div className="card empty-state">
            <div className="empty-icon">📋</div>
            <p>No participants found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="participants-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>WhatsApp</th>
                  <th>Guests</th>
                  <th>Veg / Non-veg Guests</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((p) => (
                  <tr key={p.participant_id}>
                    <td className="name-cell">{p.full_name}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                      {p.participant_id}
                    </td>
                    <td>{p.whatsapp_number}</td>
                    <td>{p.num_guests}</td>
                    <td>{p.veg_guests || 0} / {p.non_veg_guests || 0}</td>
                    <td>
                      <span className={`badge ${p.checked_in ? 'badge-success' : 'badge-neutral'}`}>
                        {p.checked_in ? '✅ Checked In' : '⏳ Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage
