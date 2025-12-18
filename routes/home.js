const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/', async (req, res) => {
    try {
        const [roomTypes] = await db.execute(`
            SELECT rt.*, COUNT(r.id) as total_rooms,
            COUNT(CASE WHEN r.status = 'available' THEN 1 END) as available_rooms
            FROM room_types rt
            LEFT JOIN rooms r ON rt.id = r.room_type_id
            GROUP BY rt.id
            LIMIT 6
        `);
        
        // Add default images for each room type
        const defaultImages = {
            'Standard Room': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop', // Simple modern room
            'Superior Room': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop', // Elegant bedroom
            'Deluxe Room': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop', // Luxury bedroom
            'Suite Room': 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=600&h=400&fit=crop', // Premium suite
            'Share Room': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop', // Shared bedroom with 2 beds
            'Twin Room': 'https://images.unsplash.com/photo-1540518614846-7eded47432f5?w=600&h=400&fit=crop', // Twin beds room
            'Large Room': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop', // Large spacious room
            'President Room': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop' // Presidential suite
        };
        
        roomTypes.forEach(roomType => {
            if (!roomType.image_url) {
                roomType.image_url = defaultImages[roomType.name] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop';
            }
        });
        
        res.render('home/index', { 
            roomTypes,
            user: req.session.user || null
        });
    } catch (error) {
        console.error(error);
        res.render('home/index', { 
            roomTypes: [],
            user: req.session.user || null
        });
    }
});

router.get('/about', (req, res) => {
    res.render('about');
});

module.exports = router;