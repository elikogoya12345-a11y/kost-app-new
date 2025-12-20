const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireUser } = require('../middleware/auth');
const RealtimeService = require('../services/realtime');

router.use(requireUser);

// Initialize realtime service
router.use((req, res, next) => {
    const io = req.app.get('io');
    req.realtimeService = new RealtimeService(io);
    next();
});

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
        const userId = req.session.user.id;
        console.log('Loading payments for user:', userId);
        
        // Get payments for user - handle case where user might not have occupants yet
        const [payments] = await db.execute(`
            SELECT p.*, r.room_number, rt.name as room_type,
                   CONCAT(MONTHNAME(p.due_date), ' ', YEAR(p.due_date)) as month_year
            FROM payments p
            JOIN occupants o ON p.occupant_id = o.id
            JOIN rooms r ON o.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE o.user_id = ? 
            ORDER BY p.due_date DESC
        `, [userId]);
        
        console.log('Payments found:', payments.length);
        
        const success = req.query.success;
        res.render('user/payments', { 
            user: req.session.user, 
            payments: payments || [], 
            success 
        });
    } catch (error) {
        console.error('Payments route error:', error);
        // Render with empty payments array if there's an error
        res.render('user/payments', { 
            user: req.session.user, 
            payments: [], 
            success: null 
        });
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
        
        res.redirect('/user/payments');
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
        const { start_date, duration_months, rooms, notes } = req.body;
        const userId = req.session.user.id;
        
        if (!start_date || !duration_months) {
            return res.redirect('/user/bookings?error=Data tidak lengkap');
        }
        
        let roomsArray = [];
        try {
            roomsArray = JSON.parse(rooms);
        } catch (e) {
            return res.redirect('/user/bookings?error=Format data tidak valid');
        }
        
        if (!roomsArray || roomsArray.length === 0) {
            return res.redirect('/user/bookings?error=Pilih minimal satu kamar');
        }
        
        // Get a connection from pool for transaction
        const connection = await db.getConnection();
        
        try {
            // Start transaction
            await connection.beginTransaction();
            
            const bookingResults = [];
            
            // Process each room separately (simple approach)
            for (const room of roomsArray) {
                const roomId = room.room_id;
                const roomTypeId = room.room_type_id;
                const monthlyPrice = room.price;
                const totalAmount = monthlyPrice * duration_months;
                
                // Check room availability in real-time
                const [roomCheck] = await connection.execute(
                    'SELECT status FROM rooms WHERE id = ? FOR UPDATE',
                    [roomId]
                );
                
                if (roomCheck.length === 0 || roomCheck[0].status !== 'available') {
                    throw new Error(`Kamar ${room.room_number} sudah tidak tersedia`);
                }
                
                // Create booking for each room
                const [bookingResult] = await connection.execute(
                    'INSERT INTO bookings (user_id, room_id, room_type_id, start_date, duration_months, total_amount, status, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [userId, roomId, roomTypeId, start_date, duration_months, totalAmount, 'confirmed', notes]
                );
                
                // Update room status
                await connection.execute('UPDATE rooms SET status = ? WHERE id = ?', ['occupied', roomId]);
                
                // Create occupant
                const endDate = new Date(start_date);
                endDate.setMonth(endDate.getMonth() + parseInt(duration_months));
                
                const [occupantResult] = await connection.execute(
                    'INSERT INTO occupants (user_id, room_id, start_date, end_date, monthly_rent, status) VALUES (?, ?, ?, ?, ?, ?)',
                    [userId, roomId, start_date, endDate.toISOString().slice(0, 10), monthlyPrice, 'active']
                );
                
                const occupantId = occupantResult.insertId;
                
                // Create payment schedule based on user's selected start date
                const startDateObj = new Date(start_date);
                const dayOfMonth = startDateObj.getDate(); // Get the day from user's selected date
                
                for (let i = 0; i < duration_months; i++) {
                    const dueDate = new Date(start_date);
                    dueDate.setMonth(dueDate.getMonth() + i);
                    // Keep the same day of month as user's selected start date
                    dueDate.setDate(dayOfMonth);
                    
                    await connection.execute(
                        'INSERT INTO payments (occupant_id, amount, due_date, status) VALUES (?, ?, ?, ?)',
                        [occupantId, monthlyPrice, dueDate.toISOString().slice(0, 10), 'pending']
                    );
                }
                
                bookingResults.push({
                    id: bookingResult.insertId,
                    room_id: roomId,
                    room_number: room.room_number,
                    room_type: room.type_name,
                    amount: totalAmount
                });
            }
            
            // Commit transaction
            await connection.commit();
            
            // Release connection back to pool
            connection.release();
            
            // Broadcast real-time updates
            for (const booking of bookingResults) {
                // Broadcast booking update
                await req.realtimeService.broadcastBookingUpdate({
                    id: booking.id,
                    user_id: userId,
                    room_id: booking.room_id,
                    status: 'confirmed',
                    room_number: booking.room_number,
                    room_type: booking.room_type,
                    amount: booking.amount
                });
                
                // Broadcast room availability change
                await req.realtimeService.broadcastRoomAvailability({
                    room_id: booking.room_id,
                    status: 'occupied',
                    room_number: booking.room_number
                });
            }
            
            // Send notification to user
            await req.realtimeService.sendNotification(userId, {
                title: 'Booking Berhasil!',
                message: `Booking untuk ${bookingResults.length} kamar telah dikonfirmasi. Silakan lakukan pembayaran.`,
                type: 'booking'
            });
            
            res.redirect('/user/payments?success=Booking berhasil! Silakan lakukan pembayaran.');
            
        } catch (error) {
            // Rollback transaction on error
            await connection.rollback();
            connection.release();
            throw error;
        }
        
    } catch (error) {
        console.error('Booking error:', error);
        res.redirect('/user/bookings?error=' + error.message);
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

// Real-time payment confirmation
router.post('/payments/:id/confirm', async (req, res) => {
    try {
        const paymentId = req.params.id;
        const userId = req.session.user.id;
        
        console.log('Payment confirmation attempt:', { paymentId, userId });
        
        // Verify payment belongs to user
        const [payment] = await db.execute(`
            SELECT p.*, o.user_id, r.room_number, rt.name as room_type
            FROM payments p
            JOIN occupants o ON p.occupant_id = o.id
            JOIN rooms r ON o.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE p.id = ? AND o.user_id = ?
        `, [paymentId, userId]);
        
        console.log('Payment found:', payment.length > 0 ? 'Yes' : 'No');
        
        if (payment.length === 0) {
            console.log('Payment not found or does not belong to user');
            return res.json({ 
                success: false, 
                message: 'Pembayaran tidak ditemukan atau bukan milik Anda' 
            });
        }
        
        if (payment[0].status === 'paid') {
            console.log('Payment already paid');
            return res.json({ 
                success: false, 
                message: 'Pembayaran sudah dikonfirmasi sebelumnya' 
            });
        }
        
        // Update payment status
        const updateResult = await db.execute(
            'UPDATE payments SET status = ?, payment_date = NOW() WHERE id = ?',
            ['paid', paymentId]
        );
        
        console.log('Payment update result:', updateResult);
        
        console.log('Payment updated successfully');
        
        // Broadcast real-time payment update (if service available)
        try {
            if (req.realtimeService) {
                await req.realtimeService.broadcastPaymentUpdate({
                    id: paymentId,
                    user_id: userId,
                    status: 'paid',
                    amount: payment[0].amount,
                    room_number: payment[0].room_number,
                    room_type: payment[0].room_type
                });
            }
        } catch (realtimeError) {
            console.log('Realtime service error (non-critical):', realtimeError.message);
        }
        
        res.json({ 
            success: true,
            payment: {
                id: paymentId,
                amount: payment[0].amount,
                room_number: payment[0].room_number
            }
        });
        
    } catch (error) {
        console.error('Payment confirmation error:', error);
        res.json({ 
            success: false, 
            message: `Gagal mengkonfirmasi pembayaran: ${error.message}` 
        });
    }
});

// Real-time room availability check
router.get('/api/rooms/availability', async (req, res) => {
    try {
        const [rooms] = await db.execute(`
            SELECT r.id, r.room_number, r.status, rt.name as type_name, rt.base_price
            FROM rooms r
            JOIN room_types rt ON r.room_type_id = rt.id
            ORDER BY rt.name, r.room_number
        `);
        
        res.json({ success: true, rooms });
    } catch (error) {
        console.error('Room availability error:', error);
        res.json({ success: false, message: 'Gagal memuat ketersediaan kamar' });
    }
});

// Real-time booking status check
router.get('/api/bookings/status/:id', async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.session.user.id;
        
        const [booking] = await db.execute(`
            SELECT b.*, r.room_number, rt.name as room_type
            FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE b.id = ? AND b.user_id = ?
        `, [bookingId, userId]);
        
        if (booking.length === 0) {
            return res.json({ success: false, message: 'Booking tidak ditemukan' });
        }
        
        res.json({ success: true, booking: booking[0] });
    } catch (error) {
        console.error('Booking status error:', error);
        res.json({ success: false, message: 'Gagal memuat status booking' });
    }
});

// Real-time payment status
router.get('/api/payments/status', async (req, res) => {
    try {
        const userId = req.session.user.id;
        
        const [payments] = await db.execute(`
            SELECT p.*, r.room_number, rt.name as room_type,
                   DATEDIFF(p.due_date, CURDATE()) as days_until_due
            FROM payments p
            JOIN occupants o ON p.occupant_id = o.id
            JOIN rooms r ON o.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE o.user_id = ?
            ORDER BY p.due_date DESC
        `, [userId]);
        
        const summary = {
            total_paid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + parseFloat(p.amount), 0),
            pending_count: payments.filter(p => p.status === 'pending').length,
            overdue_count: payments.filter(p => p.status === 'pending' && p.days_until_due < 0).length,
            next_payment: payments.find(p => p.status === 'pending' && p.days_until_due >= 0)
        };
        
        res.json({ success: true, payments, summary });
    } catch (error) {
        console.error('Payment status error:', error);
        res.json({ success: false, message: 'Gagal memuat status pembayaran' });
    }
});