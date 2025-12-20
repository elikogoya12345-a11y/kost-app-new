-- Seed data for Kost Professional
USE kost_professional;

-- Clear existing data
DELETE FROM payments;
DELETE FROM occupants;
DELETE FROM bookings;
DELETE FROM rooms;
DELETE FROM room_types;
DELETE FROM users WHERE role = 'user';
DELETE FROM notifications;

-- Insert admin user (Password: admin123)
INSERT INTO users (name, username, email, password, role) VALUES 
('Administrator', 'admin', 'admin@kostapp.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', 'admin')
ON DUPLICATE KEY UPDATE password = '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra';

-- Insert room types
INSERT INTO room_types (name, base_price, description, facilities, image_url) VALUES
('Standard Room', 1000000, 'Kamar standar dengan fasilitas dasar', '[\"AC\", \"WiFi\", \"Kasur Single\", \"Lemari\"]', '/images/Standard-room/Standard-room.jpg'),
('Superior Room', 1200000, 'Kamar superior dengan fasilitas lengkap', '[\"AC\", \"WiFi\", \"Kasur Queen\", \"Lemari\", \"Meja Kerja\"]', '/images/Superior-room/Superior-room.jpg'),
('Deluxe Room', 1500000, 'Kamar deluxe dengan fasilitas premium', '[\"AC\", \"WiFi\", \"Kasur King\", \"Lemari\", \"Meja Kerja\", \"TV\"]', '/images/Deluxe-room/Deluxe-room.jpg'),
('Suite Room', 1800000, 'Kamar suite dengan fasilitas mewah', '[\"AC\", \"WiFi\", \"Kasur King\", \"Lemari\", \"Meja Kerja\", \"TV\", \"Kulkas Mini\"]', '/images/Suite-room/Suite-room.jpg'),
('Share Room', 800000, 'Kamar berbagi dengan 2 kasur', '[\"AC\", \"WiFi\", \"2 Kasur Single\", \"Lemari Bersama\"]', '/images/Share-room/Share-room.jpg'),
('Large Room', 2000000, 'Kamar besar dengan ruang luas', '[\"AC\", \"WiFi\", \"Kasur King\", \"Lemari Besar\", \"Meja Kerja\", \"TV\", \"Sofa\"]', '/images/Large-room/Large-room.jpg'),
('President Room', 2500000, 'Kamar presiden dengan fasilitas terlengkap', '[\"AC\", \"WiFi\", \"Kasur King\", \"Walk-in Closet\", \"Meja Kerja\", \"TV 55 inch\", \"Kulkas\", \"Sofa\", \"Balkon\"]', '/images/President-room/President-room.jpg')
ON DUPLICATE KEY UPDATE 
base_price = VALUES(base_price),
description = VALUES(description);

