-- Manual seed queries untuk MySQL Workbench
-- Copy paste query ini ke MySQL Workbench dan jalankan satu per satu

-- 1. Insert admin user (Password: admin123)
INSERT INTO users (name, username, email, password, role) VALUES 
('Administrator', 'admin', 'admin@kostapp.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', 'admin')
ON DUPLICATE KEY UPDATE password = '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra';

-- 2. Insert room types
INSERT INTO room_types (name, base_price, description, facilities, image_url) VALUES
('Standard Room', 1000000, 'Kamar standar dengan fasilitas dasar', '["AC", "WiFi", "Kasur Single", "Lemari"]', '/images/Standard-room/Standard-room.jpg'),
('Superior Room', 1200000, 'Kamar superior dengan fasilitas lengkap', '["AC", "WiFi", "Kasur Queen", "Lemari", "Meja Kerja"]', '/images/Superior-room/Superior-room.jpg'),
('Deluxe Room', 1500000, 'Kamar deluxe dengan fasilitas premium', '["AC", "WiFi", "Kasur King", "Lemari", "Meja Kerja", "TV"]', '/images/Deluxe-room/Deluxe-room.jpg'),
('Suite Room', 1800000, 'Kamar suite dengan fasilitas mewah', '["AC", "WiFi", "Kasur King", "Lemari", "Meja Kerja", "TV", "Kulkas Mini"]', '/images/Suite-room/Suite-room.jpg'),
('Share Room', 800000, 'Kamar berbagi dengan 2 kasur', '["AC", "WiFi", "2 Kasur Single", "Lemari Bersama"]', '/images/Share-room/Share-room.jpg'),
('Large Room', 2000000, 'Kamar besar dengan ruang luas', '["AC", "WiFi", "Kasur King", "Lemari Besar", "Meja Kerja", "TV", "Sofa"]', '/images/Large-room/Large-room.jpg'),
('President Room', 2500000, 'Kamar presiden dengan fasilitas terlengkap', '["AC", "WiFi", "Kasur King", "Walk-in Closet", "Meja Kerja", "TV 55 inch", "Kulkas", "Sofa", "Balkon"]', '/images/President-room/President-room.jpg')
ON DUPLICATE KEY UPDATE base_price = VALUES(base_price);

-- 3. Insert sample users (Password: user123)
INSERT INTO users (name, username, email, password, phone, role) VALUES
('John Doe', 'johndoe', 'john@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567890', 'user'),
('Jane Smith', 'janesmith', 'jane@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567891', 'user'),
('Bob Wilson', 'bobwilson', 'bob@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567892', 'user'),
('Alice Johnson', 'alicejohnson', 'alice@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567893', 'user'),
('David Brown', 'davidbrown', 'david@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567894', 'user')
ON DUPLICATE KEY UPDATE password = VALUES(password);

-- 4. Insert rooms (jalankan setelah room_types berhasil diinsert)
INSERT INTO rooms (room_type_id, room_number, status, floor) VALUES
-- Standard Rooms
((SELECT id FROM room_types WHERE name = 'Standard Room'), 'STD-001', 'available', 1),
((SELECT id FROM room_types WHERE name = 'Standard Room'), 'STD-002', 'available', 1),
((SELECT id FROM room_types WHERE name = 'Standard Room'), 'STD-003', 'available', 1),
((SELECT id FROM room_types WHERE name = 'Standard Room'), 'STD-004', 'available', 1),
((SELECT id FROM room_types WHERE name = 'Standard Room'), 'STD-005', 'available', 1),
-- Superior Rooms
((SELECT id FROM room_types WHERE name = 'Superior Room'), 'SUP-001', 'available', 2),
((SELECT id FROM room_types WHERE name = 'Superior Room'), 'SUP-002', 'available', 2),
((SELECT id FROM room_types WHERE name = 'Superior Room'), 'SUP-003', 'available', 2),
((SELECT id FROM room_types WHERE name = 'Superior Room'), 'SUP-004', 'available', 2),
((SELECT id FROM room_types WHERE name = 'Superior Room'), 'SUP-005', 'available', 2),
-- Deluxe Rooms
((SELECT id FROM room_types WHERE name = 'Deluxe Room'), 'DLX-001', 'available', 3),
((SELECT id FROM room_types WHERE name = 'Deluxe Room'), 'DLX-002', 'available', 3),
((SELECT id FROM room_types WHERE name = 'Deluxe Room'), 'DLX-003', 'available', 3),
((SELECT id FROM room_types WHERE name = 'Deluxe Room'), 'DLX-004', 'available', 3),
((SELECT id FROM room_types WHERE name = 'Deluxe Room'), 'DLX-005', 'available', 3),
-- Suite Rooms
((SELECT id FROM room_types WHERE name = 'Suite Room'), 'STE-001', 'available', 4),
((SELECT id FROM room_types WHERE name = 'Suite Room'), 'STE-002', 'available', 4),
((SELECT id FROM room_types WHERE name = 'Suite Room'), 'STE-003', 'available', 4),
((SELECT id FROM room_types WHERE name = 'Suite Room'), 'STE-004', 'available', 4),
((SELECT id FROM room_types WHERE name = 'Suite Room'), 'STE-005', 'available', 4),
-- Share Rooms
((SELECT id FROM room_types WHERE name = 'Share Room'), 'SHR-001', 'available', 1),
((SELECT id FROM room_types WHERE name = 'Share Room'), 'SHR-002', 'available', 1),
((SELECT id FROM room_types WHERE name = 'Share Room'), 'SHR-003', 'available', 1),
((SELECT id FROM room_types WHERE name = 'Share Room'), 'SHR-004', 'available', 1),
((SELECT id FROM room_types WHERE name = 'Share Room'), 'SHR-005', 'available', 1),
-- Large Rooms
((SELECT id FROM room_types WHERE name = 'Large Room'), 'LRG-001', 'available', 5),
((SELECT id FROM room_types WHERE name = 'Large Room'), 'LRG-002', 'available', 5),
((SELECT id FROM room_types WHERE name = 'Large Room'), 'LRG-003', 'available', 5),
((SELECT id FROM room_types WHERE name = 'Large Room'), 'LRG-004', 'available', 5),
((SELECT id FROM room_types WHERE name = 'Large Room'), 'LRG-005', 'available', 5),
-- President Rooms
((SELECT id FROM room_types WHERE name = 'President Room'), 'PRE-001', 'available', 6),
((SELECT id FROM room_types WHERE name = 'President Room'), 'PRE-002', 'available', 6),
((SELECT id FROM room_types WHERE name = 'President Room'), 'PRE-003', 'available', 6),
((SELECT id FROM room_types WHERE name = 'President Room'), 'PRE-004', 'available', 6),
((SELECT id FROM room_types WHERE name = 'President Room'), 'PRE-005', 'available', 6)
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- 5. Insert notifications
INSERT INTO notifications (user_id, title, message, type, is_read) VALUES
(NULL, 'Selamat Datang', 'Selamat datang di Kost Professional! Sistem siap digunakan.', 'general', false),
(NULL, 'Info Pembayaran', 'Pembayaran dapat dilakukan setiap tanggal 1-10 setiap bulannya.', 'payment', false)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- 6. Cek hasil
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Room Types', COUNT(*) FROM room_types
UNION ALL
SELECT 'Rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications;

-- 7. Lihat data users
SELECT id, name, email, role, status, created_at FROM users ORDER BY role, created_at;