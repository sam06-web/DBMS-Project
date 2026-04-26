const router = require('express').Router();

// GET all plans
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rows] = await pool.query('SELECT * FROM Insurance_Plan ORDER BY plan_id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET plan by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rows] = await pool.query('SELECT * FROM Insurance_Plan WHERE plan_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create plan
router.post('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { plan_name, plan_type, coverage_amount, premium, duration } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Insurance_Plan (plan_name, plan_type, coverage_amount, premium, duration) VALUES (?, ?, ?, ?, ?)',
      [plan_name, plan_type, coverage_amount, premium, duration]
    );
    res.status(201).json({ plan_id: result.insertId, message: 'Plan created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update plan
router.put('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { plan_name, plan_type, coverage_amount, premium, duration } = req.body;
    const [result] = await pool.query(
      'UPDATE Insurance_Plan SET plan_name=?, plan_type=?, coverage_amount=?, premium=?, duration=? WHERE plan_id=?',
      [plan_name, plan_type, coverage_amount, premium, duration, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE plan
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [result] = await pool.query('DELETE FROM Insurance_Plan WHERE plan_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
