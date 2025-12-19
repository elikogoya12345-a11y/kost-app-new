// Keep Aiven MySQL alive with periodic ping
const mysql = require('mysql2/promise');

const aivenConfig = {
    host: 'mysql-3ac5af41-suryananda7963-ff8c.f.aivencloud.com',
    port: 15388,
    user: 'avnadmin',
    password: process.env.AIVEN_PASSWORD, // Set this in Railway
    database: 'defaultdb',
    ssl: { rejectUnauthorized: false }
};

async function pingAiven() {
    try {
        const connection = await mysql.createConnection(aivenConfig);
        await connection.execute('SELECT 1');
        await connection.end();
        console.log('✅ Aiven ping successful:', new Date().toISOString());
    } catch (error) {
        console.log('❌ Aiven ping failed:', error.message);
    }
}

// Ping every 5 minutes
setInterval(pingAiven, 5 * 60 * 1000);

// Initial ping
pingAiven();

module.exports = { pingAiven };