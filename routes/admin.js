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
            case 'week': dateFilter = 'AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)'; break;
            case 'month': dateFilter = 'AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)'; break;
            case 'year': dateFilter = 'AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)'; break;
        }
        
        const [revenue] = await db.execute(`
            SELECT IFNULL(SUM(amount), 0) as total_revenue 
            FROM payments p WHERE status = 'paid' ${dateFilter}
        `);
        
        const [totalRevenue] = await db.execute(`
            SELECT IFNULL(SUM(amount), 0) as total_revenue 
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
        
        const [paymentExtensions] = await db.execute(`
            SELECT COUNT(*) as extension_count FROM notifications 
            WHERE type = 'payment_extension' AND is_read = 0
        `);
        
        res.render('admin/dashboard', {
            user: req.session.user,
            stats: {
                revenue: revenue[0].total_revenue,
                totalRevenue: totalRevenue[0].total_revenue,
                pendingPayments: pendingPayments[0].pending_count,
                occupiedRooms: occupancy[0].occupied_rooms,
                totalRooms: totalRooms[0].total,
                unresolvedComplaints: complaints[0].unresolved_complaints,
                paymentExtensions: paymentExtensions[0].extension_count
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

// Toggle user status
router.post('/occupants/:id/toggle-status', async (req, res) => {
    try {
        const userId = req.params.id;
        const { status } = req.body;
        
        await db.execute(
            'UPDATE users SET status = ? WHERE id = ?',
            [status, userId]
        );
        
        res.redirect('/admin/occupants?success=Status penghuni berhasil diperbarui');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/occupants?error=Gagal memperbarui status penghuni');
    }
});

// Manage Rooms
router.get('/rooms', async (req, res) => {
    try {
        const [rooms] = await db.execute(`
            SELECT r.*, rt.name as type_name, rt.base_price
            FROM rooms r
            JOIN room_types rt ON r.room_type_id = rt.id
            WHERE rt.name != 'Twin Room'
            ORDER BY r.room_number
        `);
        
        const [roomTypes] = await db.execute('SELECT * FROM room_types WHERE name != "Twin Room" ORDER BY name');
        
        const success = req.query.success;
        const error = req.query.error;
        res.render('admin/rooms', { user: req.session.user, rooms, roomTypes, success, error });
    } catch (error) {
        console.error(error);
        res.render('admin/rooms', { user: req.session.user, rooms: [], roomTypes: [], success: null });
    }
});

// Add new room
router.post('/rooms', async (req, res) => {
    try {
        const { room_number, room_type_id, status, floor, description } = req.body;
        
        // Check if room number already exists
        const [existing] = await db.execute(
            'SELECT id FROM rooms WHERE room_number = ?',
            [room_number]
        );
        
        if (existing.length > 0) {
            return res.redirect('/admin/rooms?error=Nomor kamar sudah ada');
        }
        
        await db.execute(
            'INSERT INTO rooms (room_number, room_type_id, status, floor, description) VALUES (?, ?, ?, ?, ?)',
            [room_number, room_type_id, status || 'available', floor || 1, description || null]
        );
        
        res.redirect('/admin/rooms?success=Kamar berhasil ditambahkan');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/rooms?error=Gagal menambahkan kamar: ' + error.message);
    }
});

// Update room
router.post('/rooms/:id', async (req, res) => {
    try {
        const roomId = req.params.id;
        const { room_number, room_type_id, status, floor, description } = req.body;
        
        // Check if room number already exists for other rooms
        const [existing] = await db.execute(
            'SELECT id FROM rooms WHERE room_number = ? AND id != ?',
            [room_number, roomId]
        );
        
        if (existing.length > 0) {
            return res.redirect('/admin/rooms?error=Nomor kamar sudah digunakan kamar lain');
        }
        
        await db.execute(
            'UPDATE rooms SET room_number = ?, room_type_id = ?, status = ?, floor = ?, description = ? WHERE id = ?',
            [room_number, room_type_id, status, floor || 1, description || null, roomId]
        );
        
        res.redirect('/admin/rooms?success=Kamar berhasil diperbarui');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/rooms?error=Gagal memperbarui kamar: ' + error.message);
    }
});

// Delete room
router.delete('/rooms/:id', async (req, res) => {
    try {
        const roomId = req.params.id;
        
        // Check if room is occupied or has bookings
        const [occupants] = await db.execute(
            'SELECT id FROM occupants WHERE room_id = ? AND status = "active"',
            [roomId]
        );
        
        const [bookings] = await db.execute(
            'SELECT id FROM bookings WHERE room_id = ? AND status = "confirmed"',
            [roomId]
        );
        
        if (occupants.length > 0 || bookings.length > 0) {
            return res.json({ success: false, message: 'Kamar tidak dapat dihapus karena sedang ditempati atau ada booking aktif' });
        }
        
        await db.execute('DELETE FROM rooms WHERE id = ?', [roomId]);
        
        res.json({ success: true, message: 'Kamar berhasil dihapus' });
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'Gagal menghapus kamar: ' + error.message });
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
            case 'week': dateFilter = 'AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)'; break;
            case 'month': dateFilter = 'AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)'; break;
            case 'year': dateFilter = 'AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)'; break;
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
            case 'week': dateFilter = 'AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)'; break;
            case 'month': dateFilter = 'AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)'; break;
            case 'year': dateFilter = 'AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)'; break;
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
            'UPDATE complaints SET admin_response = ?, updated_at = NOW() WHERE id = ?',
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
            'UPDATE complaints SET status = ?, updated_at = NOW() WHERE id = ?',
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

// Reset all rooms to available
router.post('/rooms/reset-all', async (req, res) => {
    try {
        // Start transaction
        await db.execute('START TRANSACTION');
        
        // Update all rooms to available
        await db.execute('UPDATE rooms SET status = ?', ['available']);
        
        // Set all occupants to inactive
        await db.execute('UPDATE occupants SET status = ?', ['inactive']);
        
        // Cancel all confirmed bookings
        await db.execute('UPDATE bookings SET status = ? WHERE status = ?', ['cancelled', 'confirmed']);
        
        // Delete pending payments
        await db.execute('DELETE FROM payments WHERE status = ?', ['pending']);
        
        // Commit transaction
        await db.execute('COMMIT');
        
        res.redirect('/admin/rooms?success=Semua kamar berhasil direset ke status tersedia');
    } catch (error) {
        // Rollback on error
        await db.execute('ROLLBACK');
        console.error(error);
        res.redirect('/admin/rooms?error=Gagal mereset kamar: ' + error.message);
    }
});

// Image upload page
router.get('/images', async (req, res) => {
    try {
        const [roomTypes] = await db.execute('SELECT * FROM room_types WHERE name != "Twin Room" ORDER BY name');
        res.render('admin/image-upload', { user: req.session.user, roomTypes });
    } catch (error) {
        console.error(error);
        res.redirect('/admin/dashboard');
    }
});

// Handle image upload from folder
router.post('/images/upload', async (req, res) => {
    try {
        const { room_type_id, image_choice } = req.body;
        
        let imagePath;
        
        // Check if it's a placeholder image URL
        if (image_choice.startsWith('https://')) {
            imagePath = image_choice;
        } else {
            // Get room type name for local images
            const [roomType] = await db.execute(
                'SELECT name FROM room_types WHERE id = ?',
                [room_type_id]
            );
            
            if (roomType.length === 0) {
                return res.redirect('/admin/images?error=Tipe kamar tidak ditemukan');
            }
            
            const typeName = roomType[0].name.replace(/\s+/g, '-');
            imagePath = `/images/${typeName}/${image_choice}`;
        }
        
        // Update room type image
        await db.execute(
            'UPDATE room_types SET image_url = ? WHERE id = ?',
            [imagePath, room_type_id]
        );
        
        res.redirect('/admin/images?success=Gambar berhasil diterapkan ke tipe kamar ini');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/images?error=Gagal mengupload gambar');
    }
});

// Reply to payment extension request
router.post('/notifications/:id/reply', async (req, res) => {
    try {
        const { reply, action } = req.body;
        const notificationId = req.params.id;
        
        // Get the original notification
        const [notification] = await db.execute(
            'SELECT * FROM notifications WHERE id = ?',
            [notificationId]
        );
        
        if (notification.length === 0) {
            return res.redirect('/admin/notifications?error=Notifikasi tidak ditemukan');
        }
        
        const status = action === 'approve' ? 'Disetujui' : 'Ditolak';
        const replyMessage = `Pengajuan perpanjangan pembayaran Anda ${status.toLowerCase()}. Balasan admin: ${reply}`;
        
        // Create reply notification for user
        await db.execute(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [null, `Balasan: ${status}`, replyMessage, 'payment_extension_reply']
        );
        
        // Mark original notification as read
        await db.execute(
            'UPDATE notifications SET is_read = 1 WHERE id = ?',
            [notificationId]
        );
        
        res.redirect('/admin/notifications?success=Balasan berhasil dikirim');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/notifications?error=Gagal mengirim balasan');
    }
});

// Set default images for all room types
router.post('/images/set-defaults', async (req, res) => {
    try {
        const defaultImages = {
            'Standard Room': 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop',
            'Superior Room': 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop',
            'Deluxe Room': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop',
            'Suite Room': 'https://images.unsplash.com/photo-1571508601891-ca5e7a713859?w=600&h=400&fit=crop',
            'Share Room': 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop',
            'Large Room': 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=600&h=400&fit=crop',
            'President Room': 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=600&h=400&fit=crop'
        };
        
        for (const [roomTypeName, imageUrl] of Object.entries(defaultImages)) {
            await db.execute(
                'UPDATE room_types SET image_url = ? WHERE name = ?',
                [imageUrl, roomTypeName]
            );
        }
        
        res.redirect('/admin/images?success=Gambar default berhasil diterapkan ke semua tipe kamar');
    } catch (error) {
        console.error(error);
        res.redirect('/admin/images?error=Gagal menerapkan gambar default');
    }
});

module.exports = router;