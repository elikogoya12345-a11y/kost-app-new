const pool = require('./models/db');

async function testConnection() {
    try {
        console.log('Testing database connection...');
        const connection = await pool.getConnection();
        console.log('✅ Database connected successfully!');
        
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM users');
        console.log('✅ Query test successful:', rows[0]);
        
        connection.release();
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Config:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });
    }
}

testConnection();