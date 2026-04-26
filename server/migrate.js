const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const connectionUri = 'mysql://root:yFxNmRIgPUVlzpGqgkzVwhjfrmgwVebP@shuttle.proxy.rlwy.net:36561/railway';

async function executeSqlFile(conn, filename) {
    console.log(`Executing ${filename}...`);
    const sqlPath = path.join(__dirname, '../database', filename);
    let sql = fs.readFileSync(sqlPath, 'utf8');

    // Remove comments
    sql = sql.replace(/--.*$/gm, '');
    sql = sql.replace(/\/\*[\s\S]*?\*\//g, '');

    // Split by DELIMITER $$ if it exists
    if (sql.includes('DELIMITER $$')) {
        const parts = sql.split('DELIMITER $$');
        // parts[0] is normal SQL
        if (parts[0].trim()) {
            await executeNormalSql(conn, parts[0]);
        }
        for (let i = 1; i < parts.length; i++) {
            const block = parts[i];
            const endIdx = block.indexOf('DELIMITER ;');
            if (endIdx !== -1) {
                const procSql = block.substring(0, endIdx).trim();
                if (procSql) {
                    console.log('Executing procedure/trigger...');
                    await conn.query(procSql);
                }
                const remaining = block.substring(endIdx + 'DELIMITER ;'.length).trim();
                if (remaining) {
                    await executeNormalSql(conn, remaining);
                }
            } else {
                console.log('Executing procedure/trigger (no end delimiter found)...');
                await conn.query(block.trim());
            }
        }
    } else {
        await executeNormalSql(conn, sql);
    }
}

async function executeNormalSql(conn, sql) {
    const statements = sql.split(';');
    for (let stmt of statements) {
        if (stmt.trim()) {
            try {
                await conn.query(stmt.trim());
            } catch (err) {
                console.error(`Error executing statement: ${stmt.substring(0, 50)}...`, err.message);
            }
        }
    }
}

async function run() {
    let conn;
    try {
        console.log("Connecting to the database...");
        conn = await mysql.createConnection(connectionUri);
        console.log("Connected successfully!");

        await executeSqlFile(conn, 'schema.sql');
        await executeSqlFile(conn, 'procedures.sql');
        await executeSqlFile(conn, 'seed.sql');

        console.log("All migrations completed successfully!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        if (conn) {
            await conn.end();
        }
    }
}

run();
