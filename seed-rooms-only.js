const mysql = require('mysql2/promise');
require('dotenv').config();

async function seedRooms() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'kost_professional'
        });
        
        console.log('🔄 Connected to database');
        
        // First ensure room types exist
        const roomTypes = [
            [1, 'Standard Room', 1000000, 'Kamar standar dengan fasilitas dasar', '["AC", "WiFi", "Kasur Single", "Lemari"]'],
            [2, 'Superior Room', 1200000, 'Kamar superior dengan fasilitas lengkap', '["AC", "WiFi", "Kasur Queen", "Lemari", "Meja Kerja"]'],
            [3, 'Deluxe Room', 1500000, 'Kamar deluxe dengan fasilitas premium', '["AC", "WiFi", "Kasur King", "Lemari", "Meja Kerja", "TV"]'],
            [4, 'Suite Room', 1800000, 'Kamar suite dengan fasilitas mewah', '["AC", "WiFi", "Kasur King", "Lemari", "Meja Kerja", "TV", "Kulkas Mini"]'],
            [5, 'Share Room', 800000, 'Kamar berbagi dengan 2 kasur', '["AC", "WiFi", "2 Kasur Single", "Lemari Bersama"]'],
            [6, 'Large Room', 2000000, 'Kamar besar dengan ruang luas', '["AC", "WiFi", "Kasur King", "Lemari Besar", "Meja Kerja", "TV", "Sofa"]'],
            [7, 'President Room', 2500000, 'Kamar presiden dengan fasilitas terlengkap', '["AC", "WiFi", "Kasur King", "Walk-in Closet", "Meja Kerja", "TV 55 inch", "Kulkas", "Sofa", "Balkon"]']
        ];
        
        for (const [id, name, price, desc, facilities] of roomTypes) {
            try {
                await connection.execute(
                    'INSERT INTO room_types (id, name, base_price, description, facilities) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE base_price = VALUES(base_price), description = VALUES(description), facilities = VALUES(facilities)',
                    [id, name, price, desc, facilities]
                );
            } catch (err) {
                console.log(`Room type ${name} already exists or updated`);
            }
        }
        
        console.log('✅ Room types ready');
        
        // Add 35 rooms
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
        
        let added = 0;
        for (const [room_type_id, room_number, status, floor] of rooms) {
            try {
                await connection.execute(
                    'INSERT INTO rooms (room_type_id, room_number, status, floor) VALUES (?, ?, ?, ?)',
                    [room_type_id, room_number, status, floor]
                );
                added++;
            } catch (err) {
                if (!err.message.includes('Duplicate entry')) {
                    console.warn(`Warning for room ${room_number}:`, err.message);
                }
            }
        }
        
        const [count] = await connection.execute('SELECT COUNT(*) as total FROM rooms');
        console.log(`✅ Done! Added ${added} new rooms. Total rooms: ${count[0].total}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) await connection.end();
    }
}

seedRooms();