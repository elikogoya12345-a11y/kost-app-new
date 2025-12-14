const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/dashboard', async (req, res) => {
    try {
        const [roomTypes] = await db.execute(`
            SELECT rt.*, COUNT(r.id) as total_rooms,
            COUNT(CASE WHEN r.status = 'available' THEN 1 END) as available_rooms
            FROM room_types rt
            LEFT JOIN rooms r ON rt.id = r.room_type_id
            GROUP BY rt.id
            ORDER BY rt.base_price
        `);
        
        res.render('guest/dashboard', { roomTypes });
    } catch (error) {
        console.error(error);
        res.render('guest/dashboard', { roomTypes: [] });
    }
});

router.get('/rooms/:typeId', (req, res) => {
    res.redirect('/auth/register?message=Silakan daftar untuk melihat detail kamar');
});

module.exports = router;