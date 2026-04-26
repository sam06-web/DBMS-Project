const router = require('express').Router();

// GET all payments
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rows] = await pool.query(`
      SELECT pay.*, c.name AS customer_name, ip.plan_name
      FROM Payment pay
      JOIN Policy p ON pay.policy_id = p.policy_id
      JOIN Customer c ON p.customer_id = c.customer_id
      JOIN Insurance_Plan ip ON p.plan_id = ip.plan_id
      ORDER BY pay.payment_id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET payment by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rows] = await pool.query('SELECT * FROM Payment WHERE payment_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create payment
router.post('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { policy_id, amount, payment_date, payment_mode } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Payment (policy_id, amount, payment_date, payment_mode) VALUES (?, ?, ?, ?)',
      [policy_id, amount, payment_date, payment_mode || 'Cash']
    );
    res.status(201).json({ payment_id: result.insertId, message: 'Payment recorded' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update payment
router.put('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { policy_id, amount, payment_date, payment_mode } = req.body;
    const [result] = await pool.query(
      'UPDATE Payment SET policy_id=?, amount=?, payment_date=?, payment_mode=? WHERE payment_id=?',
      [policy_id, amount, payment_date, payment_mode, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE payment
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [result] = await pool.query('DELETE FROM Payment WHERE payment_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
