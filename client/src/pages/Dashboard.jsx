import { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js'
import { Doughnut, Bar } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const API = '/api/dashboard'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(API)
        setData(await res.json())
      } catch (err) {
        console.error('Dashboard load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="page">
      <div className="spinner-wrap"><div className="spinner"></div></div>
    </div>
  )

  if (!data) return (
    <div className="page">
      <div className="msg msg-error">Failed to load dashboard data. Is the database running?</div>
    </div>
  )

  const { counts, total_revenue, claims_by_status, policies_by_plan_type, top_agents, recent_claims } = data

  // Claims by Status chart
  const claimLabels = claims_by_status.map(r => r.status)
  const claimData = claims_by_status.map(r => r.count)
  const claimChartData = {
    labels: claimLabels,
    datasets: [{
      data: claimData,
      backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
      borderWidth: 0,
      hoverOffset: 8,
    }]
  }

  // Policies by Plan Type chart
  const planLabels = policies_by_plan_type.map(r => r.plan_type)
  const planData = policies_by_plan_type.map(r => r.count)
  const planChartData = {
    labels: planLabels,
    datasets: [{
      label: 'Policies',
      data: planData,
      backgroundColor: [
        'rgba(102, 126, 234, 0.8)',
        'rgba(118, 75, 162, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(59, 130, 246, 0.8)',
      ],
      borderRadius: 8,
      borderWidth: 0,
    }]
  }

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, font: { family: 'Inter' } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      x: {
        ticks: { font: { family: 'Inter' } },
        grid: { display: false },
      }
    }
  }

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { padding: 16, font: { family: 'Inter', size: 13 } }
      }
    },
    cutout: '65%',
  }

  return (
    <div className="page">
      <h2>📊 Dashboard</h2>

      {/* Stat Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{counts.total_customers}</div>
          <div className="stat-label">Total Customers</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📄</div>
          <div className="stat-value">{counts.active_policies}</div>
          <div className="stat-label">Active Policies</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-value">{counts.pending_claims}</div>
          <div className="stat-label">Pending Claims</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹{Number(total_revenue).toLocaleString()}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
      </div>

      {/* Charts */}
      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>📈 Policies by Plan Type</h3>
          <Bar data={planChartData} options={barOptions} />
        </div>
        <div className="chart-card">
          <h3>🔄 Claims by Status</h3>
          <Doughnut data={claimChartData} options={doughnutOptions} />
        </div>
      </div>

      {/* Top Agents */}
      <div className="dashboard-section">
        <h3>🏆 Top Agents by Commission Earned</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th><th>Agent</th><th>Commission %</th>
                <th>Policies Sold</th><th>Total Commission (₹)</th>
              </tr>
            </thead>
            <tbody>
              {top_agents.map((a, i) => (
                <tr key={a.agent_id}>
                  <td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`}</td>
                  <td>{a.name}</td>
                  <td>{a.commission_pct}%</td>
                  <td>{a.policies_sold}</td>
                  <td>₹{Number(a.total_commission).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Claims */}
      <div className="dashboard-section">
        <h3>🕒 Recent Claims</h3>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Customer</th><th>Plan</th>
                <th>Amount (₹)</th><th>Date</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent_claims.map(cl => (
                <tr key={cl.claim_id}>
                  <td>{cl.claim_id}</td>
                  <td>{cl.customer_name}</td>
                  <td>{cl.plan_name}</td>
                  <td>₹{Number(cl.claim_amount).toLocaleString()}</td>
                  <td>{cl.claim_date?.slice(0, 10)}</td>
                  <td><span className={`badge badge-${cl.status.toLowerCase()}`}>{cl.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
