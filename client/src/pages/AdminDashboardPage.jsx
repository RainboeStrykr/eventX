import { useState, useEffect } from 'react'
import LoadingSpinner from '../components/LoadingSpinner'

const API_URL = import.meta.env.VITE_API_URL || ''

function AdminDashboardPage() {
  const [stats, setStats] = useState({ totalRegistrations: 0, totalCheckedIn: 0 })
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [foodFilter, setFoodFilter] = useState('')

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch stats
      const statsRes = await fetch(`${API_URL}/api/stats`)
      const statsData = await statsRes.json()
      setStats(statsData)

      // Fetch participants with filters
      const params = new URLSearchParams()
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
  }, [searchQuery, foodFilter])

  const pendingCount = stats.totalRegistrations - stats.totalCheckedIn

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
            id="food-filter"
            className="filter-select"
            value={foodFilter}
            onChange={(e) => setFoodFilter(e.target.value)}
          >
            <option value="">All Food Preferences</option>
            <option value="veg">🥗 Vegetarian</option>
            <option value="non-veg">🍗 Non-Vegetarian</option>
          </select>
          <button
            className="btn btn-secondary btn-sm"
            onClick={fetchData}
          >
            🔄 Refresh
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
                  <th>Food</th>
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
                    <td>
                      <span className={`badge ${p.food_preference === 'veg' ? 'badge-veg' : 'badge-nonveg'}`}>
                        {p.food_preference === 'veg' ? '🥗 Veg' : '🍗 Non-Veg'}
                      </span>
                    </td>
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
