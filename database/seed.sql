USE kost_professional;

-- Insert admin user
INSERT INTO users (name, email, username, password, role) VALUES 
('Admin', 'admin', 'admin', '$2a$10$xCx/Bsmrnct9bJCCK3TINezlkv8PZRciSs7Ve8Sn9YPkE6ZfTHZo2', 'admin');

-- Insert room types untuk Kos Putra Bu Hartini
INSERT INTO room_types (name, description, base_price, facilities) VALUES
('Kamar Lantai Bawah', 'Kamar nyaman di lantai bawah dengan jendela menghadap luar', 1200000, '["Tempat Tidur", "Meja Belajar", "Lemari Pakaian", "Jendela Luar", "WiFi"]'),
('Kamar Lantai Atas', 'Kamar nyaman di lantai atas dengan sirkulasi udara baik', 1300000, '["Tempat Tidur", "Meja Belajar", "Lemari Pakaian", "Jendela Luar", "WiFi"]');

-- Insert rooms Kos Putra Bu Hartini (16 kamar total)
-- Kamar Lantai Bawah (9 kamar)
INSERT INTO rooms (room_number, room_type_id, floor) VALUES
('LB01', 1, 1), ('LB02', 1, 1), ('LB03', 1, 1), ('LB04', 1, 1), ('LB05', 1, 1),
('LB06', 1, 1), ('LB07', 1, 1), ('LB08', 1, 1), ('LB09', 1, 1);

-- Kamar Lantai Atas (7 kamar)
INSERT INTO rooms (room_number, room_type_id, floor) VALUES
('LA01', 2, 2), ('LA02', 2, 2), ('LA03', 2, 2), ('LA04', 2, 2),
('LA05', 2, 2), ('LA06', 2, 2), ('LA07', 2, 2);

-- Sample notifications
INSERT INTO notifications (user_id, title, message, type) VALUES
(NULL, 'Selamat Datang di Kos Putra Bu Hartini', 'Selamat datang di website resmi Kos Putra Bu Hartini - tempat tinggal nyaman dekat UMN', 'info'),
(NULL, 'Pembersihan Kamar Mandi', 'Kamar mandi dibersihkan setiap hari oleh asisten rumah tangga untuk menjaga kebersihan', 'info'),
(NULL, 'Fasilitas WiFi', 'Akses internet WiFi tersedia di seluruh area kos untuk mendukung aktivitas belajar', 'info');