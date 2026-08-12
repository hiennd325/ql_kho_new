const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) {
        console.error('Could not connect to database:', err.message);
        process.exit(1);
    }
});

const tables = [
    'audits',
    'sales_order_items',
    'sales_orders',
    'transfers',
    'inventory_transactions',
    'inventory',
    'products',
    'suppliers',
    'warehouses',
    'users'
];

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

async function main() {
    // enable FK + disable safe mode for truncate
    await run('PRAGMA foreign_keys = OFF');

    for (const t of tables) {
        const info = await run(`DELETE FROM ${t}`);
        console.log(`Cleared ${t} (${info.changes} rows)`);
        await run(`DELETE FROM sqlite_sequence WHERE name = ?`, [t]);
    }

    const hashed = await bcrypt.hash('Duchien@12', 10);
    const info = await run(
        `INSERT INTO users (username, email, password, role, status) VALUES (?, ?, ?, ?, ?)`,
        ['hiennd325', null, hashed, 'admin', 'active']
    );
    console.log('Admin created: hiennd325 (id ' + info.lastID + ', role admin)');

    await run('PRAGMA foreign_keys = ON');
    db.close();
    console.log('Done.');
}

main().catch((err) => {
    console.error('FAILED:', err.message);
    db.close();
    process.exit(1);
});
