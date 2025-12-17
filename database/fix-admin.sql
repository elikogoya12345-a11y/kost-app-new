-- Fix admin user
USE kost_professional;

-- Hapus user admin yang lama (jika ada)
DELETE FROM users WHERE username = 'admin' OR email = 'admin@kostapp.com';

-- Buat user admin baru dengan data yang benar
-- Username: admin
-- Email: admin@kostapp.com
-- Password: admin123
INSERT INTO users (name, username, email, password, role) VALUES 
('Administrator', 'admin', 'admin@kostapp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Verifikasi
SELECT id, name, username, email, role FROM users WHERE username = 'admin';