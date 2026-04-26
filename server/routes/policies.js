const router = require('express').Router();

// GET policy details (using VIEW - multi-table JOIN)
router.get('/details', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rows] = await pool.query('SELECT * FROM Policy_Details_View ORDER BY policy_id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET total payment for a policy (aggregate)
router.get('/:id/payments/total', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rows] = await pool.query(
      'SELECT policy_id, COUNT(*) AS total_payments, SUM(amount) AS total_amount FROM Payment WHERE policy_id = ? GROUP BY policy_id',
      [req.params.id]
    );
    if (rows.length === 0) return res.json({ policy_id: req.params.id, total_payments: 0, total_amount: 0 });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all policies (supports ?status=)
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { status } = req.query;
    let query = `
      SELECT p.*, c.name AS customer_name, ip.plan_name, a.name AS agent_name
      FROM Policy p
      JOIN Customer c ON p.customer_id = c.customer_id
      JOIN Insurance_Plan ip ON p.plan_id = ip.plan_id
      JOIN Agent a ON p.agent_id = a.agent_id
    `;
    let params = [];
    if (status) {
      query += ' WHERE p.status = ?';
      params = [status];
    }
    query += ' ORDER BY p.policy_id DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET policy by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS customer_name, ip.plan_name, a.name AS agent_name
       FROM Policy p
       JOIN Customer c ON p.customer_id = c.customer_id
       JOIN Insurance_Plan ip ON p.plan_id = ip.plan_id
       JOIN Agent a ON p.agent_id = a.agent_id
       WHERE p.policy_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Policy not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create policy
router.post('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { customer_id, plan_id, agent_id, start_date, end_date, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Policy (customer_id, plan_id, agent_id, start_date, end_date, status) VALUES (?, ?, ?, ?, ?, ?)',
      [customer_id, plan_id, agent_id, start_date, end_date || null, status || 'Active']
    );
    res.status(201).json({ policy_id: result.insertId, message: 'Policy created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update policy
router.put('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { customer_id, plan_id, agent_id, start_date, end_date, status } = req.body;
    const [result] = await pool.query(
      'UPDATE Policy SET customer_id=?, plan_id=?, agent_id=?, start_date=?, end_date=?, status=? WHERE policy_id=?',
      [customer_id, plan_id, agent_id, start_date, end_date, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Policy not found' });
    res.json({ message: 'Policy updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE policy
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [result] = await pool.query('DELETE FROM Policy WHERE policy_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Policy not found' });
    res.json({ message: 'Policy deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
