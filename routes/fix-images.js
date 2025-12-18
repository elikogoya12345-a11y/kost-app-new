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

module.exports = router;