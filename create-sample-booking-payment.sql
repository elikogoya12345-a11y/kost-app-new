-- Query untuk membuat sample booking dan payment di MySQL Workbench
-- Jalankan query ini setelah user login

-- 1. Cek user yang ada
SELECT id, name, email FROM users WHERE role = 'user';

-- 2. Cek room yang tersedia
SELECT r.id, r.room_number, rt.name as room_type, rt.base_price 
FROM rooms r 
JOIN room_types rt ON r.room_type_id = rt.id 
WHERE r.status = 'available' 
LIMIT 5;

-- 3. Buat sample booking untuk user John Doe (ganti user_id sesuai hasil query 1)
-- Ganti user_id=2 dengan ID user yang sesuai dari query 1
-- Ganti room_id=1 dengan ID room yang sesuai dari query 2
INSERT INTO bookings (user_id, room_id, room_type_id, start_date, duration_months, total_amount, status, notes) 
VALUES (
    2, -- ID user John Doe (sesuaikan dengan hasil query 1)
    1, -- ID room pertama (sesuaikan dengan hasil query 2)
    1, -- ID room_type (sesuaikan dengan room_type_id dari query 2)
    '2024-12-20', -- tanggal mulai
    3, -- durasi 3 bulan
    3000000, -- total amount (3 x 1000000)
    'confirmed',
    'Sample booking for testing'
);

-- 4. Buat occupant record
INSERT INTO occupants (user_id, room_id, start_date, end_date, monthly_rent, status)
VALUES (
    2, -- ID user John Doe (sama dengan booking)
    1, -- ID room (sama dengan booking)
    '2024-12-20', -- tanggal mulai
    '2025-03-20', -- tanggal selesai (3 bulan)
    1000000, -- sewa bulanan
    'active'
);

-- 5. Buat payment records (3 bulan)
-- Ambil occupant_id yang baru dibuat
SET @occupant_id = LAST_INSERT_ID();

INSERT INTO payments (occupant_id, amount, due_date, status) VALUES
(@occupant_id, 1000000, '2024-12-20', 'pending'),
(@occupant_id, 1000000, '2025-01-20', 'pending'),
(@occupant_id, 1000000, '2025-02-20', 'pending');

-- 6. Update room status menjadi occupied
UPDATE rooms SET status = 'occupied' WHERE id = 1;

-- 7. Cek hasil
SELECT 'Bookings' as table_name, COUNT(*) as count FROM bookings
UNION ALL
SELECT 'Occupants', COUNT(*) FROM occupants
UNION ALL
SELECT 'Payments', COUNT(*) FROM payments;

-- 8. Lihat payment yang bisa dikonfirmasi
SELECT p.id, p.amount, p.due_date, p.status, r.room_number, rt.name as room_type, u.name as user_name
FROM payments p
JOIN occupants o ON p.occupant_id = o.id
JOIN users u ON o.user_id = u.id
JOIN rooms r ON o.room_id = r.id
JOIN room_types rt ON r.room_type_id = rt.id
WHERE p.status = 'pending';