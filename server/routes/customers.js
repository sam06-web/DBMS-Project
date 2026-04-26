const router = require('express').Router();

// GET all customers (supports ?search=)
router.get('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { search } = req.query;
    let query = 'SELECT * FROM Customer';
    let params = [];
    if (search) {
      query += ' WHERE name LIKE ? OR email LIKE ? OR phone LIKE ?';
      const term = `%${search}%`;
      params = [term, term, term];
    }
    query += ' ORDER BY customer_id DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET customer by ID
router.get('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [rows] = await pool.query('SELECT * FROM Customer WHERE customer_id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create customer
router.post('/', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { name, age, gender, phone, email, address } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Customer (name, age, gender, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)',
      [name, age, gender, phone, email, address]
    );
    res.status(201).json({ customer_id: result.insertId, message: 'Customer created' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const { name, age, gender, phone, email, address } = req.body;
    const [result] = await pool.query(
      'UPDATE Customer SET name=?, age=?, gender=?, phone=?, email=?, address=? WHERE customer_id=?',
      [name, age, gender, phone, email, address, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    const pool = req.app.locals.pool;
    const [result] = await pool.query('DELETE FROM Customer WHERE customer_id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
