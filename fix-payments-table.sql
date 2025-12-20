-- Fix payments table ENUM status
-- Jalankan di MySQL Workbench

-- 1. Cek struktur table saat ini
DESCRIBE payments;

-- 2. Backup data payments (jika ada)
CREATE TABLE payments_backup AS SELECT * FROM payments;

-- 3. Drop table payments
DROP TABLE payments;

-- 4. Buat ulang table payments dengan ENUM yang benar
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    occupant_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NULL,
    due_date DATE NOT NULL,
    status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (occupant_id) REFERENCES occupants(id) ON DELETE CASCADE
);

-- 5. Restore data dari backup (jika ada)
INSERT INTO payments SELECT * FROM payments_backup;

-- 6. Drop backup table
DROP TABLE payments_backup;

-- 7. Cek hasil
DESCRIBE payments;

-- 8. Test insert sample payment
INSERT INTO payments (occupant_id, amount, due_date, status) 
VALUES (1, 1000000, '2024-12-20', 'pending');

-- 9. Test update status ke paid
UPDATE payments SET status = 'paid', payment_date = NOW() WHERE id = LAST_INSERT_ID();

-- 10. Cek hasil
SELECT * FROM payments;