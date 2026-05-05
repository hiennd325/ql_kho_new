const db = require('./db');
const bcrypt = require('bcrypt');

async function seedOneYearData() {
  console.log('Starting 1-year data simulation...');

  const run = (sql, params = []) => new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });

  const get = (sql, params = []) => new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });

  try {
    // 1. Initial Setup: Clear existing transactions/orders to avoid clutter if needed
    // We'll keep existing users/suppliers/products/warehouses but generate new activity

    const admin = await get('SELECT id FROM users WHERE username = "admin"');
    const staff = await get('SELECT id FROM users WHERE username = "staff1"');
    const products = await new Promise((resolve, reject) => {
      db.all('SELECT custom_id, price, supplier_id FROM products', (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
    const warehouses = await new Promise((resolve, reject) => {
      db.all('SELECT custom_id FROM warehouses', (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });
    const suppliers = await new Promise((resolve, reject) => {
      db.all('SELECT id FROM suppliers', (err, rows) => {
        if (err) reject(err); else resolve(rows);
      });
    });

    if (!admin || products.length === 0 || warehouses.length === 0) {
      console.error('Base data (admin user, products, warehouses) missing. Please run seed_all_data.js first.');
      process.exit(1);
    }

    const now = new Date();
    const startDate = new Date();
    startDate.setFullYear(now.getFullYear() - 1);

    console.log(`Simulating data from ${startDate.toISOString()} to ${now.toISOString()}`);

    // Frequency settings
    const ordersPerMonth = 5;
    const salesPerMonth = 20;
    const transfersPerMonth = 3;
    const auditsPerQuarter = 1;

    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(startDate);
      monthDate.setMonth(startDate.getMonth() + m);
      console.log(`Generating data for month: ${monthDate.getMonth() + 1}/${monthDate.getFullYear()}`);

      // 1. Import Orders (Nhập hàng)
      for (let i = 0; i < ordersPerMonth; i++) {
        const d = new Date(monthDate);
        d.setDate(Math.floor(Math.random() * 28) + 1);
        const dateStr = d.toISOString();

        const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];
        const numItems = Math.floor(Math.random() * 3) + 1;
        let total = 0;
        const selectedProducts = [];

        for (let j = 0; j < numItems; j++) {
          const p = products[Math.floor(Math.random() * products.length)];
          const qty = Math.floor(Math.random() * 50) + 10;
          selectedProducts.push({ ...p, qty });
          total += p.price * qty;
        }

        await run('INSERT INTO orders (user_id, supplier_id, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?)',
          [admin.id, supplier.id, total, 'completed', dateStr]);
        const orderId = (await get('SELECT last_insert_rowid() as id')).id;

        for (const item of selectedProducts) {
          await run('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [orderId, item.custom_id, item.qty, item.price]);

          // Update Inventory & Transaction
          const wh = warehouses[Math.floor(Math.random() * warehouses.length)];
          await run('UPDATE inventory SET quantity = quantity + ? WHERE product_id = ? AND warehouse_id = ?',
            [item.qty, item.custom_id, wh.custom_id]);
          await run('INSERT INTO inventory_transactions (product_id, warehouse_id, quantity, type, supplier_id, reference_id, notes, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [item.custom_id, wh.custom_id, item.qty, 'nhap', supplier.id, `ORD-${orderId}`, 'Nhập hàng định kỳ', dateStr]);
        }
      }

      // 2. Sales Orders (Xuất hàng)
      for (let i = 0; i < salesPerMonth; i++) {
        const d = new Date(monthDate);
        d.setDate(Math.floor(Math.random() * 28) + 1);
        const dateStr = d.toISOString();

        const numItems = Math.floor(Math.random() * 2) + 1;
        let total = 0;
        const selectedProducts = [];

        for (let j = 0; j < numItems; j++) {
          const p = products[Math.floor(Math.random() * products.length)];
          const qty = Math.floor(Math.random() * 5) + 1;
          selectedProducts.push({ ...p, qty });
          total += p.price * qty;
        }

        await run('INSERT INTO sales_orders (customer_name, phone, email, address, total_amount, status, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [`Khách hàng ${Math.floor(Math.random()*1000)}`, '0900000000', 'customer@example.com', 'Địa chỉ ngẫu nhiên', total, 'completed', staff.id, dateStr]);
        const salesOrderId = (await get('SELECT last_insert_rowid() as id')).id;

        for (const item of selectedProducts) {
          await run('INSERT INTO sales_order_items (sales_order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
            [salesOrderId, item.custom_id, item.qty, item.price]);

          // Update Inventory & Transaction
          const wh = warehouses[Math.floor(Math.random() * warehouses.length)];
          // Try to subtract from inventory, if row exists
          await run('UPDATE inventory SET quantity = MAX(0, quantity - ?) WHERE product_id = ? AND warehouse_id = ?',
            [item.qty, item.custom_id, wh.custom_id]);
          await run('INSERT INTO inventory_transactions (product_id, warehouse_id, quantity, type, customer_name, reference_id, notes, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [item.custom_id, wh.custom_id, item.qty, 'xuat', 'Khách hàng lẻ', `SALE-${salesOrderId}`, 'Bán hàng', dateStr]);
        }
      }

      // 3. Transfers (Điều chuyển)
      for (let i = 0; i < transfersPerMonth; i++) {
        if (warehouses.length < 2) break;
        const d = new Date(monthDate);
        d.setDate(Math.floor(Math.random() * 28) + 1);
        const dateStr = d.toISOString();

        const fromWh = warehouses[0].custom_id;
        const toWh = warehouses[1].custom_id;
        const p = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 10) + 1;

        const transferCode = 'TR-' + d.getTime() + '-' + Math.floor(Math.random()*1000);
        await run('INSERT INTO transfers (code, from_warehouse_id, to_warehouse_id, status, user_id, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [transferCode, fromWh, toWh, 'completed', admin.id, 'Điều chuyển nội bộ', dateStr]);
        const transferId = (await get('SELECT last_insert_rowid() as id')).id;

        await run('INSERT INTO transfer_items (transfer_id, product_id, quantity) VALUES (?, ?, ?)', [transferId, p.custom_id, qty]);

        // Update Inventory
        await run('UPDATE inventory SET quantity = MAX(0, quantity - ?) WHERE product_id = ? AND warehouse_id = ?', [qty, p.custom_id, fromWh]);
        await run('INSERT INTO inventory (product_id, warehouse_id, quantity) SELECT ?, ?, 0 WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE product_id = ? AND warehouse_id = ?)', [p.custom_id, toWh, p.custom_id, toWh]);
        await run('UPDATE inventory SET quantity = quantity + ? WHERE product_id = ? AND warehouse_id = ?', [qty, p.custom_id, toWh]);
      }
    }

    console.log('1-year data simulation completed successfully.');
  } catch (error) {
    console.error('Simulation failed:', error);
  } finally {
    process.exit();
  }
}

seedOneYearData();
