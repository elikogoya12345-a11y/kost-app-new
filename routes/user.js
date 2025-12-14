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
            SELECT COALESCE(SUM(amount), 0) as total_paid 
            FROM payments WHERE user_id = ? AND status = 'paid'
        `, [userId]);
        
        const [nextPayment] = await db.execute(`
            SELECT p.*, r.room_number, rt.name as room_type
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN rooms r ON b.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE p.user_id = ? AND p.status = 'pending' 
            ORDER BY p.due_date LIMIT 1
        `, [userId]);
        
        const [totalPayments] = await db.execute(`
            SELECT COUNT(*) as total_count FROM payments WHERE user_id = ?
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
            SELECT p.*, b.duration_months, r.room_number, rt.name as room_type
            FROM payments p
            JOIN bookings b ON p.booking_id = b.id
            JOIN rooms r ON b.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE p.user_id = ? 
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
            'UPDATE payments SET status = ?, payment_date = ? WHERE id = ? AND user_id = ?',
            ['paid', currentDate, paymentId, req.session.user.id]
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
        const { room_id, start_date, duration_months, total_amount, notes } = req.body;
        const userId = req.session.user.id;
        
        await db.execute(
            'INSERT INTO bookings (user_id, room_id, start_date, duration_months, total_amount, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, room_id, start_date, duration_months, total_amount, notes || null, 'pending']
        );
        
        res.redirect('/user/bookings?success=Booking berhasil! Menunggu konfirmasi admin.');
    } catch (error) {
        console.error(error);
        res.redirect('/user/rooms?error=Gagal melakukan booking');
    }
});

// Confirm booking and create payments
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
        
        const bookingData = booking[0];
        const monthlyAmount = parseFloat(bookingData.total_amount) / parseInt(bookingData.duration_months);
        const startDateObj = new Date(bookingData.start_date);
        
        // Create payment records for each month
        for (let i = 0; i < parseInt(bookingData.duration_months); i++) {
            const paymentDate = new Date(startDateObj);
            paymentDate.setMonth(paymentDate.getMonth() + i);
            
            const dueDate = new Date(paymentDate);
            dueDate.setDate(dueDate.getDate() + 1); // Due date is 1 day after period start
            
            const monthYear = paymentDate.toISOString().slice(0, 7); // YYYY-MM format
            
            await db.execute(
                'INSERT INTO payments (user_id, booking_id, amount, due_date, month_year, status) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, bookingId, monthlyAmount, dueDate.toISOString().slice(0, 10), monthYear, 'pending']
            );
        }
        
        await db.execute('UPDATE bookings SET status = ? WHERE id = ?', ['confirmed', bookingId]);
        await db.execute('UPDATE rooms SET status = ? WHERE id = ?', ['occupied', bookingData.room_id]);
        
        res.redirect('/user/bookings?success=Booking dikonfirmasi! Pembayaran telah dibuat.');
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
            'INSERT INTO complaints (user_id, room_id, title, category, priority, description, facility_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, roomId, title, category, priority, description, facility_type || null, 'open']
        );
        
        res.redirect('/user/complaints?success=Pengaduan berhasil dikirim! Admin akan segera menindaklanjuti.');
    } catch (error) {
        console.error(error);
        res.redirect('/user/complaints?error=Gagal mengirim pengaduan');
    }
});

// Payment Extension Request
router.post('/payment-extension', async (req, res) => {
    try {
        const { reason, planned_date } = req.body;
        const userId = req.session.user.id;
        
        const [userRoom] = await db.execute(`
            SELECT r.id as room_id FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            WHERE b.user_id = ? AND b.status = 'confirmed'
            ORDER BY b.created_at DESC LIMIT 1
        `, [userId]);
        
        const roomId = userRoom.length > 0 ? userRoom[0].room_id : null;
        const title = 'Pengajuan Perpanjangan Pembayaran';
        const description = `Alasan: ${reason}\n\nRencana tanggal bayar: ${new Date(planned_date).toLocaleDateString('id-ID')}`;
        
        await db.execute(
            'INSERT INTO complaints (user_id, room_id, title, category, priority, description, facility_type, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [userId, roomId, title, 'Pembayaran', 'medium', description, 'Perpanjangan Pembayaran', 'open']
        );
        
        res.redirect('/user/dashboard?success=Pengajuan perpanjangan pembayaran berhasil dikirim! Tunggu konfirmasi admin.');
    } catch (error) {
        console.error(error);
        res.redirect('/user/dashboard?error=Gagal mengirim pengajuan perpanjangan pembayaran');
    }
});

module.exports = router;