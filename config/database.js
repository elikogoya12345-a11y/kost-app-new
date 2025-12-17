const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'kost_professional',
    port: process.env.DB_PORT || 3306,
    ssl: process.env.NODE_ENV === 'production' ? {
        rejectUnauthorized: true,
        ca: process.env.DB_SSL_CA || undefined
    } : false,
    connectTimeout: 60000,
    acquireTimeout: 60000
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;