const mysql = require('mysql2/promise');
require('dotenv').config();

async function addRooms() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kost_professional'
        });
        
        console.log('🔄 Adding 35 rooms...');
        
        const rooms = [
            // Standard Room (5 rooms)
            [1, 'STD-001', 'available', 1], [1, 'STD-002', 'available', 1], [1, 'STD-003', 'available', 1], [1, 'STD-004', 'available', 1], [1, 'STD-005', 'available', 1],
            // Superior Room (5 rooms)
            [2, 'SUP-001', 'available', 2], [2, 'SUP-002', 'available', 2], [2, 'SUP-003', 'available', 2], [2, 'SUP-004', 'available', 2], [2, 'SUP-005', 'available', 2],
            // Deluxe Room (5 rooms)
            [3, 'DLX-001', 'available', 3], [3, 'DLX-002', 'available', 3], [3, 'DLX-003', 'available', 3], [3, 'DLX-004', 'available', 3], [3, 'DLX-005', 'available', 3],
            // Suite Room (5 rooms)
            [4, 'STE-001', 'available', 4], [4, 'STE-002', 'available', 4], [4, 'STE-003', 'available', 4], [4, 'STE-004', 'available', 4], [4, 'STE-005', 'available', 4],
            // Share Room (5 rooms)
            [5, 'SHR-001', 'available', 1], [5, 'SHR-002', 'available', 1], [5, 'SHR-003', 'available', 1], [5, 'SHR-004', 'available', 1], [5, 'SHR-005', 'available', 1],
            // Large Room (5 rooms)
            [6, 'LRG-001', 'available', 5], [6, 'LRG-002', 'available', 5], [6, 'LRG-003', 'available', 5], [6, 'LRG-004', 'available', 5], [6, 'LRG-005', 'available', 5],
            // President Room (5 rooms)
            [7, 'PRE-001', 'available', 6], [7, 'PRE-002', 'available', 6], [7, 'PRE-003', 'available', 6], [7, 'PRE-004', 'available', 6], [7, 'PRE-005', 'available', 6]
        ];
        
        for (const room of rooms) {
            try {
                await connection.execute(
                    'INSERT INTO rooms (room_type_id, room_number, status, floor) VALUES (?, ?, ?, ?)',
                    room
                );
            } catch (err) {
                if (!err.message.includes('Duplicate entry')) {
                    console.warn(`Warning for room ${room[1]}:`, err.message);
                }
            }
        }
        
        const [count] = await connection.execute('SELECT COUNT(*) as total FROM rooms');
        console.log(`✅ Done! Total rooms: ${count[0].total}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

addRooms();