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
            WHERE rt.name != 'Twin Room'
            GROUP BY rt.id
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
        
        res.render('user/rooms', { user: req.session.user, roomTypes });
    } catch (error) {
        console.error(error);
        res.render('user/rooms', { user: req.session.user, roomTypes: [] });
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
        const { room_id, start_date, duration_months, total_amount } = req.body;
        const userId = req.session.user.id;
        
        // Get room details
        const [room] = await db.execute('SELECT r.*, rt.id as room_type_id, rt.base_price FROM rooms r JOIN room_types rt ON r.room_type_id = rt.id WHERE r.id = ?', [room_id]);
        if (room.length === 0 || room[0].status !== 'available') {
            return res.redirect('/user/rooms?error=Kamar tidak tersedia');
        }
        
        // Create booking
        const [result] = await db.execute(
            'INSERT INTO bookings (user_id, room_id, room_type_id, start_date, duration_months, total_amount, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, room_id, room[0].room_type_id, start_date, duration_months, total_amount, 'confirmed']
        );
        
        // Update room status to occupied
        await db.execute('UPDATE rooms SET status = ? WHERE id = ?', ['occupied', room_id]);
        
        res.redirect('/user/bookings?success=Booking berhasil! Silakan aktifkan pembayaran.');
    } catch (error) {
        console.error(error);
        res.redirect('/user/rooms?error=Gagal melakukan booking');
    }
});

// Activate occupancy after booking
router.post('/bookings/:id/activate', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.session.user.id;
        
        const [booking] = await db.execute(
            'SELECT b.*, rt.base_price FROM bookings b JOIN room_types rt ON b.room_type_id = rt.id WHERE b.id = ? AND b.user_id = ?',
            [bookingId, userId]
        );
        
        if (booking.length === 0) {
            return res.redirect('/user/bookings?error=Booking tidak ditemukan');
        }
        
        const bookingData = booking[0];
        const endDate = new Date(bookingData.start_date);
        endDate.setMonth(endDate.getMonth() + parseInt(bookingData.duration_months));
        
        // Create occupant record
        const [result] = await db.execute(
            'INSERT INTO occupants (user_id, room_id, start_date, end_date, monthly_rent, status) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, bookingData.room_id, bookingData.start_date, endDate.toISOString().slice(0, 10), bookingData.base_price, 'active']
        );
        
        const occupantId = result.insertId;
        
        // Create monthly payment records
        const startDate = new Date(bookingData.start_date);
        for (let i = 0; i < bookingData.duration_months; i++) {
            const dueDate = new Date(startDate);
            dueDate.setMonth(dueDate.getMonth() + i);
            dueDate.setDate(10); // Due date on 10th of each month
            
            await db.execute(
                'INSERT INTO payments (occupant_id, amount, due_date, status) VALUES (?, ?, ?, ?)',
                [occupantId, bookingData.base_price, dueDate.toISOString().slice(0, 10), 'pending']
            );
        }
        
        res.redirect('/user/payments?success=Pembayaran berhasil diaktifkan! Lihat riwayat pembayaran Anda.');
    } catch (error) {
        console.error(error);
        res.redirect('/user/bookings?error=Gagal mengaktifkan pembayaran');
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

// Print booking receipt
router.get('/bookings/:id/print', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.session.user.id;
        
        const [booking] = await db.execute(`
            SELECT b.*, r.room_number, rt.name as room_type, rt.base_price, u.name as user_name, u.email, u.phone
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            JOIN users u ON b.user_id = u.id
            WHERE b.id = ? AND b.user_id = ?
        `, [bookingId, userId]);
        
        if (booking.length === 0) {
            return res.redirect('/user/bookings?error=Booking tidak ditemukan');
        }
        
        res.render('user/booking-receipt', { 
            user: req.session.user, 
            booking: booking[0]
        });
    } catch (error) {
        console.error(error);
        res.redirect('/user/bookings?error=Gagal memuat bukti booking');
    }
});

module.exports = router;