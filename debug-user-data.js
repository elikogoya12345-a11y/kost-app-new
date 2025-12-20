const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugUserData() {
    try {
        const dbConfig = {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: parseInt(process.env.DB_PORT),
            ssl: { rejectUnauthorized: false }
        };

        console.log('Connecting to Aiven MySQL...');
        const connection = await mysql.createConnection(dbConfig);
        
        // Check users
        console.log('\n=== USERS ===');
        const [users] = await connection.execute('SELECT id, name, email, role FROM users');
        users.forEach(user => {
            console.log(`${user.id}: ${user.name} (${user.email}) - ${user.role}`);
        });
        
        // Check bookings
        console.log('\n=== BOOKINGS ===');
        const [bookings] = await connection.execute(`
            SELECT b.id, b.user_id, u.name, r.room_number, b.status, b.start_date
            FROM bookings b
            JOIN users u ON b.user_id = u.id
            JOIN rooms r ON b.room_id = r.id
        `);
        bookings.forEach(booking => {
            console.log(`${booking.id}: ${booking.name} - Room ${booking.room_number} - ${booking.status}`);
        });
        
        // Check occupants
        console.log('\n=== OCCUPANTS ===');
        const [occupants] = await connection.execute(`
            SELECT o.id, o.user_id, u.name, r.room_number, o.status
            FROM occupants o
            JOIN users u ON o.user_id = u.id
            JOIN rooms r ON o.room_id = r.id
        `);
        occupants.forEach(occupant => {
            console.log(`${occupant.id}: ${occupant.name} - Room ${occupant.room_number} - ${occupant.status}`);
        });
        
        // Check payments
        console.log('\n=== PAYMENTS ===');
        const [payments] = await connection.execute(`
            SELECT p.id, p.amount, p.due_date, p.status, u.name, r.room_number
            FROM payments p
            JOIN occupants o ON p.occupant_id = o.id
            JOIN users u ON o.user_id = u.id
            JOIN rooms r ON o.room_id = r.id
        `);
        payments.forEach(payment => {
            console.log(`${payment.id}: ${payment.name} - Room ${payment.room_number} - Rp ${payment.amount} - ${payment.status}`);
        });
        
        await connection.end();
        console.log('\n✅ Debug completed!');
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
    }
}

debugUserData();