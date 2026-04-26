import { useState, useEffect } from 'react'

const API = '/api/policies'

export default function Policies() {
  const [rows, setRows] = useState([])
  const [details, setDetails] = useState([])
  const [showDetails, setShowDetails] = useState(false)
  const [customers, setCustomers] = useState([])
  const [plans, setPlans] = useState([])
  const [agents, setAgents] = useState([])
  const [msg, setMsg] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [form, setForm] = useState({ customer_id: '', plan_id: '', agent_id: '', start_date: '', end_date: '' })

  const load = async (filter = '') => {
    try {
      const url = filter ? `${API}?status=${filter}` : API
      const [pRes, cRes, plRes, aRes] = await Promise.all([
        fetch(url), fetch('/api/customers'), fetch('/api/plans'), fetch('/api/agents')
      ])
      setRows(await pRes.json())
      setCustomers(await cRes.json())
      setPlans(await plRes.json())
      setAgents(await aRes.json())
    } catch { setMsg({ type: 'error', text: 'Failed to load data' }) }
  }
  useEffect(() => { load(statusFilter) }, [statusFilter])

  const loadDetails = async () => {
    try {
      const res = await fetch(`${API}/details`)
      setDetails(await res.json())
      setShowDetails(true)
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg({ type: 'success', text: 'Policy created!' })
      setForm({ customer_id: '', plan_id: '', agent_id: '', start_date: '', end_date: '' })
      load(statusFilter)
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this policy? Associated payments, claims, and nominees will also be deleted.')) return
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' })
      setMsg({ type: 'success', text: 'Policy deleted' })
      load(statusFilter)
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const statusBadge = (s) => <span className={`badge badge-${s.toLowerCase()}`}>{s}</span>

  return (
    <div className="page">
      <h2>📄 Policies</h2>
      {msg && <div className={`msg msg-${msg.type}`}>{msg.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Customer</label>
            <select required value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})}>
              <option value="">-- Select --</option>
              {customers.map(c => <option key={c.customer_id} value={c.customer_id}>{c.name} (#{c.customer_id})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Plan</label>
            <select required value={form.plan_id} onChange={e => setForm({...form, plan_id: e.target.value})}>
              <option value="">-- Select --</option>
              {plans.map(p => <option key={p.plan_id} value={p.plan_id}>{p.plan_name} ({p.plan_type})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Agent</label>
            <select required value={form.agent_id} onChange={e => setForm({...form, agent_id: e.target.value})}>
              <option value="">-- Select --</option>
              {agents.map(a => <option key={a.agent_id} value={a.agent_id}>{a.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input type="date" required value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>End Date (auto if blank)</label>
            <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} />
          </div>
        </div>
        <div className="btn-row">
          <button type="submit" className="btn btn-primary">Create Policy</button>
          <button type="button" className="btn btn-success" onClick={loadDetails}>
            View Policy Details (JOIN View)
          </button>
        </div>
      </form>

      <div className="filter-row">
        <label>🔍 Filter by Status:</label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      {showDetails && (
        <>
          <h2 style={{marginTop:20}}>📋 Policy Details View (Multi-table JOIN)</h2>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead><tr><th>Policy</th><th>Customer</th><th>Plan</th><th>Type</th><th>Coverage</th><th>Agent</th><th>Start</th><th>End</th><th>Status</th><th>Nominee</th><th>Relation</th></tr></thead>
              <tbody>
                {details.map((r,i) => (
                  <tr key={i}>
                    <td>{r.policy_id}</td><td>{r.customer_name}</td><td>{r.plan_name}</td><td>{r.plan_type}</td>
                    <td>{Number(r.coverage_amount).toLocaleString()}</td><td>{r.agent_name}</td>
                    <td>{r.start_date?.slice(0,10)}</td><td>{r.end_date?.slice(0,10)}</td>
                    <td>{statusBadge(r.policy_status)}</td>
                    <td>{r.nominee_name || '-'}</td><td>{r.nominee_relation || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h2 style={{marginTop:20}}>All Policies</h2>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Customer</th><th>Plan</th><th>Agent</th><th>Start</th><th>End</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.policy_id}>
                <td>{r.policy_id}</td><td>{r.customer_name}</td><td>{r.plan_name}</td><td>{r.agent_name}</td>
                <td>{r.start_date?.slice(0,10)}</td><td>{r.end_date?.slice(0,10)}</td>
                <td>{statusBadge(r.status)}</td>
                <td><button className="btn btn-danger" onClick={() => handleDelete(r.policy_id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
