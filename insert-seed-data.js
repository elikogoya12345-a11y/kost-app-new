const mysql = require('mysql2/promise');
require('dotenv').config();

async function insertSeedData() {
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
        
        // Insert admin user (Password: admin123)
        console.log('Inserting admin user...');
        try {
            await connection.execute(`
                INSERT INTO users (name, username, email, password, role) VALUES 
                ('Administrator', 'admin', 'admin@kostapp.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', 'admin')
                ON DUPLICATE KEY UPDATE password = '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra'
            `);
            console.log('✅ Admin user inserted');
        } catch (error) {
            console.log('Admin user already exists or error:', error.message);
        }

        // Insert room types
        console.log('Inserting room types...');
        const roomTypes = [
            ['Standard Room', 1000000, 'Kamar standar dengan fasilitas dasar', '["AC", "WiFi", "Kasur Single", "Lemari"]', '/images/Standard-room/Standard-room.jpg'],
            ['Superior Room', 1200000, 'Kamar superior dengan fasilitas lengkap', '["AC", "WiFi", "Kasur Queen", "Lemari", "Meja Kerja"]', '/images/Superior-room/Superior-room.jpg'],
            ['Deluxe Room', 1500000, 'Kamar deluxe dengan fasilitas premium', '["AC", "WiFi", "Kasur King", "Lemari", "Meja Kerja", "TV"]', '/images/Deluxe-room/Deluxe-room.jpg'],
            ['Suite Room', 1800000, 'Kamar suite dengan fasilitas mewah', '["AC", "WiFi", "Kasur King", "Lemari", "Meja Kerja", "TV", "Kulkas Mini"]', '/images/Suite-room/Suite-room.jpg'],
            ['Share Room', 800000, 'Kamar berbagi dengan 2 kasur', '["AC", "WiFi", "2 Kasur Single", "Lemari Bersama"]', '/images/Share-room/Share-room.jpg'],
            ['Large Room', 2000000, 'Kamar besar dengan ruang luas', '["AC", "WiFi", "Kasur King", "Lemari Besar", "Meja Kerja", "TV", "Sofa"]', '/images/Large-room/Large-room.jpg'],
            ['President Room', 2500000, 'Kamar presiden dengan fasilitas terlengkap', '["AC", "WiFi", "Kasur King", "Walk-in Closet", "Meja Kerja", "TV 55 inch", "Kulkas", "Sofa", "Balkon"]', '/images/President-room/President-room.jpg']
        ];

        for (const roomType of roomTypes) {
            try {
                await connection.execute(
                    'INSERT INTO room_types (name, base_price, description, facilities, image_url) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE base_price = VALUES(base_price)',
                    roomType
                );
                console.log(`✅ Room type inserted: ${roomType[0]}`);
            } catch (error) {
                console.log(`Room type ${roomType[0]} error:`, error.message);
            }
        }

        // Insert sample users (Password: user123)
        console.log('Inserting sample users...');
        const users = [
            ['John Doe', 'johndoe', 'john@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567890', 'user'],
            ['Jane Smith', 'janesmith', 'jane@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567891', 'user'],
            ['Bob Wilson', 'bobwilson', 'bob@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567892', 'user'],
            ['Alice Johnson', 'alicejohnson', 'alice@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567893', 'user'],
            ['David Brown', 'davidbrown', 'david@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567894', 'user']
        ];

        for (const user of users) {
            try {
                await connection.execute(
                    'INSERT INTO users (name, username, email, password, phone, role) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE password = VALUES(password)',
                    user
                );
                console.log(`✅ User inserted: ${user[0]}`);
            } catch (error) {
                console.log(`User ${user[0]} error:`, error.message);
            }
        }

        // Insert rooms
        console.log('Inserting rooms...');
        const [roomTypesData] = await connection.execute('SELECT id, name FROM room_types');
        
        const roomsData = [
            ['Standard Room', 'STD-001', 1], ['Standard Room', 'STD-002', 1], ['Standard Room', 'STD-003', 1], ['Standard Room', 'STD-004', 1], ['Standard Room', 'STD-005', 1],
            ['Superior Room', 'SUP-001', 2], ['Superior Room', 'SUP-002', 2], ['Superior Room', 'SUP-003', 2], ['Superior Room', 'SUP-004', 2], ['Superior Room', 'SUP-005', 2],
            ['Deluxe Room', 'DLX-001', 3], ['Deluxe Room', 'DLX-002', 3], ['Deluxe Room', 'DLX-003', 3], ['Deluxe Room', 'DLX-004', 3], ['Deluxe Room', 'DLX-005', 3],
            ['Suite Room', 'STE-001', 4], ['Suite Room', 'STE-002', 4], ['Suite Room', 'STE-003', 4], ['Suite Room', 'STE-004', 4], ['Suite Room', 'STE-005', 4],
            ['Share Room', 'SHR-001', 1], ['Share Room', 'SHR-002', 1], ['Share Room', 'SHR-003', 1], ['Share Room', 'SHR-004', 1], ['Share Room', 'SHR-005', 1],
            ['Large Room', 'LRG-001', 5], ['Large Room', 'LRG-002', 5], ['Large Room', 'LRG-003', 5], ['Large Room', 'LRG-004', 5], ['Large Room', 'LRG-005', 5],
            ['President Room', 'PRE-001', 6], ['President Room', 'PRE-002', 6], ['President Room', 'PRE-003', 6], ['President Room', 'PRE-004', 6], ['President Room', 'PRE-005', 6]
        ];

        for (const roomData of roomsData) {
            const roomType = roomTypesData.find(rt => rt.name === roomData[0]);
            if (roomType) {
                try {
                    await connection.execute(
                        'INSERT INTO rooms (room_type_id, room_number, status, floor) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status)',
                        [roomType.id, roomData[1], 'available', roomData[2]]
                    );
                    console.log(`✅ Room inserted: ${roomData[1]}`);
                } catch (error) {
                    console.log(`Room ${roomData[1]} error:`, error.message);
                }
            }
        }

        // Insert notifications
        console.log('Inserting notifications...');
        try {
            await connection.execute(`
                INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
                (NULL, 'Selamat Datang', 'Selamat datang di Kost Professional! Sistem siap digunakan.', 'general', false),
                (NULL, 'Info Pembayaran', 'Pembayaran dapat dilakukan setiap tanggal 1-10 setiap bulannya.', 'payment', false)
                ON DUPLICATE KEY UPDATE title = VALUES(title)
            `);
            console.log('✅ Notifications inserted');
        } catch (error) {
            console.log('Notifications error:', error.message);
        }

        await connection.end();
        console.log('\n✅ Seed data insertion completed successfully!');
        
    } catch (error) {
        console.error('❌ Seed data insertion failed:', error);
        process.exit(1);
    }
}

insertSeedData();