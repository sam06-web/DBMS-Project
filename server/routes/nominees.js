const router = require('express').Router();

// GET all nominees
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rows] = await pool.query(`
      SELECT n.*, c.name AS customer_name, ip.plan_name
      FROM Nominee n
      JOIN Policy p ON n.policy_id = p.policy_id
      JOIN Customer c ON p.customer_id = c.customer_id
      JOIN Insurance_Plan ip ON p.plan_id = ip.plan_id
      ORDER BY n.nominee_id DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET nominee by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rows] = await pool.query('SELECT * FROM Nominee WHERE nominee_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Nominee not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create nominee
router.post('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { policy_id, name, relation } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Nominee (policy_id, name, relation) VALUES (?, ?, ?)',
      [policy_id, name, relation]
    );
    res.status(201).json({ nominee_id: result.insertId, message: 'Nominee created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update nominee
router.put('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { policy_id, name, relation } = req.body;
    const [result] = await pool.query(
      'UPDATE Nominee SET policy_id=?, name=?, relation=? WHERE nominee_id=?',
      [policy_id, name, relation, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Nominee not found' });
    res.json({ message: 'Nominee updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE nominee
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [result] = await pool.query('DELETE FROM Nominee WHERE nominee_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Nominee not found' });
    res.json({ message: 'Nominee deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
