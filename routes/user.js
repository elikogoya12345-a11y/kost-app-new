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
            SELECT IFNULL(SUM(p.amount), 0) as total_paid 
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
            GROUP BY rt.id, rt.name, rt.base_price, rt.description, rt.facilities, rt.image_url
            HAVING available_rooms > 0
            ORDER BY rt.base_price
        `);
        
        const defaultImages = {
            'Standard Room': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
            'Superior Room': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop',
            'Deluxe Room': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop',
            'Suite Room': 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=600&h=400&fit=crop',
            'Share Room': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
            'Large Room': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop',
            'President Room': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop'
        };
        
        roomTypes.forEach(roomType => {
            if (!roomType.image_url) {
                roomType.image_url = defaultImages[roomType.name] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop';
            }
        });
        
        const isBookingMode = req.query.booking === 'true';
        res.render('user/rooms', { user: req.session.user, roomTypes, booking: isBookingMode });
    } catch (error) {
        console.error(error);
        const isBookingMode = req.query.booking === 'true';
        res.render('user/rooms', { user: req.session.user, roomTypes: [], booking: isBookingMode });
    }
});

router.get('/rooms/:typeId', async (req, res) => {
    try {
        const [rooms] = await db.execute(`
            SELECT r.*, rt.name as type_name, rt.base_price, rt.facilities, rt.image_url as type_image_url
            FROM rooms r
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE rt.id = ?
            ORDER BY r.room_number
        `, [req.params.typeId]);
        
        const [roomType] = await db.execute('SELECT * FROM room_types WHERE id = ?', [req.params.typeId]);
        
        const defaultImages = {
            'Standard Room': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
            'Superior Room': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop',
            'Deluxe Room': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop',
            'Suite Room': 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=600&h=400&fit=crop',
            'Share Room': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
            'Large Room': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop',
            'President Room': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop'
        };
        
        if (roomType.length > 0) {
            const rt = roomType[0];
            if (!rt.image_url) {
                rt.image_url = defaultImages[rt.name] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop';
            }
        }
        
        rooms.forEach(room => {
            if (!room.type_image_url) {
                room.type_image_url = defaultImages[room.type_name] || 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop';
            }
        });
        
        const isBookingMode = req.query.booking === 'true';
        res.render('user/room-list', { 
            user: req.session.user, 
            rooms, 
            roomType: roomType[0] || null,
            booking: isBookingMode
        });
    } catch (error) {
        console.error(error);
        const isBookingMode = req.query.booking === 'true';
        res.render('user/room-list', { user: req.session.user, rooms: [], roomType: null, booking: isBookingMode });
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

// Redirect to multi-booking
router.get('/booking', (req, res) => {
    res.redirect('/user/bookings');
});

// Single room booking redirect
router.get('/book/:roomId', (req, res) => {
    res.redirect(`/user/bookings?room=${req.params.roomId}`);
});

// Quick access redirects
router.get('/room-types', (req, res) => {
    res.redirect('/user/rooms');
});

router.get('/payment-history', (req, res) => {
    res.redirect('/user/payments');
});

router.get('/complaint', (req, res) => {
    res.redirect('/user/complaints');
});

router.get('/api/available-rooms', async (req, res) => {
    try {
        const [rooms] = await db.execute(`
            SELECT r.*, rt.name as type_name, rt.base_price, rt.id as room_type_id
            FROM rooms r
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE r.status = 'available'
            ORDER BY rt.name, r.room_number
        `);
        
        res.json({ rooms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal memuat kamar' });
    }
});



router.get('/bookings', async (req, res) => {
    try {
        const [rooms] = await db.execute(`
            SELECT r.*, rt.name as type_name, rt.base_price, rt.id as room_type_id
            FROM rooms r
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE r.status = 'available'
            ORDER BY rt.name, r.room_number
        `);
        
        const success = req.query.success;
        const error = req.query.error;
        
        res.render('user/single-booking', { 
            user: req.session.user, 
            rooms,
            success,
            error
        });
    } catch (error) {
        console.error(error);
        res.render('user/single-booking', { 
            user: req.session.user, 
            rooms: [],
            success: null,
            error: 'Gagal memuat kamar'
        });
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
        
        console.log('Complaint data:', { title, category, priority, facility_type, description });
        
        const [userRoom] = await db.execute(`
            SELECT r.id as room_id FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            WHERE b.user_id = ? AND b.status = 'confirmed'
            ORDER BY b.created_at DESC LIMIT 1
        `, [userId]);
        
        const roomId = userRoom.length > 0 ? userRoom[0].room_id : null;
        
        // Check if complaints table has priority column
        try {
            await db.execute(
                'INSERT INTO complaints (user_id, room_id, facility, description, status, priority) VALUES (?, ?, ?, ?, ?, ?)',
                [userId, roomId, facility_type || category, description, 'pending', priority || 'medium']
            );
        } catch (error) {
            // Fallback if priority column doesn't exist
            console.log('Priority column might not exist, using basic insert');
            await db.execute(
                'INSERT INTO complaints (user_id, room_id, facility, description, status) VALUES (?, ?, ?, ?, ?)',
                [userId, roomId, facility_type || category, description, 'pending']
            );
        }
        
        res.redirect('/user/complaints?success=Pengaduan berhasil dikirim!');
    } catch (error) {
        console.error('Complaint error:', error);
        res.redirect('/user/complaints?error=Gagal mengirim pengaduan');
    }
});

// Payment extension request
router.post('/payment-extension', async (req, res) => {
    try {
        const { reason, planned_date } = req.body;
        const userId = req.session.user.id;
        
        // Create notification for admin
        await db.execute(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [null, 'Pengajuan Perpanjangan Pembayaran', `User ${req.session.user.name} mengajukan perpanjangan pembayaran. Alasan: ${reason}. Rencana bayar: ${planned_date}`, 'payment_extension']
        );
        
        res.redirect('/user/dashboard?success=Pengajuan perpanjangan pembayaran berhasil dikirim');
    } catch (error) {
        console.error(error);
        res.redirect('/user/dashboard?error=Gagal mengirim pengajuan');
    }
});





router.post('/booking', async (req, res) => {
    try {
        const { room_id, room_type_id, start_date, duration_months, notes } = req.body;
        const userId = req.session.user.id;
        
        if (!room_id || !room_type_id || !start_date || !duration_months) {
            return res.redirect('/user/bookings?error=Data tidak lengkap');
        }
        
        // Get room price
        const [roomData] = await db.execute(
            'SELECT rt.base_price FROM room_types rt WHERE rt.id = ?',
            [room_type_id]
        );
        
        if (roomData.length === 0) {
            return res.redirect('/user/bookings?error=Tipe kamar tidak ditemukan');
        }
        
        const monthlyPrice = roomData[0].base_price;
        const totalAmount = monthlyPrice * duration_months;
        
        // Create booking
        await db.execute(
            'INSERT INTO bookings (user_id, room_id, room_type_id, start_date, duration_months, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, room_id, room_type_id, start_date, duration_months, totalAmount, 'confirmed']
        );
        
        // Update room status
        await db.execute('UPDATE rooms SET status = ? WHERE id = ?', ['occupied', room_id]);
        
        // Create occupant
        const endDate = new Date(start_date);
        endDate.setMonth(endDate.getMonth() + parseInt(duration_months));
        
        const [occupantResult] = await db.execute(
            'INSERT INTO occupants (user_id, room_id, start_date, end_date, monthly_rent, status) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, room_id, start_date, endDate.toISOString().slice(0, 10), monthlyPrice, 'active']
        );
        
        const occupantId = occupantResult.insertId;
        
        // Create payment schedule
        for (let i = 0; i < duration_months; i++) {
            const dueDate = new Date(start_date);
            dueDate.setMonth(dueDate.getMonth() + i);
            dueDate.setDate(10);
            
            await db.execute(
                'INSERT INTO payments (occupant_id, amount, due_date, status) VALUES (?, ?, ?, ?)',
                [occupantId, monthlyPrice, dueDate.toISOString().slice(0, 10), 'pending']
            );
        }
        
        res.redirect('/user/payments?success=Booking berhasil! Silakan lakukan pembayaran.');
    } catch (error) {
        console.error('Booking error:', error);
        res.redirect('/user/bookings?error=Gagal melakukan booking');
    }
});



router.get('/bookings/:id/print', async (req, res) => {
    try {
        const multiBookingId = req.params.id;
        const userId = req.session.user.id;
        
        const [multiBooking] = await db.execute(`
            SELECT mb.*, u.name as user_name, u.email, u.phone
            FROM multi_bookings mb
            JOIN users u ON mb.user_id = u.id
            WHERE mb.id = ? AND mb.user_id = ?
        `, [multiBookingId, userId]);
        
        if (multiBooking.length === 0) {
            return res.redirect('/user/bookings?error=Booking tidak ditemukan');
        }
        
        const [bookings] = await db.execute(`
            SELECT b.*, r.room_number, rt.name as room_type, rt.base_price
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE b.multi_booking_id = ?
        `, [multiBookingId]);
        
        res.render('user/booking-receipt', { 
            user: req.session.user, 
            multiBooking: multiBooking[0],
            bookings
        });
    } catch (error) {
        console.error(error);
        res.redirect('/user/bookings?error=Gagal memuat bukti booking');
    }
});

module.exports = router;