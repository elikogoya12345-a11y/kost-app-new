-- Insert admin user (password: admin123)
INSERT INTO users (name, username, email, password, role) VALUES 
('Administrator', 'admin', 'admin@kostapp.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', 'admin');

-- Insert room types with proper image paths
INSERT INTO room_types (name, base_price, description, facilities, image_url) VALUES
('Standard Room', 800000, 'Kamar standar dengan fasilitas dasar', '["AC", "WiFi", "Kasur Single", "Lemari"]', '/images/Standard-room/Standard-room.jpg'),
('Superior Room', 1200000, 'Kamar superior dengan fasilitas lengkap', '["AC", "WiFi", "Kasur Queen", "Lemari", "Meja Kerja"]', '/images/Superior-room/Superior-room.jpg'),
('Deluxe Room', 1500000, 'Kamar deluxe dengan fasilitas premium', '["AC", "WiFi", "Kasur King", "Lemari", "Meja Kerja", "TV"]', '/images/Deluxe-room/Deluxe-room.jpg'),
('Suite Room', 2000000, 'Kamar suite dengan fasilitas mewah', '["AC", "WiFi", "Kasur King", "Lemari", "Meja Kerja", "TV", "Kulkas Mini"]', '/images/Suite-room/Suite-room.jpg'),
('Share Room', 600000, 'Kamar berbagi dengan 2 kasur', '["AC", "WiFi", "2 Kasur Single", "Lemari Bersama"]', '/images/Share-room/Share-room.jpg'),
('Twin Room', 1000000, 'Kamar twin dengan 2 kasur terpisah', '["AC", "WiFi", "2 Kasur Single", "2 Lemari", "Meja Kerja"]', '/images/Twin-room/Twin-room.jpg'),
('Large Room', 1800000, 'Kamar besar dengan ruang luas', '["AC", "WiFi", "Kasur King", "Lemari Besar", "Meja Kerja", "TV", "Sofa"]', '/images/Large-room/Large-room.jpg'),
('President Room', 3000000, 'Kamar presiden dengan fasilitas terlengkap', '["AC", "WiFi", "Kasur King", "Walk-in Closet", "Meja Kerja", "TV 55 inch", "Kulkas", "Sofa", "Balkon"]', '/images/President-room/President-room.jpg');

