import { useState, useEffect } from 'react'

const API = '/api/customers'

export default function Customers() {
  const [rows, setRows] = useState([])
  const [msg, setMsg] = useState(null)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState({ name: '', age: '', gender: 'Male', phone: '', email: '', address: '' })

  const load = async (q = '') => {
    try {
      const url = q ? `${API}?search=${encodeURIComponent(q)}` : API
      const res = await fetch(url)
      setRows(await res.json())
    } catch { setMsg({ type: 'error', text: 'Failed to load customers' }) }
  }
  useEffect(() => { load(search) }, [search])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, age: Number(form.age) }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg({ type: 'success', text: 'Customer added!' })
      setForm({ name: '', age: '', gender: 'Male', phone: '', email: '', address: '' })
      load(search)
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this customer?')) return
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' })
      setMsg({ type: 'success', text: 'Customer deleted' })
      load(search)
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  return (
    <div className="page">
      <h2>👥 Customers</h2>
      {msg && <div className={`msg msg-${msg.type}`}>{msg.text}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label>Name</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Age</label>
            <input type="number" required min="18" value={form.age} onChange={e => setForm({...form, age: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Gender</label>
            <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <input required value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </div>
        </div>
        <div className="btn-row"><button type="submit" className="btn btn-primary">Add Customer</button></div>
      </form>
      <div className="filter-row">
        <label>🔍 Search:</label>
        <input className="search-input" placeholder="Search by name, email, or phone..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Phone</th><th>Email</th><th>Address</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.customer_id}>
                <td>{r.customer_id}</td><td>{r.name}</td><td>{r.age}</td><td>{r.gender}</td>
                <td>{r.phone}</td><td>{r.email}</td><td>{r.address}</td>
                <td><button className="btn btn-danger" onClick={() => handleDelete(r.customer_id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

