-- Reset and seed database with 35 rooms
USE kost_professional;

-- Clear existing data
DELETE FROM payments;
DELETE FROM occupants;
DELETE FROM bookings;
DELETE FROM rooms;
DELETE FROM room_types WHERE name = 'Twin Room';

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
description = VALUES(description),
facilities = VALUES(facilities),
image_url = VALUES(image_url);

-- Insert 35 rooms (5 per type)
INSERT INTO rooms (room_type_id, room_number, status, floor) VALUES
-- Standard Room (5 rooms)
(1, 'STD-001', 'available', 1), (1, 'STD-002', 'available', 1), (1, 'STD-003', 'available', 1), (1, 'STD-004', 'available', 1), (1, 'STD-005', 'available', 1),
-- Superior Room (5 rooms)
(2, 'SUP-001', 'available', 2), (2, 'SUP-002', 'available', 2), (2, 'SUP-003', 'available', 2), (2, 'SUP-004', 'available', 2), (2, 'SUP-005', 'available', 2),
-- Deluxe Room (5 rooms)
(3, 'DLX-001', 'available', 3), (3, 'DLX-002', 'available', 3), (3, 'DLX-003', 'available', 3), (3, 'DLX-004', 'available', 3), (3, 'DLX-005', 'available', 3),
-- Suite Room (5 rooms)
(4, 'STE-001', 'available', 4), (4, 'STE-002', 'available', 4), (4, 'STE-003', 'available', 4), (4, 'STE-004', 'available', 4), (4, 'STE-005', 'available', 4),
-- Share Room (5 rooms)
(5, 'SHR-001', 'available', 1), (5, 'SHR-002', 'available', 1), (5, 'SHR-003', 'available', 1), (5, 'SHR-004', 'available', 1), (5, 'SHR-005', 'available', 1),
-- Large Room (5 rooms)
(6, 'LRG-001', 'available', 5), (6, 'LRG-002', 'available', 5), (6, 'LRG-003', 'available', 5), (6, 'LRG-004', 'available', 5), (6, 'LRG-005', 'available', 5),
-- President Room (5 rooms)
(7, 'PRE-001', 'available', 6), (7, 'PRE-002', 'available', 6), (7, 'PRE-003', 'available', 6), (7, 'PRE-004', 'available', 6), (7, 'PRE-005', 'available', 6);

-- Verify results
SELECT 'Room Types Count:' as info, COUNT(*) as count FROM room_types;
SELECT 'Total Rooms:' as info, COUNT(*) as count FROM rooms;
SELECT rt.name, COUNT(r.id) as room_count FROM room_types rt LEFT JOIN rooms r ON rt.id = r.room_type_id GROUP BY rt.id, rt.name;