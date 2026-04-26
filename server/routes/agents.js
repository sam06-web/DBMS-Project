const router = require('express').Router();

// GET all agents (supports ?search=)
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { search } = req.query;
    let query = 'SELECT * FROM Agent';
    let params = [];
    if (search) {
      query += ' WHERE name LIKE ? OR phone LIKE ?';
      const term = `%${search}%`;
      params = [term, term];
    }
    query += ' ORDER BY agent_id DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET agent by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rows] = await pool.query('SELECT * FROM Agent WHERE agent_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Agent not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create agent
router.post('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { name, phone, commission } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Agent (name, phone, commission) VALUES (?, ?, ?)',
      [name, phone, commission || 5.00]
    );
    res.status(201).json({ agent_id: result.insertId, message: 'Agent created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update agent
router.put('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { name, phone, commission } = req.body;
    const [result] = await pool.query(
      'UPDATE Agent SET name=?, phone=?, commission=? WHERE agent_id=?',
      [name, phone, commission, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Agent not found' });
    res.json({ message: 'Agent updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE agent
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [result] = await pool.query('DELETE FROM Agent WHERE agent_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Agent not found' });
    res.json({ message: 'Agent deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
