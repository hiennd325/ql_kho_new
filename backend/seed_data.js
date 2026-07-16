// seed_data.js — tạo dữ liệu giả lập hoạt động 1 năm (tính tới hiện tại).
// Chỉ dùng stdlib (crypto) + sqlite3 + bcrypt (đã có sẵn). Không thêm dependency.
// Đảm bảo inventory khớp với inventory_transactions: mỗi giao dịch nhập/xuất
// cập nhật tồn kho thực tế theo stock hiện tại (không âm, không vượt tồn kho khi xuất).
//
// Chạy: node seed_data.js   (từ thư mục backend)

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

const db = new sqlite3.Database(path.join(__dirname, 'database.db'), (err) => {
    if (err) { console.error('DB error:', err.message); process.exit(1); }
});

const RUN = (sql, params = []) =>
    new Promise((resolve, reject) => db.run(sql, params, function (err) {
        if (err) reject(err); else resolve(this);
    }));
const GET = (sql, params = []) =>
    new Promise((resolve, reject) => db.get(sql, params, (e, r) => e ? reject(e) : resolve(r)));
const ALL = (sql, params = []) =>
    new Promise((resolve, reject) => db.all(sql, params, (e, r) => e ? reject(e) : resolve(r)));

// ---- RNG xác định (deterministic) để tái tạo lại được ----
const SEED = 20240715;
let _s = SEED >>> 0;
function srand() { _s = (_s * 1664525 + 1013904223) >>> 0; return _s / 4294967296; }
const randInt = (a, b) => Math.floor(srand() * (b - a + 1)) + a;
const pick = (arr) => arr[Math.floor(srand() * arr.length)];
const chance = (p) => srand() < p;
const round2 = (n) => Math.round(n * 100) / 100;
const ts = () => Date.now().toString(36) + crypto.randomBytes(2).toString('hex');

const NOW = new Date();
const DAY = 86400000;
const START = new Date(NOW.getTime() - 365 * DAY); // ~1 năm trước

// Phân bố giao dịch: nhiều hơn gần đây (weighted random theo ngày)
function randomDayOffset() {
    // lấy u trong [0,1), bias về gần hiện tại: dayFromStart = (u^2)*(span)
    const u = srand();
    const span = (NOW - START) / DAY;
    return Math.floor(u * u * span); // u^2 => thiên về cuối (gần nay)
}

function isoDaysAgo(daysAgo) {
    const d = new Date(NOW.getTime() - daysAgo * DAY);
    d.setHours(randInt(7, 20), randInt(0, 59), randInt(0, 59), 0);
    return d.toISOString().slice(0, 19).replace('T', ' ');
}

const CATEGORIES = ['Điện thoại', 'Laptop', 'Phụ kiện', 'Máy tính bảng', 'Đồng hồ thông minh', 'Âm thanh'];
const BRANDS = ['Apple', 'Samsung', 'Xiaomi', 'Sony', 'Dell', 'Asus', 'Logitech', 'JBL', 'Huawei', 'Anker'];
const CAT_BRANDS = {
    'Điện thoại': ['Apple', 'Samsung', 'Xiaomi', 'Huawei'],
    'Laptop': ['Apple', 'Dell', 'Asus', 'Samsung'],
    'Máy tính bảng': ['Apple', 'Samsung', 'Xiaomi'],
    'Đồng hồ thông minh': ['Apple', 'Samsung', 'Xiaomi', 'Huawei'],
    'Phụ kiện': ['Logitech', 'Anker', 'JBL', 'Sony'],
    'Âm thanh': ['Sony', 'JBL', 'Apple', 'Anker']
};
const PRODUCT_NAMES = {
    'Điện thoại': ['iPhone', 'Galaxy', 'Redmi', 'P40', 'Nova'],
    'Laptop': ['MacBook', 'XPS', 'ZenBook', 'Galaxy Book', 'Inspiron'],
    'Máy tính bảng': ['iPad', 'Galaxy Tab', 'Pad', 'MatePad'],
    'Đồng hồ thông minh': ['Watch', 'Galaxy Watch', 'Mi Band', 'Watch Fit'],
    'Phụ kiện': ['Chuột', 'Bàn phím', 'Sạc', 'Cáp', 'Hub'],
    'Âm thanh': ['Tai nghe', 'Loa', 'Headset', 'Soundbar']
};
const SUPPLIER_NAMES = ['Công ty TNHH Thế Giới Số', 'Phú Thịnh Mobile', 'An Khang Phân Phối', 'VietTech Supply',
    'Minh Long Trading', 'Sao Mai Distribution', 'Gia Hưng Import', 'TechLink VN', 'Phúc An Tech', 'Đại Phát Group'];
