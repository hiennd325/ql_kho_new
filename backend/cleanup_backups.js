const fs = require('fs');
const path = require('path');

// Hàm dọn dẹp các file backup cũ (đồng bộ để đảm bảo chỉ giữ đúng N file)
function cleanupOldBackups(maxBackups = 1) {
    const backendDir = __dirname;

    let files;
    try {
        files = fs.readdirSync(backendDir);
    } catch (err) {
        console.error('Error reading directory:', err);
        return;
    }

    const backupFiles = files.filter(file => {
        if (!file.startsWith('database.db.backup.')) return false;
        const parts = file.split('.');
        if (parts.length < 4) return false;
        const timestamp = parts[3];
        return !isNaN(timestamp) && timestamp.length >= 10;
    });

    // Sắp xếp giảm dần (mới nhất trước)
    backupFiles.sort((a, b) =>
        parseInt(b.split('.')[3]) - parseInt(a.split('.')[3])
    );

    if (backupFiles.length > maxBackups) {
        backupFiles.slice(maxBackups).forEach(file => {
            const filePath = path.join(backendDir, file);
            try {
                fs.unlinkSync(filePath);
                console.log('Deleted old backup file:', file);
            } catch (err) {
                console.error('Error deleting file:', filePath, err);
            }
        });
    }
}

module.exports = cleanupOldBackups;

// Nếu chạy trực tiếp thì thực hiện dọn dẹp
if (require.main === module) {
    const maxBackups = process.argv[2] ? parseInt(process.argv[2]) : 1;
    cleanupOldBackups(maxBackups);
}
