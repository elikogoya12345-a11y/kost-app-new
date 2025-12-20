const mysql = require('mysql2/promise');
require('dotenv').config();

async function debugOccupants() {
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
        const connection = await mysql.createConnection(dbConfig);
        
        // Test simple users query first
        console.log('\n=== SIMPLE USERS QUERY ===');
        const [simpleUsers] = await connection.execute('SELECT id, name, email, role, status FROM users WHERE role = "user"');
        console.log('Simple users found:', simpleUsers.length);
        simpleUsers.forEach(user => {
            console.log(`- ${user.name} (${user.email}) - Status: ${user.status}`);
        });
        
        // Test the exact query from admin route
        console.log('\n=== ADMIN OCCUPANTS QUERY ===');
        const [occupants] = await connection.execute(`
            SELECT DISTINCT u.id, u.name, u.email, u.phone, u.birth_date, u.status, u.created_at,
                   o.start_date, o.end_date, o.status as occupant_status, r.room_number,
                   b.id as booking_id, b.duration_months, b.start_date as booking_start_date,
                   br.room_number as booking_room_number, rt.name as room_type,
                   CASE 
                       WHEN o.status = 'active' THEN 'Sedang Menghuni'
                       WHEN b.status = 'confirmed' THEN 'Ada Booking'
                       ELSE 'Terdaftar'
                   END as user_category
            FROM users u
            LEFT JOIN occupants o ON u.id = o.user_id AND o.status = 'active'
            LEFT JOIN rooms r ON o.room_id = r.id
            LEFT JOIN bookings b ON u.id = b.user_id AND b.status = 'confirmed'
            LEFT JOIN rooms br ON b.room_id = br.id
            LEFT JOIN room_types rt ON br.room_type_id = rt.id
            WHERE u.role = 'user'
            ORDER BY 
                CASE 
                    WHEN o.status = 'active' THEN 1
                    WHEN b.status = 'confirmed' THEN 2
                    ELSE 3
                END,
                u.created_at DESC
        `);
        
        console.log('Admin occupants query result:', occupants.length);
        occupants.forEach(occupant => {
            console.log(`- ${occupant.name} (${occupant.email})`);
            console.log(`  Status: ${occupant.status}, Category: ${occupant.user_category}`);
            console.log(`  Created: ${occupant.created_at}`);
            console.log(`  Occupant Status: ${occupant.occupant_status}`);
            console.log(`  Booking ID: ${occupant.booking_id}`);
            console.log('---');
        });
        
        // Calculate statistics
        const stats = {
            total: occupants.length,
            active_occupants: occupants.filter(o => o.occupant_status === 'active').length,
            inactive_users: occupants.filter(o => o.status === 'inactive').length,
            registered_users: occupants.filter(o => !o.occupant_status && !o.booking_id).length
        };
        
        console.log('\n=== STATISTICS ===');
        console.log('Total:', stats.total);
        console.log('Active Occupants:', stats.active_occupants);
        console.log('Inactive Users:', stats.inactive_users);
        console.log('Registered Users:', stats.registered_users);
        
        await connection.end();
        console.log('\n✅ Debug completed!');
        
    } catch (error) {
        console.error('❌ Debug failed:', error);
        process.exit(1);
    }
}

debugOccupants();