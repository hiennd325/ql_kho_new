const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath);

const TWO_YEARS_DAYS = 730;

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

async function runRun(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve(this);
        });
    });
}

async function simulate() {
    console.log("Starting simulation...");
    
    // Check if we need to seed initial master data
    let suppliers = await runQuery('SELECT * FROM suppliers');
    if (suppliers.length === 0) {
        console.log("Seeding suppliers...");
        await runRun(`INSERT INTO suppliers (code, name, contact_person, phone) VALUES 
            ('SUP001', 'Supplier One', 'Alice', '0123456789'),
            ('SUP002', 'Supplier Two', 'Bob', '0987654321')`);
        suppliers = await runQuery('SELECT * FROM suppliers');
    }

    let warehouses = await runQuery('SELECT * FROM warehouses');
    if (warehouses.length === 0) {
        console.log("Seeding warehouses...");
        await runRun(`INSERT INTO warehouses (custom_id, name, location, capacity, current_usage) VALUES 
            ('WH001', 'Main Warehouse', 'Hanoi', 10000, 0),
            ('WH002', 'Secondary Warehouse', 'HCMC', 5000, 0)`);
        warehouses = await runQuery('SELECT * FROM warehouses');
    }

    let products = await runQuery('SELECT * FROM products');
    if (products.length === 0) {
        console.log("Seeding products...");
        const supplierId = suppliers[0].id;
        await runRun(`INSERT INTO products (custom_id, name, price, category, supplier_id) VALUES 
            ('PRD001', 'Laptop Dell', 1500, 'Electronics', ?),
            ('PRD002', 'Mouse Logitech', 50, 'Electronics', ?),
            ('PRD003', 'Keyboard Mechanical', 100, 'Electronics', ?),
            ('PRD004', 'Monitor LG', 300, 'Electronics', ?)`, [supplierId, supplierId, supplierId, supplierId]);
        products = await runQuery('SELECT * FROM products');
    }

    // Clear old transactions
    console.log("Clearing old transactions and inventory...");
    await runRun('DELETE FROM inventory_transactions');
    await runRun('DELETE FROM inventory');
    await runRun('UPDATE warehouses SET current_usage = 0');
    await runRun('DELETE FROM transfer_items');
    await runRun('DELETE FROM transfers');

    console.log("Generating transactions for the past 2 years...");
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - TWO_YEARS_DAYS);

    // Keep track of inventory locally to ensure we don't export more than we have
    // inventory[warehouse_id][product_id] = quantity
    const inventory = {};
    warehouses.forEach(w => inventory[w.custom_id] = {});

    let numTransactions = 500; // Total transactions to generate
    
    // Let's generate a list of random dates and sort them
    let transactionDates = [];
    for(let i=0; i<numTransactions; i++) {
        transactionDates.push(randomDate(startDate, endDate));
    }
    transactionDates.sort((a, b) => a - b);

    await runRun('BEGIN TRANSACTION');
    for (let i = 0; i < numTransactions; i++) {
        let tDateStr = transactionDates[i].toISOString().replace('T', ' ').substring(0, 19);
        
        let product = products[randomInt(0, products.length - 1)];
        let warehouse = warehouses[randomInt(0, warehouses.length - 1)];
        let type = Math.random() > 0.4 ? 'nhap' : 'xuat'; // 60% nhap, 40% xuat to build up inventory
        
        if (!inventory[warehouse.custom_id][product.custom_id]) {
            inventory[warehouse.custom_id][product.custom_id] = 0;
        }

        let currentQty = inventory[warehouse.custom_id][product.custom_id];
        
        let qty = randomInt(5, 50);
        
        if (type === 'xuat' && currentQty < qty) {
            // Not enough to export, force it to be an import to build inventory
            type = 'nhap';
        }

        let supplierId = null;
        let customerName = null;
        if (type === 'nhap') {
            supplierId = suppliers[randomInt(0, suppliers.length - 1)].id;
        } else {
            customerName = "Customer " + randomInt(1, 50);
        }

        // Insert transaction
        await runRun(`INSERT INTO inventory_transactions 
            (product_id, warehouse_id, quantity, type, supplier_id, customer_name, reference_id, notes, transaction_date) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
            [product.custom_id, warehouse.custom_id, qty, type, supplierId, customerName, 'REF' + randomInt(1000, 9999), 'Simulated data', tDateStr]);

        // Update local inventory state
        if (type === 'nhap') {
            inventory[warehouse.custom_id][product.custom_id] += qty;
        } else {
            inventory[warehouse.custom_id][product.custom_id] -= qty;
        }
    }
    await runRun('COMMIT');

    // Now write the final inventory state to the database
    console.log("Saving final inventory state...");
    await runRun('BEGIN TRANSACTION');
    for (let wId in inventory) {
        let totalUsage = 0;
        for (let pId in inventory[wId]) {
            let qty = inventory[wId][pId];
            if (qty > 0) {
                await runRun(`INSERT INTO inventory (product_id, warehouse_id, quantity) VALUES (?, ?, ?)`, [pId, wId, qty]);
                totalUsage += qty;
            }
        }
        await runRun(`UPDATE warehouses SET current_usage = ? WHERE custom_id = ?`, [totalUsage, wId]);
    }
    await runRun('COMMIT');

    // Generate some transfers too
    console.log("Generating transfers...");
    await runRun('BEGIN TRANSACTION');
    for (let i = 0; i < 20; i++) {
        let wFrom = warehouses[randomInt(0, warehouses.length - 1)];
        let wTo = warehouses[randomInt(0, warehouses.length - 1)];
        while(wTo.custom_id === wFrom.custom_id) {
            wTo = warehouses[randomInt(0, warehouses.length - 1)];
        }

        // Find a product in wFrom that has > 0 inventory
        let pIdCandidates = Object.keys(inventory[wFrom.custom_id]).filter(p => inventory[wFrom.custom_id][p] > 5);
        if (pIdCandidates.length === 0) continue;

        let pId = pIdCandidates[randomInt(0, pIdCandidates.length - 1)];
        let qtyToTransfer = randomInt(1, Math.min(5, inventory[wFrom.custom_id][pId]));

        let tDateStr = randomDate(startDate, endDate).toISOString().replace('T', ' ').substring(0, 19);

        // create transfer
        let res = await runRun(`INSERT INTO transfers (code, from_warehouse_id, to_warehouse_id, status, user_id, notes, created_at) 
            VALUES (?, ?, ?, 'completed', 1, 'Simulated transfer', ?)`, ['TRF' + randomInt(10000, 99999), wFrom.custom_id, wTo.custom_id, tDateStr]);
        
        let transferId = res.lastID;
        await runRun(`INSERT INTO transfer_items (transfer_id, product_id, quantity) VALUES (?, ?, ?)`, [transferId, pId, qtyToTransfer]);

        // Note: I am skipping updating the inventory table for these simulated completed transfers 
        // because it's a bit complex to interleave with the previous transactions chronologically.
        // Actually, to keep it simple, let's just make the transfers "pending" or let's not worry about perfectly syncing the historical transfers with current inventory if it's just for display.
        // To be safe, let's make them 'completed' but let's actually update the inventory as if the transfer happened at the end.
        
        // update local and db inventory
        inventory[wFrom.custom_id][pId] -= qtyToTransfer;
        if (!inventory[wTo.custom_id][pId]) inventory[wTo.custom_id][pId] = 0;
        inventory[wTo.custom_id][pId] += qtyToTransfer;

        await runRun(`UPDATE inventory SET quantity = ? WHERE warehouse_id = ? AND product_id = ?`, [inventory[wFrom.custom_id][pId], wFrom.custom_id, pId]);
        
        // Check if destination inventory exists
        let destInv = await runQuery(`SELECT * FROM inventory WHERE warehouse_id = ? AND product_id = ?`, [wTo.custom_id, pId]);
        if (destInv.length > 0) {
            await runRun(`UPDATE inventory SET quantity = ? WHERE warehouse_id = ? AND product_id = ?`, [inventory[wTo.custom_id][pId], wTo.custom_id, pId]);
        } else {
            await runRun(`INSERT INTO inventory (product_id, warehouse_id, quantity) VALUES (?, ?, ?)`, [pId, wTo.custom_id, inventory[wTo.custom_id][pId]]);
        }

        // update warehouse usage
        await runRun(`UPDATE warehouses SET current_usage = current_usage - ? WHERE custom_id = ?`, [qtyToTransfer, wFrom.custom_id]);
        await runRun(`UPDATE warehouses SET current_usage = current_usage + ? WHERE custom_id = ?`, [qtyToTransfer, wTo.custom_id]);
    }
    await runRun('COMMIT');

    console.log("Simulation complete!");
}

simulate().catch(err => console.error(err)).finally(() => db.close());
