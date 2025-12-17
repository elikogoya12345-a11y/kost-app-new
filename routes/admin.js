const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

// Dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const period = req.query.period || 'month';
        let dateFilter = '';
        
        switch(period) {
            case 'week': dateFilter = 'AND p.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)'; break;
            case 'month': dateFilter = 'AND p.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)'; break;
            case 'year': dateFilter = 'AND p.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)'; break;
        }
        
        const [revenue] = await db.execute(`
            SELECT COALESCE(SUM(amount), 0) as total_revenue 
            FROM payments p WHERE status = 'paid' ${dateFilter}
        `);
        
        const [totalRevenue] = await db.execute(`
            SELECT COALESCE(SUM(amount), 0) as total_revenue 
            FROM payments WHERE status = 'paid'
        `);
        
        const [pendingPayments] = await db.execute(`
            SELECT COUNT(*) as pending_count FROM payments WHERE status = 'pending'
        `);
        
        const [occupancy] = await db.execute(`
            SELECT COUNT(*) as occupied_rooms FROM rooms WHERE status = 'occupied'
        `);
        
        const [complaints] = await db.execute(`
            SELECT COUNT(*) as unresolved_complaints FROM complaints WHERE status != 'resolved'
        `);
        
        const [totalRooms] = await db.execute('SELECT COUNT(*) as total FROM rooms');
        
        res.render('admin/dashboard', {
            user: req.session.user,
            stats: {
                revenue: revenue[0].total_revenue,
                totalRevenue: totalRevenue[0].total_revenue,
                pendingPayments: pendingPayments[0].pending_count,
                occupiedRooms: occupancy[0].occupied_rooms,
                totalRooms: totalRooms[0].total,
                unresolvedComplaints: complaints[0].unresolved_complaints
            },
            period
        });
    } catch (error) {
        console.error(error);
        res.render('admin/dashboard', { user: req.session.user, stats: {}, period: 'month' });
    }
});

// Manage Occupants
router.get('/occupants', async (req, res) => {
    try {
        const [occupants] = await db.execute(`
            SELECT u.*, o.start_date, o.end_date, o.status as occupant_status, r.room_number,
                   b.id as booking_id, b.duration_months, b.start_date as booking_start_date,
                   br.room_number as booking_room_number, rt.name as room_type
            FROM users u
            LEFT JOIN occupants o ON u.id = o.user_id AND o.status = 'active'
            LEFT JOIN rooms r ON o.room_id = r.id
            LEFT JOIN bookings b ON u.id = b.user_id AND b.status = 'confirmed'
            LEFT JOIN rooms br ON b.room_id = br.id
            LEFT JOIN room_types rt ON br.room_type_id = rt.id
            WHERE u.role = 'user'
            ORDER BY u.name
        `);
        
        const success = req.query.success;
        res.render('admin/occupants', { user: req.session.user, occupants, success });
    } catch (error) {
        console.error(error);
        res.render('admin/occupants', { user: req.session.user, occupants: [], success: null });
    }
});

// Manage Rooms
router.get('/rooms', async (req, res) => {
    try {
        const [rooms] = await db.execute(`
            SELECT r.*, rt.name as type_name, rt.base_price
            FROM rooms r
            JOIN room_types rt ON r.room_type_id = rt.id
            ORDER BY r.room_number
        `);
        
        const [roomTypes] = await db.execute('SELECT * FROM room_types ORDER BY name');
        
        const success = req.query.success;
        res.render('admin/rooms', { user: req.session.user, rooms, roomTypes, success });
    } catch (error) {
        console.error(error);
        res.render('admin/rooms', { user: req.session.user, rooms: [], roomTypes: [], success: null });
    }
});

// Add new room
router.post('/rooms', async (req, res) => {
    try {
        const { room_number, room_type_id, status } = req.body;
        
        await db.execute(
            'INSERT INTO rooms (room_number, room_type_id, status) VALUES (?, ?, ?)',
            [room_number, room_type_id, status || 'available']
        );
        
        res.redirect('/admin/rooms?success=Kamar berhasil ditambahkan');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/rooms?error=Gagal menambahkan kamar');
    }
});

// Update room
router.post('/rooms/:id', async (req, res) => {
    try {
        const roomId = req.params.id;
        const { room_number, room_type_id, status } = req.body;
        
        await db.execute(
            'UPDATE rooms SET room_number = ?, room_type_id = ?, status = ? WHERE id = ?',
            [room_number, room_type_id, status, roomId]
        );
        
        res.redirect('/admin/rooms?success=Kamar berhasil diperbarui');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/rooms?error=Gagal memperbarui kamar');
    }
});

