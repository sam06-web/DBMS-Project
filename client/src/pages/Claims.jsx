import { useState, useEffect } from 'react'

const API = '/api/claims'

export default function Claims() {
  const [rows, setRows] = useState([])
  const [policies, setPolicies] = useState([])
  const [msg, setMsg] = useState(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [form, setForm] = useState({ policy_id: '', claim_amount: '', claim_date: '', status: 'Pending' })

  const load = async (filter) => {
    try {
      const url = filter ? `${API}?status=${filter}` : API
      const [clRes, pRes] = await Promise.all([fetch(url), fetch('/api/policies')])
      setRows(await clRes.json())
      setPolicies(await pRes.json())
    } catch { setMsg({ type: 'error', text: 'Failed to load' }) }
  }
  useEffect(() => { load(statusFilter) }, [statusFilter])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, claim_amount: Number(form.claim_amount) })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg({ type: 'success', text: 'Claim raised!' })
      setForm({ policy_id: '', claim_amount: '', claim_date: '', status: 'Pending' })
      load(statusFilter)
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this claim?')) return
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' })
      setMsg({ type: 'success', text: 'Claim deleted' })
      load(statusFilter)
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const statusBadge = (s) => <span className={`badge badge-${s.toLowerCase()}`}>{s}</span>

  return (
    <div className="page">
      <h2>📝 Claims</h2>
      {msg && <div className={`msg msg-${msg.type}`}>{msg.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Policy</label>
            <select required value={form.policy_id} onChange={e => setForm({...form, policy_id: e.target.value})}>
              <option value="">-- Select Policy --</option>
              {policies.map(p => <option key={p.policy_id} value={p.policy_id}>#{p.policy_id} - {p.customer_name} ({p.plan_name})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Claim Amount (₹)</label>
            <input type="number" required value={form.claim_amount} onChange={e => setForm({...form, claim_amount: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Claim Date</label>
            <input type="date" required value={form.claim_date} onChange={e => setForm({...form, claim_date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
              <option>Pending</option><option>Approved</option><option>Rejected</option>
            </select>
          </div>
        </div>
        <div className="btn-row"><button type="submit" className="btn btn-primary">Raise Claim</button></div>
      </form>

      <div className="filter-row">
        <label><strong>Filter by Status:</strong></label>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Policy #</th><th>Customer</th><th>Plan</th><th>Amount (₹)</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.claim_id}>
                <td>{r.claim_id}</td><td>{r.policy_id}</td><td>{r.customer_name}</td><td>{r.plan_name}</td>
                <td>{Number(r.claim_amount).toLocaleString()}</td><td>{r.claim_date?.slice(0,10)}</td>
                <td>{statusBadge(r.status)}</td>
                <td><button className="btn btn-danger" onClick={() => handleDelete(r.claim_id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
