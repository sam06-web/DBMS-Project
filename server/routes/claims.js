const router = require('express').Router();

// GET all claims (with optional status filter)
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    let query = `
      SELECT cl.*, c.name AS customer_name, ip.plan_name
      FROM Claim cl
      JOIN Policy p ON cl.policy_id = p.policy_id
      JOIN Customer c ON p.customer_id = c.customer_id
      JOIN Insurance_Plan ip ON p.plan_id = ip.plan_id
    `;
    const params = [];
    if (req.query.status) {
      query += ' WHERE cl.status = ?';
      params.push(req.query.status);
    }
    query += ' ORDER BY cl.claim_id DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET claim by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rows] = await pool.query('SELECT * FROM Claim WHERE claim_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Claim not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create claim
router.post('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { policy_id, claim_amount, claim_date, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Claim (policy_id, claim_amount, claim_date, status) VALUES (?, ?, ?, ?)',
      [policy_id, claim_amount, claim_date, status || 'Pending']
    );
    res.status(201).json({ claim_id: result.insertId, message: 'Claim raised' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update claim
router.put('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { policy_id, claim_amount, claim_date, status } = req.body;
    const [result] = await pool.query(
      'UPDATE Claim SET policy_id=?, claim_amount=?, claim_date=?, status=? WHERE claim_id=?',
      [policy_id, claim_amount, claim_date, status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Claim not found' });
    res.json({ message: 'Claim updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE claim
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [result] = await pool.query('DELETE FROM Claim WHERE claim_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Claim not found' });
    res.json({ message: 'Claim deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