// Delete room
router.delete('/rooms/:id', async (req, res) => {
    try {
        const roomId = req.params.id;
        
        await db.execute('DELETE FROM rooms WHERE id = ?', [roomId]);
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false });
    }
});

// Payments Management
router.get('/payments', async (req, res) => {
    try {
        const [payments] = await db.execute(`
            SELECT p.*, u.name as user_name, r.room_number, rt.name as room_type
            FROM payments p
            JOIN occupants o ON p.occupant_id = o.id
            JOIN users u ON o.user_id = u.id
            JOIN rooms r ON o.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            ORDER BY p.due_date DESC
        `);
        
        const success = req.query.success;
        res.render('admin/payments', { user: req.session.user, payments, success });
    } catch (error) {
        console.error(error);
        res.render('admin/payments', { user: req.session.user, payments: [], success: null });
    }
});

router.post('/payments/:id/update', async (req, res) => {
    try {
        const paymentId = req.params.id;
        const { status } = req.body;
        const currentDate = new Date().toISOString().slice(0, 10);
        
        if (status === 'paid') {
            await db.execute(
                'UPDATE payments SET status = ?, payment_date = ? WHERE id = ?',
                ['paid', currentDate, paymentId]
            );
        } else {
            await db.execute(
                'UPDATE payments SET status = ?, payment_date = NULL WHERE id = ?',
                [status, paymentId]
            );
        }
        
        res.redirect('/admin/payments?success=Status pembayaran berhasil diperbarui');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/payments?error=Gagal memperbarui status pembayaran');
    }
});

// Financial Reports
router.get('/finance', async (req, res) => {
    try {
        const period = req.query.period || 'month';
        let dateFilter = '';
        
        switch(period) {
            case 'week': dateFilter = 'AND p.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)'; break;
            case 'month': dateFilter = 'AND p.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)'; break;
            case 'year': dateFilter = 'AND p.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)'; break;
        }
        
        const [payments] = await db.execute(`
            SELECT p.*, u.name as user_name, r.room_number
            FROM payments p
            JOIN occupants o ON p.occupant_id = o.id
            JOIN users u ON o.user_id = u.id
            LEFT JOIN rooms r ON o.room_id = r.id
            WHERE 1=1 ${dateFilter}
            ORDER BY p.created_at DESC
        `);
        
        res.render('admin/finance', { user: req.session.user, payments, period });
    } catch (error) {
        console.error(error);
        res.render('admin/finance', { user: req.session.user, payments: [], period: 'month' });
    }
});

// Export Financial Report to PDF
router.get('/finance/export', async (req, res) => {
    try {
        const period = req.query.period || 'month';
        let dateFilter = '';
        
        switch(period) {
            case 'week': dateFilter = 'AND p.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)'; break;
            case 'month': dateFilter = 'AND p.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)'; break;
            case 'year': dateFilter = 'AND p.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)'; break;
        }
        
        const [payments] = await db.execute(`
            SELECT p.*, u.name as user_name, r.room_number
            FROM payments p
            JOIN occupants o ON p.occupant_id = o.id
            JOIN users u ON o.user_id = u.id
            LEFT JOIN rooms r ON o.room_id = r.id
            WHERE 1=1 ${dateFilter}
            ORDER BY p.created_at DESC
        `);
        
        const periodText = period === 'week' ? 'Minggu Ini' : period === 'month' ? 'Bulan Ini' : 'Tahun Ini';
        
        res.render('admin/finance-export', { payments, period: periodText });
    } catch (error) {
        console.error(error);
        res.send('Error generating report');
    }
});

// Complaints
router.get('/complaints', async (req, res) => {
    try {
        const [complaints] = await db.execute(`
            SELECT c.*, u.name as user_name, u.phone, u.email, u.birth_date, r.room_number, rt.name as room_type
            FROM complaints c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN rooms r ON c.room_id = r.id
            LEFT JOIN room_types rt ON r.room_type_id = rt.id
            ORDER BY c.created_at DESC
        `);
        
        const success = req.query.success;
        res.render('admin/complaints', { user: req.session.user, complaints, success });
    } catch (error) {
        console.error(error);
        res.render('admin/complaints', { user: req.session.user, complaints: [], success: null });
    }
});

// Handle complaint response
router.post('/complaints/response', async (req, res) => {
    try {
        const { complaint_id, admin_response } = req.body;
        
        await db.execute(
            'UPDATE complaints SET admin_response = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [admin_response, complaint_id]
        );
        
        res.redirect('/admin/complaints?success=Tanggapan berhasil dikirim');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/complaints?error=Gagal mengirim tanggapan');
    }
});

