const db = require('./db');
const bcrypt = require('bcrypt');

async function seed() {
  console.log('Starting full data seeding...');

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
    // 0. Ensure transfer_items table exists
    await run(`CREATE TABLE IF NOT EXISTS transfer_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transfer_id INTEGER NOT NULL,
        product_id TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (transfer_id) REFERENCES transfers(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(custom_id)
    )`);

    // 1. Users
    const hashedPassword = await bcrypt.hash('password123', 10);
    await run('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['admin', 'admin@example.com', hashedPassword, 'admin']);
    await run('INSERT OR IGNORE INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      ['staff1', 'staff1@example.com', hashedPassword, 'staff']);
    const admin = await get('SELECT id FROM users WHERE username = "admin"');
    const staff = await get('SELECT id FROM users WHERE username = "staff1"');

    // 2. Suppliers
    const suppliers = [
      ['S001', 'Công ty Toàn Cầu', 'Nguyễn Văn A', '0901234567', 'contact@toancau.vn', 'Hà Nội'],
      ['S002', 'Logistics Việt Nam', 'Trần Thị B', '0912345678', 'info@vnlogistics.com', 'TP.HCM'],
      ['S003', 'Điện máy Xanh', 'Lê Văn C', '0923456789', 'sales@dienmay.vn', 'Đà Nẵng']
    ];
    for (const s of suppliers) {
      await run('INSERT OR IGNORE INTO suppliers (code, name, contact_person, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)', s);
    }
    const s1 = await get('SELECT id FROM suppliers WHERE code = "S001"');
    const s2 = await get('SELECT id FROM suppliers WHERE code = "S002"');

    // 3. Warehouses
    const warehouses = [
      ['W001', 'Kho Trung Tâm', 10000, 0],
      ['W002', 'Kho Miền Bắc', 5000, 0],
      ['W003', 'Kho Miền Nam', 8000, 0]
    ];
    for (const w of warehouses) {
      await run('INSERT OR IGNORE INTO warehouses (custom_id, name, capacity, current_usage) VALUES (?, ?, ?, ?)', w);
    }

    // 4. Products
    const products = [
      ['P001', 'Laptop Dell XPS', 'Intel Core i7, 16GB RAM', 25000000, 'Dell', s1.id],
      ['P002', 'iPhone 15 Pro', '256GB, Titanium', 28000000, 'Apple', s1.id],
      ['P003', 'Samsung Galaxy S24', 'AI Camera, 512GB', 22000000, 'Samsung', s2.id],
      ['P004', 'Màn hình LG 4K', '27 inch, IPS', 8000000, 'LG', s2.id]
    ];
    for (const p of products) {
      await run('INSERT OR IGNORE INTO products (custom_id, name, description, price, brand, supplier_id) VALUES (?, ?, ?, ?, ?, ?)', p);
    }

    // 5. Inventory (Initial Stock)
    const inventoryData = [
      ['P001', 'W001', 50],
      ['P002', 'W001', 30],
      ['P003', 'W002', 40],
      ['P004', 'W003', 25]
    ];
    for (const i of inventoryData) {
      await run('INSERT OR IGNORE INTO inventory (product_id, warehouse_id, quantity) VALUES (?, ?, ?)', i);
    }

    // 6. Orders (Import Orders)
    const orderDate = new Date().toISOString();
    await run('INSERT INTO orders (user_id, supplier_id, total_amount, status, created_at) VALUES (?, ?, ?, ?, ?)',
      [admin.id, s1.id, 53000000, 'completed', orderDate]);
    const orderId = (await get('SELECT last_insert_rowid() as id')).id;
    await run('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, 'P001', 1, 25000000]);
    await run('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [orderId, 'P002', 1, 28000000]);

    // 7. Sales Orders (Export Orders)
    await run('INSERT INTO sales_orders (customer_name, phone, email, address, total_amount, status, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      ['Khách hàng A', '0988777666', 'customer@gmail.com', 'Hà Nội', 22000000, 'completed', staff.id, orderDate]);
    const salesOrderId = (await get('SELECT last_insert_rowid() as id')).id;
    await run('INSERT INTO sales_order_items (sales_order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)', [salesOrderId, 'P003', 1, 22000000]);

    // 8. Inventory Transactions
    await run('INSERT INTO inventory_transactions (product_id, warehouse_id, quantity, type, supplier_id, reference_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['P001', 'W001', 10, 'nhap', s1.id, 'REF-001', 'Nhập hàng Dell đầu tháng']);
    await run('INSERT INTO inventory_transactions (product_id, warehouse_id, quantity, type, customer_name, reference_id, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['P003', 'W002', 5, 'xuat', 'Khách hàng A', 'REF-002', 'Xuất bán lẻ']);

    // 9. Transfers (Multi-item)
    const transferCode = 'TR-' + Date.now();
    await run('INSERT INTO transfers (code, from_warehouse_id, to_warehouse_id, status, user_id, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [transferCode, 'W001', 'W002', 'completed', admin.id, 'Điều chuyển sang kho miền Bắc']);
    const transferId = (await get('SELECT last_insert_rowid() as id')).id;
    await run('INSERT INTO transfer_items (transfer_id, product_id, quantity) VALUES (?, ?, ?)', [transferId, 'P001', 5]);

    // 10. Audits
    const auditCode = 'AUD-' + Date.now();
    await run('INSERT INTO audits (code, date, warehouse_id, created_by_user_id, discrepancy, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [auditCode, orderDate, 'W001', admin.id, 0, 'completed', 'Kiểm kê định kỳ tháng 5']);
    const auditId = (await get('SELECT last_insert_rowid() as id')).id;
    await run('INSERT INTO audit_items (audit_id, product_id, system_quantity, actual_quantity, discrepancy, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [auditId, 'P001', 50, 50, 0, 'Khớp']);

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    process.exit();
  }
}

seed();
