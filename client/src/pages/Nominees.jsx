import { useState, useEffect } from 'react'

const API = '/api/nominees'

export default function Nominees() {
  const [rows, setRows] = useState([])
  const [policies, setPolicies] = useState([])
  const [msg, setMsg] = useState(null)
  const [form, setForm] = useState({ policy_id: '', name: '', relation: '' })

  const load = async () => {
    try {
      const [nRes, pRes] = await Promise.all([fetch(API), fetch('/api/policies')])
      setRows(await nRes.json())
      setPolicies(await pRes.json())
    } catch { setMsg({ type: 'error', text: 'Failed to load' }) }
  }
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg({ type: 'success', text: 'Nominee added!' })
      setForm({ policy_id: '', name: '', relation: '' })
      load()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this nominee?')) return
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' })
      setMsg({ type: 'success', text: 'Nominee deleted' })
      load()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  return (
    <div className="page">
      <h2>👤 Nominees</h2>
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
            <label>Nominee Name</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Relation</label>
            <input required placeholder="e.g. Wife, Son, Father" value={form.relation} onChange={e => setForm({...form, relation: e.target.value})} />
          </div>
        </div>
        <div className="btn-row"><button type="submit" className="btn btn-primary">Add Nominee</button></div>
      </form>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Policy #</th><th>Customer</th><th>Plan</th><th>Nominee Name</th><th>Relation</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.nominee_id}>
                <td>{r.nominee_id}</td><td>{r.policy_id}</td><td>{r.customer_name}</td><td>{r.plan_name}</td>
                <td>{r.name}</td><td>{r.relation}</td>
                <td><button className="btn btn-danger" onClick={() => handleDelete(r.nominee_id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
