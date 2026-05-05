// Import các module cần thiết cho ứng dụng
const express = require('express'); // Framework web cho Node.js
const bodyParser = require('body-parser'); // Middleware để parse JSON body
const cors = require('cors'); // Middleware để xử lý CORS
const sqlite3 = require('sqlite3').verbose(); // SQLite database driver
const fs = require('fs'); // File system module
const path = require('path'); // Module để xử lý đường dẫn

const { authenticate, authorizeAdmin } = require('./middleware/auth');

// Tạo instance của Express app
const app = express();
// Đặt port từ biến môi trường hoặc mặc định 3000
const port = process.env.PORT || 3000;

// Cấu hình CORS để cho phép frontend truy cập
app.use(cors({
  origin: '*',  // Cho phép tất cả origins trong môi trường development
  credentials: true, // Cho phép gửi credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Các HTTP methods được phép
  allowedHeaders: ['Content-Type', 'Authorization'] // Headers được phép
}));

// Middleware để parse JSON body từ requests
app.use(bodyParser.json());

// Middleware để xử lý routes
app.use((req, res, next) => {
    // Chuyển hướng root path đến login.html
    if (req.path === '/') {
        return res.redirect('/login.html');
    }
    next();
});

// Serve static files từ thư mục frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Kết nối đến cơ sở dữ liệu SQLite
const db = require('./db');
const dbExists = fs.existsSync(path.join(__dirname, 'database.db'));

// Nếu tệp cơ sở dữ liệu chưa tồn tại, đọc và thực thi schema từ file schema.sql
if (!dbExists) {
    const schemaPath = path.join(__dirname, 'schema.sql');
    fs.readFile(schemaPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading schema.sql:', err);
            return;
        }
        db.exec(data, (err) => {
            if (err) {
                console.error('Error executing schema:', err.message);
            } else {
                console.log('Database schema applied.');
            }
        });
    });
} else {
    console.log('Using existing database file.');
}





// Import và sử dụng API v1 routes
const apiV1Routes = require('./routes/api');
app.use('/api/v1', apiV1Routes);

// Middleware xử lý lỗi toàn cục
app.use((err, req, res, next) => {
    console.error(err.stack); // Log lỗi ra console
    res.status(500).json({ error: 'Internal server error' }); // Trả về lỗi 500
});

// Khởi động server
const server = app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log('Server started successfully');
});

// Import hàm dọn dẹp backup
const cleanupOldBackups = require('./cleanup_backups');

// Hàm tạo backup database
function createDatabaseBackup() {
    const backupPath = `./database.db.backup.${Date.now()}`;
    fs.copyFile('./database.db', backupPath, (err) => {
        if (err) {
            console.error('Error creating database backup:', err.message);
        } else {
            console.log(`Database backup created: ${backupPath}`);
            // Dọn dẹp các backup cũ, chỉ giữ lại 1 file mới nhất
            cleanupOldBackups(1);
        }
    });
}

// Hàm xử lý shutdown graceful
function gracefulShutdown() {
    console.log('Received shutdown signal, creating database backup and closing connections...');
    
    // Tạo backup database trước khi đóng
    createDatabaseBackup();
    
    // Đóng database connection
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed.');
        }
        
        // Đóng server
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });
    });
}

// Xử lý các tín hiệu shutdown
process.on('SIGINT', gracefulShutdown);  // Ctrl+C
process.on('SIGTERM', gracefulShutdown); // Termination signal
process.on('SIGUSR2', gracefulShutdown); // Nodemon restart

// Xử lý uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown();
});

// Xử lý unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    gracefulShutdown();
});