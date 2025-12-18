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
base_price = 1000000,
description = 'Kamar standar dengan fasilitas dasar';

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
) room_data ON rt.name = room_data.type_name;

-- Insert sample users (Password: user123)
INSERT INTO users (name, username, email, password, phone, role) VALUES
('John Doe', 'johndoe', 'john@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567890', 'user'),
('Jane Smith', 'janesmith', 'jane@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567891', 'user'),
('Bob Wilson', 'bobwilson', 'bob@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567892', 'user')
ON DUPLICATE KEY UPDATE password = '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra';

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(NULL, 'Selamat Datang', 'Selamat datang di Kost Professional! Sistem siap digunakan.', 'general', false),
(NULL, 'Info Pembayaran', 'Pembayaran dapat dilakukan setiap tanggal 1-10 setiap bulannya.', 'payment', false);

-- Verify results
SELECT 'Room Types Count:' as info, COUNT(*) as count FROM room_types;
SELECT 'Total Rooms:' as info, COUNT(*) as count FROM rooms;
SELECT rt.name, COUNT(r.id) as room_count FROM room_types rt LEFT JOIN rooms r ON rt.id = r.room_type_id GROUP BY rt.id, rt.name;