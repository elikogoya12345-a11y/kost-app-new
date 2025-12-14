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