-- Insert all rooms as available (35 rooms total, 5 per type)
INSERT INTO rooms (room_type_id, room_number, status, floor) 
SELECT rt.id, room_number, 'available', floor_num
FROM room_types rt
JOIN (
    SELECT 'Standard Room' as type_name, 'STD-001' as room_number, 1 as floor_num UNION ALL
    SELECT 'Standard Room', 'STD-002', 1 UNION ALL
    SELECT 'Standard Room', 'STD-003', 1 UNION ALL
    SELECT 'Standard Room', 'STD-004', 1 UNION ALL
    SELECT 'Standard Room', 'STD-005', 1 UNION ALL
    SELECT 'Superior Room', 'SUP-001', 2 UNION ALL
    SELECT 'Superior Room', 'SUP-002', 2 UNION ALL
    SELECT 'Superior Room', 'SUP-003', 2 UNION ALL
    SELECT 'Superior Room', 'SUP-004', 2 UNION ALL
    SELECT 'Superior Room', 'SUP-005', 2 UNION ALL
    SELECT 'Deluxe Room', 'DLX-001', 3 UNION ALL
    SELECT 'Deluxe Room', 'DLX-002', 3 UNION ALL
    SELECT 'Deluxe Room', 'DLX-003', 3 UNION ALL
    SELECT 'Deluxe Room', 'DLX-004', 3 UNION ALL
    SELECT 'Deluxe Room', 'DLX-005', 3 UNION ALL
    SELECT 'Suite Room', 'STE-001', 4 UNION ALL
    SELECT 'Suite Room', 'STE-002', 4 UNION ALL
    SELECT 'Suite Room', 'STE-003', 4 UNION ALL
    SELECT 'Suite Room', 'STE-004', 4 UNION ALL
    SELECT 'Suite Room', 'STE-005', 4 UNION ALL
    SELECT 'Share Room', 'SHR-001', 1 UNION ALL
    SELECT 'Share Room', 'SHR-002', 1 UNION ALL
    SELECT 'Share Room', 'SHR-003', 1 UNION ALL
    SELECT 'Share Room', 'SHR-004', 1 UNION ALL
    SELECT 'Share Room', 'SHR-005', 1 UNION ALL
    SELECT 'Large Room', 'LRG-001', 5 UNION ALL
    SELECT 'Large Room', 'LRG-002', 5 UNION ALL
    SELECT 'Large Room', 'LRG-003', 5 UNION ALL
    SELECT 'Large Room', 'LRG-004', 5 UNION ALL
    SELECT 'Large Room', 'LRG-005', 5 UNION ALL
    SELECT 'President Room', 'PRE-001', 6 UNION ALL
    SELECT 'President Room', 'PRE-002', 6 UNION ALL
    SELECT 'President Room', 'PRE-003', 6 UNION ALL
    SELECT 'President Room', 'PRE-004', 6 UNION ALL
    SELECT 'President Room', 'PRE-005', 6
) room_data ON rt.name = room_data.type_name
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Insert sample users (Password: user123)
INSERT INTO users (name, username, email, password, phone, role) VALUES
('John Doe', 'johndoe', 'john@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567890', 'user'),
('Jane Smith', 'janesmith', 'jane@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567891', 'user'),
('Bob Wilson', 'bobwilson', 'bob@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567892', 'user'),
('Alice Johnson', 'alicejohnson', 'alice@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567893', 'user'),
('David Brown', 'davidbrown', 'david@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567894', 'user')
ON DUPLICATE KEY UPDATE password = VALUES(password);

-- Insert sample bookings (John Doe and Jane Smith have bookings)
INSERT INTO bookings (user_id, room_id, room_type_id, start_date, duration_months, total_amount, status, notes)
SELECT 
    u.id as user_id,
    r.id as room_id,
    rt.id as room_type_id,
    booking_data.start_date,
    booking_data.duration_months,
    booking_data.total_amount,
    'confirmed',
    booking_data.notes
FROM users u
JOIN (
    SELECT 'john@example.com' as email, 'LRG-001' as room_number, '2024-12-20' as start_date, 3 as duration_months, 6000000 as total_amount, 'Sample booking for John' as notes UNION ALL
    SELECT 'jane@example.com', 'DLX-001', '2024-12-15', 6, 9000000, 'Sample booking for Jane'
) booking_data ON u.email = booking_data.email
JOIN rooms r ON r.room_number = booking_data.room_number
JOIN room_types rt ON r.room_type_id = rt.id
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Update room status for booked rooms
UPDATE rooms SET status = 'occupied' WHERE room_number IN ('LRG-001', 'DLX-001');

-- Insert occupants for booked users
INSERT INTO occupants (user_id, room_id, start_date, end_date, monthly_rent, status)
SELECT 
    u.id as user_id,
    r.id as room_id,
    occupant_data.start_date,
    occupant_data.end_date,
    occupant_data.monthly_rent,
    'active'
