import { useState, useEffect } from 'react'

const API = '/api/agents'

export default function Agents() {
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', phone: '', commission: '5.00' })

  const load = async (q = '') => {
    try {
      const url = q ? `${API}?search=${encodeURIComponent(q)}` : API
      const res = await fetch(url)
      setRows(await res.json())
    } catch { setMsg({ type: 'error', text: 'Failed to load agents' }) }
  }
  useEffect(() => { load(search) }, [search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, commission: Number(form.commission) })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg({ type: 'success', text: 'Agent added!' })
      setForm({ name: '', phone: '', commission: '5.00' })
      load(search)
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this agent?')) return
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' })
      setMsg({ type: 'success', text: 'Agent deleted' })
      load(search)
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  return (
    <div className="page">
      <h2>🧑‍💼 Agents</h2>
      {msg && <div className={`msg msg-${msg.type}`}>{msg.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Name</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Commission (%)</label>
            <input type="number" step="0.01" required value={form.commission} onChange={e => setForm({...form, commission: e.target.value})} />
          </div>
        </div>
        <div className="btn-row"><button type="submit" className="btn btn-primary">Add Agent</button></div>
      </form>
      <div className="filter-row">
        <label>🔍 Search:</label>
        <input className="search-input" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Phone</th><th>Commission (%)</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.agent_id}>
                <td>{r.agent_id}</td><td>{r.name}</td><td>{r.phone}</td><td>{r.commission}</td>
                <td><button className="btn btn-danger" onClick={() => handleDelete(r.agent_id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
