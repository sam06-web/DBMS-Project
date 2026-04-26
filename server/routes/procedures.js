const router = require('express').Router();

// POST /api/procedures/register-policy — calls RegisterNewPolicy stored procedure
router.post('/register-policy', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { customer_id, plan_id, agent_id, start_date, payment_mode } = req.body;
    const [rows] = await pool.query(
      'CALL RegisterNewPolicy(?, ?, ?, ?, ?)',
      [customer_id, plan_id, agent_id, start_date, payment_mode || 'Cash']
    );
    // Result is in the first result set
    res.status(201).json(rows[0][0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/procedures/process-claim — calls ProcessClaim stored procedure
router.put('/process-claim', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { claim_id, new_status } = req.body;
    const [rows] = await pool.query(
      'CALL ProcessClaim(?, ?)',
      [claim_id, new_status]
    );
    res.json(rows[0][0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/procedures/customer-summary/:id — calls GetCustomerSummary
router.get('/customer-summary/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rows] = await pool.query('CALL GetCustomerSummary(?)', [req.params.id]);
    if (rows[0].length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0][0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/procedures/expired-cursor — calls DemoExpiredPolicyCursor
router.get('/expired-cursor', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rows] = await pool.query('CALL DemoExpiredPolicyCursor()');
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
