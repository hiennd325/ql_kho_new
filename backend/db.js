const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'database.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Could not connect to database:', err.message);
    } else {
        // Only log in development or if needed
        // console.log('Connected to shared SQLite database at:', dbPath);
    }
});

module.exports = db;