router.post('/complaints/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const complaintId = req.params.id;
        
        await db.execute(
            'UPDATE complaints SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, complaintId]
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false });
    }
});

// Notifications
router.get('/notifications', async (req, res) => {
    try {
        const [notifications] = await db.execute(`
            SELECT n.*, u.name as user_name 
            FROM notifications n
            LEFT JOIN users u ON n.user_id = u.id
            ORDER BY n.created_at DESC
        `);
        
        const [users] = await db.execute(`
            SELECT id, name, email FROM users WHERE role = 'user' ORDER BY name
        `);
        
        const success = req.query.success;
        res.render('admin/notifications', { user: req.session.user, notifications, users, success });
    } catch (error) {
        console.error(error);
        res.render('admin/notifications', { user: req.session.user, notifications: [], users: [], success: null });
    }
});

router.post('/notifications', async (req, res) => {
    try {
        const { user_id, title, message, type, redirect } = req.body;
        
        await db.execute(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [user_id || null, title, message, type]
        );
        
        if (redirect === 'complaints') {
            res.redirect('/admin/complaints?success=Notifikasi berhasil dikirim');
        } else {
            res.redirect('/admin/notifications?success=Notifikasi berhasil dikirim');
        }
    } catch (error) {
        console.error(error);
        if (req.body.redirect === 'complaints') {
            res.redirect('/admin/complaints?error=Gagal mengirim notifikasi');
        } else {
            res.redirect('/admin/notifications?error=Gagal mengirim notifikasi');
        }
    }
});

// Get available rooms
router.get('/rooms/available', async (req, res) => {
    try {
        const [rooms] = await db.execute(`
            SELECT r.*, rt.name as type_name, rt.base_price
            FROM rooms r
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE r.status = 'available'
            ORDER BY r.room_number
        `);
        
        res.json({ rooms });
    } catch (error) {
        console.error(error);
        res.json({ rooms: [] });
    }
});

// Activate occupant based on booking
router.post('/occupants/:id/activate', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Get user's confirmed booking
        const [booking] = await db.execute(`
            SELECT b.*, r.id as room_id, rt.base_price as monthly_rent FROM bookings b
            JOIN rooms r ON b.room_id = r.id
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE b.user_id = ? AND b.status = 'confirmed'
            ORDER BY b.created_at DESC LIMIT 1
        `, [userId]);
        
        if (booking.length === 0) {
            return res.redirect('/admin/occupants?error=User belum memiliki booking yang dikonfirmasi');
        }
        
        const bookingData = booking[0];
        const endDate = new Date(bookingData.start_date);
        endDate.setMonth(endDate.getMonth() + parseInt(bookingData.duration_months));
        
        // Create occupant record
        const [result] = await db.execute(
            'INSERT INTO occupants (user_id, room_id, start_date, end_date, monthly_rent, status) VALUES (?, ?, ?, ?, ?, ?)',
            [userId, bookingData.room_id, bookingData.start_date, endDate.toISOString().slice(0, 10), bookingData.monthly_rent, 'active']
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
                [occupantId, bookingData.monthly_rent, dueDate.toISOString().slice(0, 10), 'pending']
            );
        }
        
        // Update room status
        await db.execute('UPDATE rooms SET status = ? WHERE id = ?', ['occupied', bookingData.room_id]);
        
        res.redirect('/admin/occupants?success=Penghuni berhasil diaktifkan');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/occupants?error=Gagal mengaktifkan penghuni');
    }
});

// Delete occupant
router.delete('/occupants/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        
        // Get occupant's room to free it up
        const [occupant] = await db.execute(`
            SELECT room_id FROM occupants WHERE user_id = ? AND status = 'active'
        `, [userId]);
        
        // Delete occupant record
        await db.execute('DELETE FROM occupants WHERE user_id = ?', [userId]);
        
        // Delete user's payments through occupants
        await db.execute('DELETE p FROM payments p JOIN occupants o ON p.occupant_id = o.id WHERE o.user_id = ?', [userId]);
        
        // Delete user's bookings
        await db.execute('DELETE FROM bookings WHERE user_id = ?', [userId]);
        
        // Delete user's complaints
        await db.execute('DELETE FROM complaints WHERE user_id = ?', [userId]);
        
        // Delete user's notifications
        await db.execute('DELETE FROM notifications WHERE user_id = ?', [userId]);
        
        // Free up the room if occupied
        if (occupant.length > 0) {
            await db.execute('UPDATE rooms SET status = ? WHERE id = ?', ['available', occupant[0].room_id]);
        }
        
        // Delete the user
        await db.execute('DELETE FROM users WHERE id = ?', [userId]);
        
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.json({ success: false });
    }
});

module.exports = router;