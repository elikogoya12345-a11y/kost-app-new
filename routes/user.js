const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireUser } = require('../middleware/auth');

router.use(requireUser);

// Dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        const [payments] = await db.execute(`
            SELECT COALESCE(SUM(p.amount), 0) as total_paid 
            FROM payments p
            JOIN occupants o ON p.occupant_id = o.id
            WHERE o.user_id = ? AND p.status = 'paid'
        `, [userId]);
        
        const [nextPayment] = await db.execute(`
            SELECT p.*, r.room_number, rt.name as room_type
            FROM payments p
            JOIN occupants o ON p.occupant_id = o.id
            JOIN rooms r ON o.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE o.user_id = ? AND p.status = 'pending' 
            ORDER BY p.due_date LIMIT 1
        `, [userId]);
        
        const [totalPayments] = await db.execute(`
            SELECT COUNT(*) as total_count 
            FROM payments p
            JOIN occupants o ON p.occupant_id = o.id
            WHERE o.user_id = ?
        `, [userId]);
        
        const [notifications] = await db.execute(`
            SELECT * FROM notifications WHERE user_id IS NULL OR user_id = ? 
            ORDER BY created_at DESC LIMIT 5
        `, [userId]);
        
        res.render('user/dashboard', {
            user: req.session.user,
            totalPaid: payments[0].total_paid,
            nextPayment: nextPayment[0] || null,
            hasPayments: totalPayments[0].total_count > 0,
            notifications
        });
    } catch (error) {
        console.error(error);
        res.render('user/dashboard', { user: req.session.user, totalPaid: 0, nextPayment: null, hasPayments: false, notifications: [] });
    }
});

// Room Management
router.get('/rooms', async (req, res) => {
    try {
        const [roomTypes] = await db.execute(`
            SELECT rt.*, COUNT(r.id) as total_rooms,
            COUNT(CASE WHEN r.status = 'available' THEN 1 END) as available_rooms
            FROM room_types rt
            LEFT JOIN rooms r ON rt.id = r.room_type_id
            GROUP BY rt.id
            ORDER BY rt.base_price
        `);
        
        res.render('user/rooms', { user: req.session.user, roomTypes });
    } catch (error) {
        console.error(error);
        res.render('user/rooms', { user: req.session.user, roomTypes: [] });
    }
});

router.get('/rooms/:typeId', async (req, res) => {
    try {
        const [rooms] = await db.execute(`
            SELECT r.*, rt.name as type_name, rt.base_price, rt.facilities
            FROM rooms r
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE rt.id = ?
            ORDER BY r.room_number
        `, [req.params.typeId]);
        
        const [roomType] = await db.execute('SELECT * FROM room_types WHERE id = ?', [req.params.typeId]);
        
        res.render('user/room-list', { 
            user: req.session.user, 
            rooms, 
            roomType: roomType[0] || null 
        });
    } catch (error) {
        console.error(error);
        res.render('user/room-list', { user: req.session.user, rooms: [], roomType: null });
    }
});

// Payment Reports
router.get('/payments', async (req, res) => {
    try {
        const [payments] = await db.execute(`
            SELECT p.*, r.room_number, rt.name as room_type
            FROM payments p
            JOIN occupants o ON p.occupant_id = o.id
            JOIN rooms r ON o.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE o.user_id = ? 
            ORDER BY p.due_date DESC
        `, [req.session.user.id]);
        
        const success = req.query.success;
        res.render('user/payments', { user: req.session.user, payments, success });
    } catch (error) {
        console.error(error);
        res.render('user/payments', { user: req.session.user, payments: [], success: null });
    }
});

router.post('/payments/:id/pay', async (req, res) => {
    try {
        const paymentId = req.params.id;
        const currentDate = new Date().toISOString().slice(0, 10);
        
        await db.execute(
            'UPDATE payments SET status = ?, payment_date = ? WHERE id = ?',
            ['paid', currentDate, paymentId]
        );
        
        res.redirect('/user/payments?success=Pembayaran berhasil dikonfirmasi');
    } catch (error) {
        console.error(error);
        res.redirect('/user/payments?error=Gagal mengkonfirmasi pembayaran');
    }
});

// Booking
router.post('/booking', async (req, res) => {
    try {
        const { room_id, room_type_id, start_date, duration_months, total_amount } = req.body;
        const userId = req.session.user.id;
        
        await db.execute(
            'INSERT INTO bookings (user_id, room_id, room_type_id, start_date, duration_months, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, room_id, room_type_id, start_date, duration_months, total_amount, 'pending']
        );
        
        res.redirect('/user/bookings?success=Booking berhasil! Menunggu konfirmasi admin.');
    } catch (error) {
        console.error(error);
        res.redirect('/user/rooms?error=Gagal melakukan booking');
    }
});

// Confirm booking
router.post('/bookings/:id/confirm', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.session.user.id;
        
        const [booking] = await db.execute(
            'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
            [bookingId, userId]
        );
        
        if (booking.length === 0) {
            return res.redirect('/user/bookings?error=Booking tidak ditemukan');
        }
        
        await db.execute('UPDATE bookings SET status = ? WHERE id = ?', ['confirmed', bookingId]);
        await db.execute('UPDATE rooms SET status = ? WHERE id = ?', ['occupied', booking[0].room_id]);
        
        res.redirect('/user/bookings?success=Booking dikonfirmasi!');
    } catch (error) {
        console.error(error);
        res.redirect('/user/bookings?error=Gagal mengkonfirmasi booking');
    }
});

router.get('/bookings', async (req, res) => {
    try {
        const [bookings] = await db.execute(`
            SELECT b.*, r.room_number, rt.name as room_type, rt.base_price
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE b.user_id = ?
            ORDER BY b.created_at DESC
        `, [req.session.user.id]);
        
        const success = req.query.success;
        res.render('user/bookings', { user: req.session.user, bookings, success });
    } catch (error) {
        console.error(error);
        res.render('user/bookings', { user: req.session.user, bookings: [], success: null });
    }
});

// Complaints
router.get('/complaints', async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        const [userRoom] = await db.execute(`
            SELECT r.*, rt.name as room_type, rt.facilities
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE b.user_id = ? AND b.status = 'confirmed'
            ORDER BY b.created_at DESC LIMIT 1
        `, [userId]);
        
        const [complaints] = await db.execute(`
            SELECT * FROM complaints WHERE user_id = ? ORDER BY created_at DESC
        `, [userId]);
        
        const success = req.query.success;
        res.render('user/complaints', { 
            user: req.session.user, 
            userRoom: userRoom[0] || null,
            complaints,
            success
        });
    } catch (error) {
        console.error(error);
        res.render('user/complaints', { user: req.session.user, userRoom: null, complaints: [], success: null });
    }
});

router.post('/complaints', async (req, res) => {
    try {
        const { title, category, priority, facility_type, description } = req.body;
        const userId = req.session.user.id;
        
        const [userRoom] = await db.execute(`
            SELECT r.id as room_id FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            WHERE b.user_id = ? AND b.status = 'confirmed'
            ORDER BY b.created_at DESC LIMIT 1
        `, [userId]);
        
        const roomId = userRoom.length > 0 ? userRoom[0].room_id : null;
        
        await db.execute(
            'INSERT INTO complaints (user_id, room_id, facility, description, status) VALUES (?, ?, ?, ?, ?)',
            [userId, roomId, facility_type || category, description, 'pending']
        );
        
        res.redirect('/user/complaints?success=Pengaduan berhasil dikirim!');
    } catch (error) {
        console.error(error);
        res.redirect('/user/complaints?error=Gagal mengirim pengaduan');
    }
});

module.exports = router;