FROM users u
JOIN (
    SELECT 'john@example.com' as email, 'LRG-001' as room_number, '2024-12-20' as start_date, '2025-03-20' as end_date, 2000000 as monthly_rent UNION ALL
    SELECT 'jane@example.com', 'DLX-001', '2024-12-15', '2025-06-15', 1500000
) occupant_data ON u.email = occupant_data.email
JOIN rooms r ON r.room_number = occupant_data.room_number
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Insert sample payments
INSERT INTO payments (occupant_id, amount, due_date, status, payment_method, notes)
SELECT 
    o.id as occupant_id,
    payment_data.amount,
    payment_data.due_date,
    payment_data.status,
    payment_data.payment_method,
    payment_data.notes
FROM occupants o
JOIN users u ON o.user_id = u.id
JOIN rooms r ON o.room_id = r.id
JOIN (
    -- John Doe payments (Large Room - 2M/month)
    SELECT 'john@example.com' as email, 'LRG-001' as room_number, 2000000 as amount, '2024-12-20' as due_date, 'pending' as status, NULL as payment_method, 'Pembayaran bulan 1' as notes UNION ALL
    SELECT 'john@example.com', 'LRG-001', 2000000, '2025-01-20', 'pending', NULL, 'Pembayaran bulan 2' UNION ALL
    SELECT 'john@example.com', 'LRG-001', 2000000, '2025-02-20', 'pending', NULL, 'Pembayaran bulan 3' UNION ALL
    -- Jane Smith payments (Deluxe Room - 1.5M/month)
    SELECT 'jane@example.com', 'DLX-001', 1500000, '2024-12-15', 'paid', 'Transfer Bank', 'Pembayaran bulan 1' UNION ALL
    SELECT 'jane@example.com', 'DLX-001', 1500000, '2025-01-15', 'pending', NULL, 'Pembayaran bulan 2' UNION ALL
    SELECT 'jane@example.com', 'DLX-001', 1500000, '2025-02-15', 'pending', NULL, 'Pembayaran bulan 3' UNION ALL
    SELECT 'jane@example.com', 'DLX-001', 1500000, '2025-03-15', 'pending', NULL, 'Pembayaran bulan 4' UNION ALL
    SELECT 'jane@example.com', 'DLX-001', 1500000, '2025-04-15', 'pending', NULL, 'Pembayaran bulan 5' UNION ALL
    SELECT 'jane@example.com', 'DLX-001', 1500000, '2025-05-15', 'pending', NULL, 'Pembayaran bulan 6'
) payment_data ON u.email = payment_data.email AND r.room_number = payment_data.room_number
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Update payment_date for paid payments
UPDATE payments SET payment_date = '2024-12-15' WHERE status = 'paid';

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(NULL, 'Selamat Datang', 'Selamat datang di Kost Professional! Sistem siap digunakan.', 'general', false),
(NULL, 'Info Pembayaran', 'Pembayaran dapat dilakukan setiap tanggal jatuh tempo yang telah ditentukan.', 'payment', false),
((SELECT id FROM users WHERE email = 'john@example.com'), 'Booking Berhasil', 'Booking kamar LRG-001 telah dikonfirmasi. Silakan lakukan pembayaran.', 'booking', false),
((SELECT id FROM users WHERE email = 'jane@example.com'), 'Pembayaran Berhasil', 'Pembayaran bulan pertama telah dikonfirmasi.', 'payment', false)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- Verify results
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Room Types', COUNT(*) FROM room_types
UNION ALL
SELECT 'Rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'Bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'Occupants', COUNT(*) FROM occupants
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications;

-- Show sample data
SELECT 'Sample Users:' as info;
SELECT id, name, email, role, status FROM users ORDER BY role, created_at;

SELECT 'Sample Payments:' as info;
SELECT p.id, u.name, r.room_number, p.amount, p.due_date, p.status
FROM payments p
JOIN occupants o ON p.occupant_id = o.id
JOIN users u ON o.user_id = u.id
JOIN rooms r ON o.room_id = r.id
ORDER BY u.name, p.due_date;