const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { requireAdmin } = require('../middleware/auth');

router.use(requireAdmin);

// Debug route to check users
router.get('/debug-users', async (req, res) => {
    try {
        const [users] = await db.execute('SELECT id, name, username, email, role, status FROM users LIMIT 10');
        res.json({
            users: users,
            userCount: users.length
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Debug route to check database
router.get('/debug-db', async (req, res) => {
    try {
        const [rooms] = await db.execute('SELECT * FROM rooms LIMIT 10');
        const [roomTypes] = await db.execute('SELECT * FROM room_types LIMIT 10');
        const [tables] = await db.execute('SHOW TABLES');
        
        res.json({
            tables: tables.map(t => Object.values(t)[0]),
            rooms: rooms,
            roomTypes: roomTypes,
            roomsCount: rooms.length,
            roomTypesCount: roomTypes.length
        });
    } catch (error) {
        res.json({ error: error.message, stack: error.stack });
    }
});

// Fix users to have usernames
router.post('/fix-users', async (req, res) => {
    try {
        console.log('Fixing users to have usernames...');
        
        // Get all users without username
        const [users] = await db.execute('SELECT id, email FROM users WHERE username IS NULL OR username = ""');
        
        for (const user of users) {
            const username = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
            await db.execute('UPDATE users SET username = ? WHERE id = ?', [username, user.id]);
        }
        
        console.log(`Fixed ${users.length} users with usernames`);
        res.redirect('/admin/rooms?success=User usernames berhasil diperbaiki!');
        
    } catch (error) {
        console.error('Fix users error:', error);
        res.redirect('/admin/rooms?error=Gagal memperbaiki user usernames: ' + error.message);
    }
});

// Seed database with initial data
router.post('/seed-database', async (req, res) => {
    try {
        console.log('Starting database seeding...');
        
        // Add room types
        const roomTypes = [
            [1, 'Standard Room', 1000000, 'Kamar standar dengan fasilitas dasar', '["AC", "WiFi", "Kasur Single", "Lemari"]'],
            [2, 'Superior Room', 1200000, 'Kamar superior dengan fasilitas lengkap', '["AC", "WiFi", "Kasur Queen", "Lemari", "Meja Kerja"]'],
            [3, 'Deluxe Room', 1500000, 'Kamar deluxe dengan fasilitas premium', '["AC", "WiFi", "Kasur King", "Lemari", "Meja Kerja", "TV"]'],
            [4, 'Suite Room', 1800000, 'Kamar suite dengan fasilitas mewah', '["AC", "WiFi", "Kasur King", "Lemari", "Meja Kerja", "TV", "Kulkas Mini"]'],
            [5, 'Share Room', 800000, 'Kamar berbagi dengan 2 kasur', '["AC", "WiFi", "2 Kasur Single", "Lemari Bersama"]'],
            [6, 'Large Room', 2000000, 'Kamar besar dengan ruang luas', '["AC", "WiFi", "Kasur King", "Lemari Besar", "Meja Kerja", "TV", "Sofa"]'],
            [7, 'President Room', 2500000, 'Kamar presiden dengan fasilitas terlengkap', '["AC", "WiFi", "Kasur King", "Walk-in Closet", "Meja Kerja", "TV 55 inch", "Kulkas", "Sofa", "Balkon"]']
        ];
        
        for (const [id, name, price, desc, facilities] of roomTypes) {
            await db.execute(
                'INSERT INTO room_types (id, name, base_price, description, facilities) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE base_price = VALUES(base_price), description = VALUES(description), facilities = VALUES(facilities)',
                [id, name, price, desc, facilities]
            );
        }
        
        // Add 35 rooms
        const rooms = [
            [1, 'STD-001', 'available', 1], [1, 'STD-002', 'available', 1], [1, 'STD-003', 'available', 1], [1, 'STD-004', 'available', 1], [1, 'STD-005', 'available', 1],
            [2, 'SUP-001', 'available', 2], [2, 'SUP-002', 'available', 2], [2, 'SUP-003', 'available', 2], [2, 'SUP-004', 'available', 2], [2, 'SUP-005', 'available', 2],
            [3, 'DLX-001', 'available', 3], [3, 'DLX-002', 'available', 3], [3, 'DLX-003', 'available', 3], [3, 'DLX-004', 'available', 3], [3, 'DLX-005', 'available', 3],
            [4, 'STE-001', 'available', 4], [4, 'STE-002', 'available', 4], [4, 'STE-003', 'available', 4], [4, 'STE-004', 'available', 4], [4, 'STE-005', 'available', 4],
            [5, 'SHR-001', 'available', 1], [5, 'SHR-002', 'available', 1], [5, 'SHR-003', 'available', 1], [5, 'SHR-004', 'available', 1], [5, 'SHR-005', 'available', 1],
            [6, 'LRG-001', 'available', 5], [6, 'LRG-002', 'available', 5], [6, 'LRG-003', 'available', 5], [6, 'LRG-004', 'available', 5], [6, 'LRG-005', 'available', 5],
            [7, 'PRE-001', 'available', 6], [7, 'PRE-002', 'available', 6], [7, 'PRE-003', 'available', 6], [7, 'PRE-004', 'available', 6], [7, 'PRE-005', 'available', 6]
        ];
        
        let added = 0;
        for (const [room_type_id, room_number, status, floor] of rooms) {
            try {
                await db.execute(
                    'INSERT INTO rooms (room_type_id, room_number, status, floor) VALUES (?, ?, ?, ?)',
                    [room_type_id, room_number, status, floor]
                );
                added++;
            } catch (err) {
                if (!err.message.includes('Duplicate entry')) {
                    console.warn(`Warning for room ${room_number}:`, err.message);
                }
            }
        }
        
        console.log(`Seeding complete. Added ${added} rooms.`);
        res.redirect('/admin/rooms?success=Database berhasil di-seed dengan 7 tipe kamar dan 35 kamar!');
        
    } catch (error) {
        console.error('Seeding error:', error);
        res.redirect('/admin/rooms?error=Gagal seed database: ' + error.message);
    }
});

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
        console.log('=== FETCHING ROOMS DATA ===');
        
        // Test database connection first
        const [testQuery] = await db.execute('SELECT 1 as test');
        console.log('Database connection OK:', testQuery[0].test === 1);
        
        // Get room types first
        const [roomTypes] = await db.execute('SELECT * FROM room_types ORDER BY name');
        console.log('Room types found:', roomTypes.length);
        if (roomTypes.length > 0) {
            console.log('Room types:', roomTypes.map(rt => rt.name));
        }
        
        // Get all rooms without any filter (without description column)
        const [rooms] = await db.execute(`
            SELECT r.id, r.room_number, r.status, r.floor, r.room_type_id,
                   rt.name as type_name, rt.base_price
            FROM rooms r
            LEFT JOIN room_types rt ON r.room_type_id = rt.id
            ORDER BY r.room_number ASC
        `);
        
        console.log('Total rooms found:', rooms.length);
        if (rooms.length > 0) {
            console.log('Sample rooms:', rooms.slice(0, 3).map(r => ({ 
                id: r.id, 
                number: r.room_number, 
                type: r.type_name, 
                status: r.status 
            })));
        }
        
        const success = req.query.success;
        const error = req.query.error;
        
        console.log('=== RENDERING ROOMS PAGE ===');
        res.render('admin/rooms', { 
            user: req.session.user, 
            rooms, 
            roomTypes, 
            success, 
            error 
        });
    } catch (error) {
        console.error('=== ERROR IN /admin/rooms ===');
        console.error('Error details:', error);
        console.error('Stack trace:', error.stack);
        
        res.render('admin/rooms', { 
            user: req.session.user, 
            rooms: [], 
            roomTypes: [], 
            success: null, 
            error: 'Gagal memuat data kamar: ' + error.message 
        });
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
            'INSERT INTO rooms (room_number, room_type_id, status, floor) VALUES (?, ?, ?, ?)',
            [room_number, room_type_id, status || 'available', floor || 1]
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
            'UPDATE rooms SET room_number = ?, room_type_id = ?, status = ?, floor = ? WHERE id = ?',
            [room_number, room_type_id, status, floor || 1, roomId]
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



module.exports = router;