const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST?.replace(/"/g, '') || 'localhost',
    user: process.env.DB_USER?.replace(/"/g, '') || 'root',
    password: process.env.DB_PASSWORD?.replace(/"/g, '') || '',
    database: process.env.DB_NAME?.replace(/"/g, '') || 'kost_professional',
    port: parseInt(process.env.DB_PORT?.replace(/"/g, '')) || 3306,
    ssl: {
        rejectUnauthorized: false,
        ca: undefined
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
});

module.exports = pool;