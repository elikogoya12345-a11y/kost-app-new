const db = require('./models/db');

async function fixImages() {
    try {
        // Update semua tipe kamar dengan gambar yang pasti ada
        await db.execute(`UPDATE room_types SET image_url = 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop' WHERE name = 'Standard Room'`);
        await db.execute(`UPDATE room_types SET image_url = 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop' WHERE name = 'Superior Room'`);
        await db.execute(`UPDATE room_types SET image_url = 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop' WHERE name = 'Deluxe Room'`);
        await db.execute(`UPDATE room_types SET image_url = 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=600&h=400&fit=crop' WHERE name = 'Suite Room'`);
        await db.execute(`UPDATE room_types SET image_url = 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop' WHERE name = 'Share Room'`);
        await db.execute(`UPDATE room_types SET image_url = 'https://images.unsplash.com/photo-1540518614846-7eded47432f5?w=600&h=400&fit=crop' WHERE name = 'Twin Room'`);
        
        console.log('✅ BERHASIL! Semua gambar sudah diupdate ke database');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixImages();