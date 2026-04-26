import { useState, useEffect } from 'react'

const API = '/api/payments'

export default function Payments() {
  const [rows, setRows] = useState([])
  const [policies, setPolicies] = useState([])
  const [msg, setMsg] = useState(null)
  const [form, setForm] = useState({ policy_id: '', amount: '', payment_date: '', payment_mode: 'Cash' })

  const load = async () => {
    try {
      const [payRes, pRes] = await Promise.all([fetch(API), fetch('/api/policies')])
      setRows(await payRes.json())
      setPolicies(await pRes.json())
    } catch { setMsg({ type: 'error', text: 'Failed to load' }) }
  }
  useEffect(() => { load() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch(API, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount) })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setMsg({ type: 'success', text: 'Payment recorded!' })
      setForm({ policy_id: '', amount: '', payment_date: '', payment_mode: 'Cash' })
      load()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this payment?')) return
    try {
      await fetch(`${API}/${id}`, { method: 'DELETE' })
      setMsg({ type: 'success', text: 'Payment deleted' })
      load()
    } catch (err) { setMsg({ type: 'error', text: err.message }) }
  }

  return (
    <div className="page">
      <h2>💳 Payments</h2>
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
            <label>Amount (₹)</label>
            <input type="number" required value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Payment Date</label>
            <input type="date" required value={form.payment_date} onChange={e => setForm({...form, payment_date: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Payment Mode</label>
            <select value={form.payment_mode} onChange={e => setForm({...form, payment_mode: e.target.value})}>
              <option>Cash</option><option>Credit Card</option><option>Debit Card</option><option>UPI</option><option>Net Banking</option>
            </select>
          </div>
        </div>
        <div className="btn-row"><button type="submit" className="btn btn-primary">Record Payment</button></div>
      </form>
      <div className="data-table-wrapper">
        <table className="data-table">
          <thead><tr><th>ID</th><th>Policy #</th><th>Customer</th><th>Plan</th><th>Amount (₹)</th><th>Date</th><th>Mode</th><th></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.payment_id}>
                <td>{r.payment_id}</td><td>{r.policy_id}</td><td>{r.customer_name}</td><td>{r.plan_name}</td>
                <td>{Number(r.amount).toLocaleString()}</td><td>{r.payment_date?.slice(0,10)}</td><td>{r.payment_mode}</td>
                <td><button className="btn btn-danger" onClick={() => handleDelete(r.payment_id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
