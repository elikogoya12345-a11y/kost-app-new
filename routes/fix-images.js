const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Route untuk fix gambar langsung ke database
router.get('/fix-images-now', async (req, res) => {
    try {
        // Update semua tipe kamar dengan gambar yang pasti ada
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

        res.json({
            success: true,
            message: `✅ BERHASIL! ${updated} tipe kamar berhasil diupdate dengan gambar`,
            updated: updated,
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