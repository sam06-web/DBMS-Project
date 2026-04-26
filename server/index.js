const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve React build when available
const clientBuildPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientBuildPath));

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Sam@975045',
  database: process.env.DB_NAME || 'insurance_db',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Make pool available to routes
app.locals.pool = pool;

// Routes
app.use('/api/customers', require('./routes/customers'));
app.use('/api/plans',     require('./routes/plans'));
app.use('/api/agents',    require('./routes/agents'));
app.use('/api/policies',  require('./routes/policies'));
app.use('/api/nominees',  require('./routes/nominees'));
app.use('/api/payments',  require('./routes/payments'));
app.use('/api/claims',      require('./routes/claims'));
app.use('/api/dashboard',   require('./routes/dashboard'));
app.use('/api/procedures',  require('./routes/procedures'));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// Serve SPA fallback for non-API routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).send('Not found');
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
