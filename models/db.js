const mysql = require('mysql2/promise');
require('dotenv').config();

// Database configuration for Aiven MySQL
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kost_professional',
    port: parseInt(process.env.DB_PORT) || 3306,
    ssl: {
        rejectUnauthorized: false,
        // For Aiven, SSL is required
        ca: undefined
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true
};

console.log('Database config:', {
    host: dbConfig.host,
    port: dbConfig.port,
    database: dbConfig.database,
    user: dbConfig.user,
    ssl: 'enabled'
});

const pool = mysql.createPool(dbConfig);

module.exports = pool;