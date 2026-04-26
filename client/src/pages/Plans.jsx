import { useState, useEffect } from 'react'

const API = '/api/plans'

export default function Plans() {
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState(null)
  const [form, setForm] = useState({ plan_name: '', plan_type: 'Life', coverage_amount: '', premium: '', duration: '' })

  const load = async () => {
    try {
      const res = await fetch(API)
      setRows(await res.json())
    } catch { setMsg({ type: 'error', text: 'Failed to load plans' }) }
  }
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, coverage_amount: Number(form.coverage_amount), premium: Number(form.premium), duration: Number(form.duration) })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg({ type: 'success', text: 'Plan added!' })
      setForm({ plan_name: '', plan_type: 'Life', coverage_amount: '', premium: '', duration: '' })
      load()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this plan?')) return
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' })
      setMsg({ type: 'success', text: 'Plan deleted' })
      load()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  return (
    <div className="page">
      <h2>📋 Insurance Plans</h2>
      {msg && <div className={`msg msg-${msg.type}`}>{msg.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Plan Name</label>
            <input required value={form.plan_name} onChange={e => setForm({...form, plan_name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Plan Type</label>
            <select value={form.plan_type} onChange={e => setForm({...form, plan_type: e.target.value})}>
              <option>Life</option><option>Health</option><option>Vehicle</option><option>Property</option><option>Travel</option>
            </select>
          </div>
          <div className="form-group">
            <label>Coverage Amount (₹)</label>
            <input type="number" required value={form.coverage_amount} onChange={e => setForm({...form, coverage_amount: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Premium (₹)</label>
            <input type="number" required value={form.premium} onChange={e => setForm({...form, premium: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Duration (months)</label>
            <input type="number" required value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} />
          </div>
        </div>
        <div className="btn-row"><button type="submit" className="btn btn-primary">Add Plan</button></div>
      </form>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Plan Name</th><th>Type</th><th>Coverage (₹)</th><th>Premium (₹)</th><th>Duration (mo)</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.plan_id}>
                <td>{r.plan_id}</td><td>{r.plan_name}</td><td>{r.plan_type}</td>
                <td>{Number(r.coverage_amount).toLocaleString()}</td>
                <td>{Number(r.premium).toLocaleString()}</td><td>{r.duration}</td>
                <td><button className="btn btn-danger" onClick={() => handleDelete(r.plan_id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
