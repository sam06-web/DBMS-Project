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

// Setup Database Endpoint (Temporary for Railway deployment)
app.get('/api/setup-database', async (req, res) => {
  try {
    const fs = require('fs');
    const path = require('path');
    
    const executeNormalSql = async (conn, sql) => {
        const statements = sql.split(';');
        for (let stmt of statements) {
            if (stmt.trim()) {
                await conn.query(stmt.trim());
            }
        }
    };

    const executeSqlFile = async (conn, filename) => {
        const sqlPath = path.join(__dirname, '../database', filename);
        let sql = fs.readFileSync(sqlPath, 'utf8');
        sql = sql.replace(/--.*$/gm, ''); // remove comments
        sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');
        
        if (sql.includes('DELIMITER $$')) {
            const parts = sql.split('DELIMITER $$');
            if (parts[0].trim()) await executeNormalSql(conn, parts[0]);
            for (let i = 1; i < parts.length; i++) {
                const block = parts[i];
                const endIdx = block.indexOf('DELIMITER ;');
                if (endIdx !== -1) {
                    let procSql = block.substring(0, endIdx).trim();
                    procSql = procSql.replace(/\$\$/g, ''); // Fix: Remove $$ from the end of the query
                    if (procSql) await conn.query(procSql);
                    const remaining = block.substring(endIdx + 'DELIMITER ;'.length).trim();
                    if (remaining) await executeNormalSql(conn, remaining);
                } else {
                    let procSql = block.trim();
                    procSql = procSql.replace(/\$\$/g, '');
                    if (procSql) await conn.query(procSql);
                }
            }
        } else {
            await executeNormalSql(conn, sql);
        }
    };

    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'Sam@975045',
        database: process.env.DB_NAME || 'insurance_db',
        port: Number(process.env.DB_PORT || 3306),
        multipleStatements: true
    });

    // Drop existing tables to ensure a clean slate
    await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
    await conn.query('DROP TABLE IF EXISTS Claim, Payment, Nominee, Policy, Agent, Insurance_Plan, Customer;');
    await conn.query('DROP VIEW IF EXISTS Policy_Details_View;');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

    await executeSqlFile(conn, 'schema.sql');
    await executeSqlFile(conn, 'procedures.sql');
    await executeSqlFile(conn, 'seed.sql');
    await conn.end();

    res.send('<h1>Database setup successful!</h1><p>Tables, procedures, and sample data have been created.</p><p><a href="/">Go to App</a></p>');
  } catch (err) {
    res.status(500).send(`<h1>Setup Failed</h1><pre>${err.stack}</pre>`);
  }
});

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