-- Insert rooms - ALL AVAILABLE for booking
INSERT INTO rooms (room_type_id, room_number, status) VALUES
-- Standard Room (10 rooms)
(1, 'STD-001', 'available'), (1, 'STD-002', 'available'), (1, 'STD-003', 'available'), (1, 'STD-004', 'available'), (1, 'STD-005', 'available'),
(1, 'STD-006', 'available'), (1, 'STD-007', 'available'), (1, 'STD-008', 'available'), (1, 'STD-009', 'available'), (1, 'STD-010', 'available'),
-- Superior Room (12 rooms)
(2, 'SUP-001', 'available'), (2, 'SUP-002', 'available'), (2, 'SUP-003', 'available'), (2, 'SUP-004', 'available'), (2, 'SUP-005', 'available'), 
(2, 'SUP-006', 'available'), (2, 'SUP-007', 'available'), (2, 'SUP-008', 'available'), (2, 'SUP-009', 'available'), (2, 'SUP-010', 'available'),
(2, 'SUP-011', 'available'), (2, 'SUP-012', 'available'),
-- Deluxe Room (15 rooms)
(3, 'DLX-001', 'available'), (3, 'DLX-002', 'available'), (3, 'DLX-003', 'available'), (3, 'DLX-004', 'available'), (3, 'DLX-005', 'available'), 
(3, 'DLX-006', 'available'), (3, 'DLX-007', 'available'), (3, 'DLX-008', 'available'), (3, 'DLX-009', 'available'), (3, 'DLX-010', 'available'),
(3, 'DLX-011', 'available'), (3, 'DLX-012', 'available'), (3, 'DLX-013', 'available'), (3, 'DLX-014', 'available'), (3, 'DLX-015', 'available'),
-- Suite Room (8 rooms)
(4, 'STE-001', 'available'), (4, 'STE-002', 'available'), (4, 'STE-003', 'available'), (4, 'STE-004', 'available'), 
(4, 'STE-005', 'available'), (4, 'STE-006', 'available'), (4, 'STE-007', 'available'), (4, 'STE-008', 'available'),
-- Share Room (20 rooms)
(5, 'SHR-001', 'available'), (5, 'SHR-002', 'available'), (5, 'SHR-003', 'available'), (5, 'SHR-004', 'available'), (5, 'SHR-005', 'available'), 
(5, 'SHR-006', 'available'), (5, 'SHR-007', 'available'), (5, 'SHR-008', 'available'), (5, 'SHR-009', 'available'), (5, 'SHR-010', 'available'), 
(5, 'SHR-011', 'available'), (5, 'SHR-012', 'available'), (5, 'SHR-013', 'available'), (5, 'SHR-014', 'available'), (5, 'SHR-015', 'available'),
(5, 'SHR-016', 'available'), (5, 'SHR-017', 'available'), (5, 'SHR-018', 'available'), (5, 'SHR-019', 'available'), (5, 'SHR-020', 'available'),
-- Twin Room (10 rooms)
(6, 'TWN-001', 'available'), (6, 'TWN-002', 'available'), (6, 'TWN-003', 'available'), (6, 'TWN-004', 'available'), (6, 'TWN-005', 'available'), 
(6, 'TWN-006', 'available'), (6, 'TWN-007', 'available'), (6, 'TWN-008', 'available'), (6, 'TWN-009', 'available'), (6, 'TWN-010', 'available'),
-- Large Room (8 rooms)
(7, 'LRG-001', 'available'), (7, 'LRG-002', 'available'), (7, 'LRG-003', 'available'), (7, 'LRG-004', 'available'), 
(7, 'LRG-005', 'available'), (7, 'LRG-006', 'available'), (7, 'LRG-007', 'available'), (7, 'LRG-008', 'available'),
-- President Room (5 rooms)
(8, 'PRE-001', 'available'), (8, 'PRE-002', 'available'), (8, 'PRE-003', 'available'), (8, 'PRE-004', 'available'), (8, 'PRE-005', 'available');

-- Insert sample users (password: user123)
INSERT INTO users (name, username, email, password, phone, role, status) VALUES
('John Doe', 'johndoe', 'john@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567890', 'user', 'active'),
('Jane Smith', 'janesmith', 'jane@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567891', 'user', 'active'),
('Bob Wilson', 'bobwilson', 'bob@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567892', 'user', 'active'),
('Alice Johnson', 'alicejohnson', 'alice@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567893', 'user', 'active'),
('Charlie Brown', 'charliebrown', 'charlie@example.com', '$2a$10$AdFI1Gt4ru.Nj8w.6srR/eW0LTQm54TRAwbnFYN2H3MEhBrJKKxra', '081234567894', 'user', 'active');

-- Insert sample notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
(NULL, 'Selamat Datang', 'Selamat datang di Kost Professional! Nikmati fasilitas terbaik kami.', 'info'),
(NULL, 'Pengumuman Penting', 'Pemeliharaan sistem air akan dilakukan setiap hari Minggu pagi.', 'announcement'),
(2, 'Selamat Datang', 'Terima kasih telah bergabung dengan Kost Professional!', 'welcome'),
(3, 'Selamat Datang', 'Terima kasih telah bergabung dengan Kost Professional!', 'welcome'),
(4, 'Selamat Datang', 'Terima kasih telah bergabung dengan Kost Professional!', 'welcome');

-- Show summary
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as total_rooms FROM rooms;
SELECT COUNT(*) as total_users FROM users;
SELECT COUNT(*) as total_room_types FROM room_types;