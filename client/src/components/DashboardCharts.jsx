import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export function FoodPreferencesChart({ data }) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="card chart-card">
        <h3>Food Preferences</h3>
        <p className="no-data">No meal preference data available</p>
      </div>
    )
  }

  const chartData = Object.entries(data).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  return (
    <div className="card chart-card">
      <h3>Food Preferences</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function ChauffeurChart({ data }) {
  if (!data) {
    return (
      <div className="card chart-card">
        <h3>Chauffeur Status</h3>
        <p className="no-data">No chauffeur data available</p>
      </div>
    )
  }

  const chartData = [
    { name: 'Chauffeur Coming', value: data.coming || 0 },
    { name: 'No Chauffeur', value: data.notComing || 0 },
  ]

  return (
    <div className="card chart-card">
      <h3>Chauffeur Status</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            <Cell fill="#3b82f6" />
            <Cell fill="#10b981" />
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function GuestFoodChart({ vegGuests, nonVegGuests }) {
  const chartData = [
    { name: 'Veg Guests', value: vegGuests || 0 },
    { name: 'Non-Veg Guests', value: nonVegGuests || 0 },
  ]

  if (vegGuests === 0 && nonVegGuests === 0) {
    return (
      <div className="card chart-card">
        <h3>Guest Food Preferences</h3>
        <p className="no-data">No guest food preference data available</p>
      </div>
    )
  }

  return (
    <div className="card chart-card">
      <h3>Guest Food Preferences</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            <Cell fill="#10b981" />
            <Cell fill="#ef4444" />
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
