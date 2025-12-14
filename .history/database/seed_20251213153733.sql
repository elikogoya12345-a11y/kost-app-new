USE kost_professional;

-- Insert admin user
INSERT INTO users (name, email, username, password, role) VALUES 
('Admin', 'admin', 'admin', '$2a$10$xCx/Bsmrnct9bJCCK3TINezlkv8PZRciSs7Ve8Sn9YPkE6ZfTHZo2', 'admin');

-- Insert room types (9 types as requested)
INSERT INTO room_types (name, description, base_price, facilities) VALUES
('Standard Room', 'Kamar standar dengan fasilitas dasar', 800000, '["Kasur Single", "Lemari", "Meja Belajar", "AC", "WiFi"]'),
('Superior Room', 'Kamar superior dengan fasilitas lebih lengkap', 1200000, '["Kasur Queen", "Lemari Besar", "Meja Belajar", "AC", "WiFi", "TV", "Kulkas Mini"]'),
('Deluxe Room', 'Kamar deluxe dengan fasilitas premium', 1500000, '["Kasur Queen", "Lemari Built-in", "Meja Kerja", "AC", "WiFi", "TV LED", "Kulkas", "Sofa"]'),
('Suite Room', 'Kamar suite dengan ruang tamu terpisah', 2000000, '["Kasur King", "Walk-in Closet", "Meja Kerja", "AC", "WiFi", "TV LED", "Kulkas", "Sofa", "Ruang Tamu"]'),
('Share Room', 'Kamar berbagi untuk 2 orang', 600000, '["2 Kasur Single", "2 Lemari", "2 Meja Belajar", "AC", "WiFi"]'),
('Twin Room', 'Kamar twin dengan 2 kasur terpisah', 1000000, '["2 Kasur Single", "2 Lemari", "2 Meja Belajar", "AC", "WiFi", "TV"]'),
('Large Room', 'Kamar besar dengan space luas', 1800000, '["Kasur King", "Lemari Besar", "Meja Kerja Besar", "AC", "WiFi", "TV LED", "Kulkas", "Area Santai"]'),
('President Room', 'Kamar president dengan fasilitas mewah', 3000000, '["Kasur King Premium", "Walk-in Closet", "Meja Kerja Executive", "AC Central", "WiFi Premium", "TV LED 55", "Kulkas Besar", "Sofa Set", "Ruang Tamu", "Balkon"]');

-- Insert rooms (5-15 per type)
-- Standard Room (15 rooms)
INSERT INTO rooms (room_number, room_type_id, floor) VALUES
('101', 1, 1), ('102', 1, 1), ('103', 1, 1), ('104', 1, 1), ('105', 1, 1),
('201', 1, 2), ('202', 1, 2), ('203', 1, 2), ('204', 1, 2), ('205', 1, 2),
('301', 1, 3), ('302', 1, 3), ('303', 1, 3), ('304', 1, 3), ('305', 1, 3);

-- Superior Room (12 rooms)
INSERT INTO rooms (room_number, room_type_id, floor) VALUES
('106', 2, 1), ('107', 2, 1), ('108', 2, 1), ('109', 2, 1),
('206', 2, 2), ('207', 2, 2), ('208', 2, 2), ('209', 2, 2),
('306', 2, 3), ('307', 2, 3), ('308', 2, 3), ('309', 2, 3);

-- Deluxe Room (10 rooms)
INSERT INTO rooms (room_number, room_type_id, floor) VALUES
('110', 3, 1), ('111', 3, 1), ('112', 3, 1),
('210', 3, 2), ('211', 3, 2), ('212', 3, 2),
('310', 3, 3), ('311', 3, 3), ('312', 3, 3), ('313', 3, 3);

-- Suite Room (8 rooms)
INSERT INTO rooms (room_number, room_type_id, floor) VALUES
('401', 4, 4), ('402', 4, 4), ('403', 4, 4), ('404', 4, 4),
('501', 4, 5), ('502', 4, 5), ('503', 4, 5), ('504', 4, 5);

-- Share Room (10 rooms)
INSERT INTO rooms (room_number, room_type_id, floor) VALUES
('B01', 5, 0), ('B02', 5, 0), ('B03', 5, 0), ('B04', 5, 0), ('B05', 5, 0),
('B06', 5, 0), ('B07', 5, 0), ('B08', 5, 0), ('B09', 5, 0), ('B10', 5, 0);

-- Twin Room (8 rooms)
INSERT INTO rooms (room_number, room_type_id, floor) VALUES
('113', 6, 1), ('114', 6, 1), ('213', 6, 2), ('214', 6, 2),
('314', 6, 3), ('315', 6, 3), ('405', 6, 4), ('406', 6, 4);

-- Large Room (6 rooms)
INSERT INTO rooms (room_number, room_type_id, floor) VALUES
('505', 7, 5), ('506', 7, 5), ('507', 7, 5),
('601', 7, 6), ('602', 7, 6), ('603', 7, 6);

-- President Room (3 rooms)
INSERT INTO rooms (room_number, room_type_id, floor) VALUES
('701', 8, 7), ('702', 8, 7), ('703', 8, 7);

-- Sample notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
(NULL, 'Selamat Datang', 'Selamat datang di sistem manajemen kost profesional', 'info'),
(NULL, 'Pembersihan Rutin', 'Akan dilakukan pembersihan rutin area umum setiap hari Minggu', 'info');