const CITIES = ['Hà Nội', 'TP.HCM', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ', 'Biên Hòa', 'Nha Trang', 'Huế'];
const CUSTOMER_NAMES = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Thị D', 'Hoàng Văn E', 'Vũ Thị F',
    'Đặng Văn G', 'Bùi Thị H', 'Ngô Văn I', 'Đỗ Thị K', 'Mai Văn L', 'Lý Thị M'];

async function main() {
    await RUN('PRAGMA foreign_keys = OFF');

    // 1) Xóa sạch (giữ schema) — reset cả autoincrement
    const tables = ['audits', 'audit_items', 'sales_order_items', 'sales_orders', 'transfers',
        'inventory_transactions', 'order_items', 'orders', 'inventory', 'products', 'suppliers',
        'warehouses', 'users'];
    for (const t of tables) {
        await RUN(`DELETE FROM ${t}`);
        await RUN(`DELETE FROM sqlite_sequence WHERE name = ?`, [t]);
    }
    console.log('Đã xóa dữ liệu cũ.');

    // 2) Users
    const users = [];
    const adminPw = await bcrypt.hash('Duchien@12', 10);
    await RUN(`INSERT INTO users (username,email,password,role,status,created_at) VALUES (?,?,?,?,?,?)`,
        ['hiennd325', null, adminPw, 'admin', 'active', isoDaysAgo(365)]);
    users.push({ id: 1, username: 'hiennd325' });
    const staffNames = ['lan.nt', 'tuan.vv', 'mai.ht', 'hung.pq', 'nhung.tr', 'duc.pt', 'lien.hm', 'khoa.nt'];
    for (let i = 0; i < staffNames.length; i++) {
        const pw = await bcrypt.hash('Staff@123', 10);
        await RUN(`INSERT INTO users (username,email,password,role,status,created_at) VALUES (?,?,?,?,?,?)`,
            [staffNames[i], `${staffNames[i]}@qlkho.vn`, pw, 'staff', chance(0.1) ? 'inactive' : 'active', isoDaysAgo(randInt(300, 360))]);
        users.push({ id: i + 2, username: staffNames[i] });
    }
    const activeUsers = users.filter(u => u.username !== 'hiennd325');
    console.log(`Users: ${users.length}`);

    // 3) Warehouses
    const warehouses = [];
    const whCodes = ['KHO-HN', 'KHO-HCM', 'KHO-DN'];
    const whNames = ['Kho Hà Nội', 'Kho TP.HCM', 'Kho Đà Nẵng'];
    const whCap = [5000, 8000, 3000];
    for (let i = 0; i < whCodes.length; i++) {
        await RUN(`INSERT INTO warehouses (custom_id,name,location,capacity,current_usage,created_at) VALUES (?,?,?,?,?,?)`,
            [whCodes[i], whNames[i], pick(CITIES), whCap[i], 0, isoDaysAgo(360)]);
        warehouses.push({ id: whCodes[i], capacity: whCap[i] });
    }
    console.log(`Warehouses: ${warehouses.length}`);

    // 4) Suppliers
    const suppliers = [];
    for (let i = 0; i < SUPPLIER_NAMES.length; i++) {
        const code = 'NCC' + String(i + 1).padStart(3, '0');
        await RUN(`INSERT INTO suppliers (code,name,contact_person,phone,email,address,created_at) VALUES (?,?,?,?,?,?,?)`,
            [code, SUPPLIER_NAMES[i], pick(CUSTOMER_NAMES), '0' + randInt(900000000, 999999999),
                `contact${i + 1}@supplier.vn`, 'Số ' + randInt(1, 200) + ' ' + pick(CITIES), isoDaysAgo(randInt(350, 360))]);
        suppliers.push({ id: i + 1, code });
    }
    console.log(`Suppliers: ${suppliers.length}`);

    // 5) Products (đa dạng, mỗi category nhiều brand)
    const products = [];
    let pcount = 0;
    for (const cat of CATEGORIES) {
        const brands = CAT_BRANDS[cat];
        for (const brand of brands) {
            const n = randInt(3, 6);
            for (let k = 0; k < n; k++) {
                const baseName = pick(PRODUCT_NAMES[cat]);
                const model = randInt(1, 15) + (chance(0.5) ? ' Pro' : '');
                const name = `${brand} ${baseName} ${model}`;
                const customId = brand.slice(0, 3).toUpperCase() + '-' + String(++pcount).padStart(4, '0');
                const price = round2(randInt(20, 4000) * 1000 + randInt(0, 999));
                const desc = `${cat} ${brand}, model ${model}. Bảo hành 12 tháng.`;
                await RUN(`INSERT INTO products (custom_id,name,description,price,brand,category,supplier_id,created_at) VALUES (?,?,?,?,?,?,?,?)`,
                    [customId, name, desc, price, brand, cat, pick(suppliers).id, isoDaysAgo(randInt(330, 360))]);
                products.push({ id: customId, name, price, brand, cat });
            }
        }
    }
    console.log(`Products: ${products.length}`);

    // 6) Inventory + transactions (2 năm)
    // Mô phỏng: nhập hàng định kỳ, xuất bán lẻ liên tục. Tồn kho thực tế = sum nhập - sum xuất.
    const stock = {}; // productId|warehouseId -> qty
    const dkey = (p, w) => p + '|' + w;
    for (const p of products) stock[dkey(p.id, whCodes[0])] = 0; // khởi tạo

    // helper cập nhật stock thực tế
    function applyStock(productId, wh, delta) {
        const k = dkey(productId, wh);
        stock[k] = (stock[k] || 0) + delta;
        if (stock[k] < 0) stock[k] = 0;
    }

    // 6a) Nhập hàng (inbound) — đều đặn, số lượng lớn
    const inboundCount = 900;
    for (let i = 0; i < inboundCount; i++) {
        const p = pick(products);
        const wh = pick(warehouses).id;
        const qty = randInt(20, 200);
        const daysAgo = randomDayOffset();
        const date = isoDaysAgo(daysAgo);
        const sup = pick(suppliers).id;
        await RUN(`INSERT INTO inventory_transactions (reference_id,product_id,warehouse_id,quantity,type,supplier_id,notes,transaction_date) VALUES (?,?,?,?,?,?,?,?)`,
            ['NHAP-' + ts(), p.id, wh, qty, 'nhap', sup, 'Nhập hàng từ nhà cung cấp', date]);
        applyStock(p.id, wh, qty);
    }
    console.log(`Inbound transactions: ${inboundCount}`);

    // 6b) Xuất bán (outbound) — nhiều hơn, số lượng nhỏ, không vượt tồn kho
    const outboundCount = 2600;
    for (let i = 0; i < outboundCount; i++) {
        const p = pick(products);
        const wh = pick(warehouses).id;
        const cur = stock[dkey(p.id, wh)] || 0;
        if (cur <= 0) continue; // không xuất nếu hết hàng
        const qty = Math.min(cur, randInt(1, 8));
        const daysAgo = randomDayOffset();
        const date = isoDaysAgo(daysAgo);
        const cust = pick(CUSTOMER_NAMES);
        await RUN(`INSERT INTO inventory_transactions (reference_id,product_id,warehouse_id,quantity,type,customer_name,notes,transaction_date) VALUES (?,?,?,?,?,?,?,?)`,
            ['XUAT-' + ts(), p.id, wh, qty, 'xuat', cust, 'Xuất bán lẻ', date]);
        applyStock(p.id, wh, -qty);
    }
    console.log(`Outbound transactions: ${outboundCount}`);

    // 6c) Ghi inventory (tồn kho hiện tại) từ stock
    let invRows = 0;
    for (const k in stock) {
        const qty = stock[k];
        if (qty <= 0) continue;
        const [productId, wh] = k.split('|');
        await RUN(`INSERT INTO inventory (product_id,warehouse_id,quantity) VALUES (?,?,?)`, [productId, wh, qty]);
        invRows++;
    }
    // cập nhật current_usage cho từng kho
    for (const w of warehouses) {
        const r = await GET('SELECT COALESCE(SUM(quantity),0) total FROM inventory WHERE warehouse_id = ?', [w.id]);
        await RUN('UPDATE warehouses SET current_usage = ? WHERE custom_id = ?', [r.total, w.id]);
    }
    console.log(`Inventory rows (current stock): ${invRows}`);

    // 7) Orders (mua từ NCC) — song song với inbound, ít hơn
    const orderCount = 220;
    for (let i = 0; i < orderCount; i++) {
        const sup = pick(suppliers);
        const user = pick(activeUsers);
        const itemN = randInt(1, 4);
        const items = [];
        let total = 0;
        for (let j = 0; j < itemN; j++) {
            const p = pick(products);
            const qty = randInt(10, 100);
            items.push({ p, qty, price: p.price });
            total += p.price * qty;
        }
        total = round2(total);
        const status = pick(['pending', 'completed', 'completed', 'cancelled']);
        const daysAgo = randomDayOffset();
        const r = await RUN(`INSERT INTO orders (user_id,supplier_id,total_amount,status,created_at) VALUES (?,?,?,?,?)`,
            [user.id, sup.id, total, status, isoDaysAgo(daysAgo)]);
        for (const it of items) {
            await RUN(`INSERT INTO order_items (order_id,product_id,quantity,price) VALUES (?,?,?,?)`,
                [r.lastID, it.p.id, it.qty, it.price]);
        }
    }
    console.log(`Orders: ${orderCount}`);

    // 8) Sales orders (bán cho khách) — nhiều, mô phỏng doanh thu
    const salesCount = 1400;
    for (let i = 0; i < salesCount; i++) {
        const user = pick(activeUsers);
        const itemN = randInt(1, 5);
        const items = [];
        let total = 0;
        for (let j = 0; j < itemN; j++) {
            const p = pick(products);
            const qty = randInt(1, 6);
            items.push({ p, qty, price: round2(p.price * (1 + randInt(5, 25) / 100)) });
            total += items[items.length - 1].price * qty;
        }
        total = round2(total);
        const status = pick(['pending', 'completed', 'completed', 'completed', 'cancelled']);
        const daysAgo = randomDayOffset();
        const r = await RUN(`INSERT INTO sales_orders (customer_name,phone,email,address,total_amount,status,created_at,user_id) VALUES (?,?,?,?,?,?,?,?)`,
            [pick(CUSTOMER_NAMES), '0' + randInt(900000000, 999999999), 'khach' + randInt(1, 999) + '@mail.vn',
                'Địa chỉ ' + pick(CITIES), total, status, isoDaysAgo(daysAgo), user.id]);
        for (const it of items) {
            await RUN(`INSERT INTO sales_order_items (sales_order_id,product_id,quantity,price) VALUES (?,?,?,?)`,
                [r.lastID, it.p.id, it.qty, it.price]);
        }
    }
    console.log(`Sales orders: ${salesCount}`);

    // 9) Transfers (chuyển kho)
    const transferStatuses = ['pending', 'in_progress', 'completed', 'cancelled'];
    const transferCount = 160;
    for (let i = 0; i < transferCount; i++) {
        const p = pick(products);
        const [from, to] = shuffle(warehouses.map(w => w.id)).slice(0, 2);
        const qty = randInt(5, 50);
        const status = pick(transferStatuses);
        const user = pick(activeUsers);
        const daysAgo = randomDayOffset();
        await RUN(`INSERT INTO transfers (code,from_warehouse_id,to_warehouse_id,product_id,quantity,status,user_id,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)`,
            ['CHUYEN-' + ts(), from, to, p.id, qty, status, user.id, 'Chuyển kho điều phối', isoDaysAgo(daysAgo), isoDaysAgo(daysAgo)]);
    }
    console.log(`Transfers: ${transferCount}`);

    // 10) Audits (kiểm kê) — thưa, chỉ 1 năm gần đây
    const auditCount = 24;
    for (let i = 0; i < auditCount; i++) {
        const wh = pick(warehouses).id;
        const user = pick(activeUsers);
        const daysAgo = randInt(0, 360);
        const date = isoDaysAgo(daysAgo);
        const disc = round2(randInt(-5000, 5000) / 100);
        const status = pick(['completed', 'completed', 'pending', 'cancelled']);
        const r = await RUN(`INSERT INTO audits (code,date,warehouse_id,created_by_user_id,discrepancy,status,notes,created_at) VALUES (?,?,?,?,?,?,?,?)`,
            ['KIEMKE-' + ts(), date, wh, user.id, disc, status, 'Kiểm kê định kỳ', isoDaysAgo(daysAgo)]);
        // 1-4 item kiểm kê
        const itemN = randInt(1, 4);
        for (let j = 0; j < itemN; j++) {
            const p = pick(products);
            const sys = randInt(0, 100);
            const act = Math.max(0, sys + randInt(-10, 10));
            await RUN(`INSERT INTO audit_items (audit_id,product_id,system_quantity,actual_quantity,discrepancy,notes,created_at) VALUES (?,?,?,?,?,?,?)`,
                [r.lastID, p.id, sys, act, act - sys, 'Đối chiếu', isoDaysAgo(daysAgo)]);
        }
    }
    console.log(`Audits: ${auditCount}`);

    // --- Báo cáo tổng ---
    const span = await GET(`SELECT MIN(transaction_date) minD, MAX(transaction_date) maxD FROM inventory_transactions`);
    console.log('\n=== SPAN giao dịch ===');
    console.log('Từ:', span.minD, '->', span.maxD);
    for (const t of ['users', 'warehouses', 'suppliers', 'products', 'inventory',
        'inventory_transactions', 'orders', 'order_items', 'sales_orders',
        'sales_order_items', 'transfers', 'audits', 'audit_items']) {
        const c = await GET(`SELECT COUNT(*) c FROM ${t}`);
        console.log(`  ${t}: ${c.c}`);
    }
    const rev = await GET(`SELECT COALESCE(SUM(total_amount),0) rev FROM sales_orders WHERE status='completed'`);
    console.log('Doanh thu (sales completed):', round2(rev.rev).toLocaleString('vi-VN'), 'VND');

    await RUN('PRAGMA foreign_keys = ON');
    db.close();
    console.log('\nXONG. Dữ liệu 2 năm đã tạo.');
}

function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(srand() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

main().catch((err) => {
    console.error('FAILED:', err.message);
    db.close();
    process.exit(1);
});
