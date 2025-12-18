const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Route untuk fix gambar dan create missing rooms
router.get('/fix-images-now', async (req, res) => {
    try {
        // 1. Update semua tipe kamar dengan gambar yang pasti ada
        const imageUpdates = [
            ['Standard Room', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop'],
            ['Superior Room', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop'],
            ['Deluxe Room', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop'],
            ['Suite Room', 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=600&h=400&fit=crop'],
            ['Share Room', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop'],
            ['Twin Room', 'https://images.unsplash.com/photo-1540518614846-7eded47432f5?w=600&h=400&fit=crop'],
            ['Large Room', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop'],
            ['President Room', 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop']
        ];

        let updated = 0;
        for (const [roomName, imageUrl] of imageUpdates) {
            const result = await db.execute(
                'UPDATE room_types SET image_url = ? WHERE name = ?',
                [imageUrl, roomName]
            );
            if (result[0].affectedRows > 0) updated++;
        }

        // 2. Create missing rooms for each room type
        const roomsToCreate = [
            {name: 'Standard Room', prefix: 'STD', count: 10},
            {name: 'Superior Room', prefix: 'SUP', count: 12},
            {name: 'Deluxe Room', prefix: 'DLX', count: 15},
            {name: 'Suite Room', prefix: 'STE', count: 8},
            {name: 'Share Room', prefix: 'SHR', count: 20},
            {name: 'Twin Room', prefix: 'TWN', count: 10},
            {name: 'Large Room', prefix: 'LRG', count: 8},
            {name: 'President Room', prefix: 'PRE', count: 5}
        ];

        let roomsCreated = 0;
        for (const roomType of roomsToCreate) {
            // Get room type ID
            const [typeResult] = await db.execute('SELECT id FROM room_types WHERE name = ?', [roomType.name]);
            if (typeResult.length === 0) continue;
            
            const typeId = typeResult[0].id;
            
            // Check existing rooms count
            const [existingRooms] = await db.execute('SELECT COUNT(*) as count FROM rooms WHERE room_type_id = ?', [typeId]);
            const existingCount = existingRooms[0].count;
            
            // Create missing rooms
            for (let i = existingCount + 1; i <= roomType.count; i++) {
                const roomNumber = `${roomType.prefix}-${i.toString().padStart(3, '0')}`;
                await db.execute(
                    'INSERT INTO rooms (room_type_id, room_number, status, floor) VALUES (?, ?, ?, ?)',
                    [typeId, roomNumber, 'available', Math.ceil(i / 10)]
                );
                roomsCreated++;
            }
        }

        res.json({
            success: true,
            message: `✅ BERHASIL! ${updated} gambar diupdate, ${roomsCreated} kamar baru dibuat`,
            imagesUpdated: updated,
            roomsCreated: roomsCreated,
            total: imageUpdates.length
        });

    } catch (error) {
        console.error('Error:', error);
        res.json({
            success: false,
            message: '❌ Error: ' + error.message,
            error: error.message
        });
    }
});

// Route khusus untuk debug Twin Room
router.get('/debug-twin-room', async (req, res) => {
    try {
        // Cek room type Twin Room
        const [roomTypes] = await db.execute('SELECT * FROM room_types WHERE name = "Twin Room"');
        
        // Cek rooms untuk Twin Room
        const [rooms] = await db.execute(`
            SELECT r.*, rt.name as type_name 
            FROM rooms r 
            JOIN room_types rt ON r.room_type_id = rt.id 
            WHERE rt.name = "Twin Room"
        `);
        
        res.json({
            roomType: roomTypes,
            rooms: rooms,
            roomTypeCount: roomTypes.length,
            roomsCount: rooms.length
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Route untuk force create Twin Room
router.get('/force-create-twin-room', async (req, res) => {
    try {
        // Get Twin Room type ID
        const [typeResult] = await db.execute("SELECT id FROM room_types WHERE name = 'Twin Room'");
        
        if (typeResult.length === 0) {
            return res.json({ 
                success: false, 
                message: 'Twin Room type tidak ditemukan di database'
            });
        }
        
        const typeId = typeResult[0].id;
        
        // Delete existing Twin Room rooms first
        await db.execute('DELETE FROM rooms WHERE room_type_id = ?', [typeId]);
        
        // Create 10 Twin Room rooms
        let created = 0;
        for (let i = 1; i <= 10; i++) {
            const roomNumber = `TWN-${String(i).padStart(3, '0')}`;
            const floor = Math.ceil(i / 10);
            
            await db.execute(
                'INSERT INTO rooms (room_type_id, room_number, status, floor) VALUES (?, ?, ?, ?)',
                [typeId, roomNumber, 'available', floor]
            );
            created++;
        }
        
        // Verify creation
        const [verifyResult] = await db.execute('SELECT COUNT(*) as count FROM rooms WHERE room_type_id = ?', [typeId]);
        
        res.json({
            success: true,
            message: `Twin Room berhasil dibuat: ${created} kamar`,
            created: created,
            verified: verifyResult[0].count
        });
        
    } catch (error) {
        console.error('Twin Room Error:', error);
        res.json({ 
            success: false, 
            message: 'Database error: ' + error.message,
            error: error.message 
        });
    }
});

module.exports = router;