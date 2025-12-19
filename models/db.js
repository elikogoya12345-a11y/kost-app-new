const mysql = require('mysql2/promise');
require('dotenv').config();

// Try Railway MySQL first, fallback to Aiven
const dbConfig = {
    host: process.env.MYSQLHOST || process.env.DB_HOST?.replace(/"/g, '') || 'localhost',
    user: process.env.MYSQLUSER || process.env.DB_USER?.replace(/"/g, '') || 'root',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD?.replace(/"/g, '') || '',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME?.replace(/"/g, '') || 'kost_professional',
    port: parseInt(process.env.MYSQLPORT || process.env.DB_PORT?.replace(/"/g, '')) || 3306,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;