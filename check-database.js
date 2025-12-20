const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDatabase() {
    try {
        // Aiven database config
        const dbConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT),
            ssl: { rejectUnauthorized: false }
        };

        console.log('Connecting to Aiven MySQL...');
        console.log(`Host: ${dbConfig.host}:${dbConfig.port}`);
        console.log(`Database: ${dbConfig.database}`);
        
        const connection = await mysql.createConnection(dbConfig);
        
        // Check tables exist
        console.log('\n=== CHECKING TABLES ===');
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('Tables found:', tables.length);
        tables.forEach(table => {
            console.log(`- ${Object.values(table)[0]}`);
        });
        
        // Check users
        console.log('\n=== CHECKING USERS ===');
        const [users] = await connection.execute('SELECT id, name, email, role, status, created_at FROM users ORDER BY created_at DESC');
        console.log('Total users:', users.length);
        users.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - Role: ${user.role}, Status: ${user.status}, Created: ${user.created_at}`);
        });
        
        // Check room types
        console.log('\n=== CHECKING ROOM TYPES ===');
        const [roomTypes] = await connection.execute('SELECT id, name, base_price FROM room_types');
        console.log('Total room types:', roomTypes.length);
        roomTypes.forEach(rt => {
            console.log(`- ${rt.name}: Rp ${rt.base_price.toLocaleString('id-ID')}`);
        });
        
        // Check rooms
        console.log('\n=== CHECKING ROOMS ===');
        const [rooms] = await connection.execute('SELECT COUNT(*) as total FROM rooms');
        console.log('Total rooms:', rooms[0].total);
        
        const [roomsByStatus] = await connection.execute(`
            SELECT status, COUNT(*) as count 
            FROM rooms 
            GROUP BY status
        `);
        roomsByStatus.forEach(rs => {
            console.log(`- ${rs.status}: ${rs.count} rooms`);
        });
        
        // Check bookings
        console.log('\n=== CHECKING BOOKINGS ===');
        const [bookings] = await connection.execute('SELECT COUNT(*) as total FROM bookings');
        console.log('Total bookings:', bookings[0].total);
        
        // Check occupants
        console.log('\n=== CHECKING OCCUPANTS ===');
        const [occupants] = await connection.execute('SELECT COUNT(*) as total FROM occupants');
        console.log('Total occupants:', occupants[0].total);
        
        await connection.end();
        console.log('\n✅ Database check completed!');
        
    } catch (error) {
        console.error('❌ Database check failed:', error);
        process.exit(1);
    }
}

checkDatabase();