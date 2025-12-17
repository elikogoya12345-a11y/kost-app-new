-- Supabase PostgreSQL Schema for KostPro

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Room types table
CREATE TABLE room_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    facilities JSONB,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE rooms (
    id SERIAL PRIMARY KEY,
    room_type_id INTEGER REFERENCES room_types(id),
    room_number VARCHAR(10) NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'maintenance')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Occupants table
CREATE TABLE occupants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    room_id INTEGER REFERENCES rooms(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    room_type_id INTEGER REFERENCES room_types(id),
    room_id INTEGER REFERENCES rooms(id),
    start_date DATE NOT NULL,
    duration_months INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    occupant_id INTEGER REFERENCES occupants(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Complaints table
CREATE TABLE complaints (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    room_id INTEGER REFERENCES rooms(id),
    facility VARCHAR(100),
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    admin_response TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Administrator', 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');

-- Insert room types
INSERT INTO room_types (name, price, description, facilities, image_url) VALUES
('Standard Room', 800000, 'Kamar standar dengan fasilitas dasar', '["AC", "WiFi", "Kasur Single", "Lemari"]', '/images/Standard-room/Standard-room.jpg'),
('Superior Room', 1200000, 'Kamar superior dengan fasilitas lengkap', '["AC", "WiFi", "Kasur Queen", "Lemari", "Meja Kerja"]', '/images/Superior-room/Superior-room.jpg'),
('Deluxe Room', 1500000, 'Kamar deluxe dengan fasilitas premium', '["AC", "WiFi", "Kasur King", "Lemari", "Meja Kerja", "TV"]', '/images/Deluxe-room/Deluxe-room.jpg'),
('Suite Room', 2000000, 'Kamar suite dengan fasilitas mewah', '["AC", "WiFi", "Kasur King", "Lemari", "Meja Kerja", "TV", "Kulkas Mini"]', '/images/Suite-room/Suite-room.jpg'),
('Share Room', 600000, 'Kamar berbagi dengan 2 kasur', '["AC", "WiFi", "2 Kasur Single", "Lemari Bersama"]', '/images/Share-room/Share-room.jpg'),
('Twin Room', 1000000, 'Kamar twin dengan 2 kasur terpisah', '["AC", "WiFi", "2 Kasur Single", "2 Lemari", "Meja Kerja"]', '/images/Twin-room/Twin-room.jpg'),
('Large Room', 1800000, 'Kamar besar dengan ruang luas', '["AC", "WiFi", "Kasur King", "Lemari Besar", "Meja Kerja", "TV", "Sofa"]', '/images/Large-room/Large-room.jpg'),
('President Room', 3000000, 'Kamar presiden dengan fasilitas terlengkap', '["AC", "WiFi", "Kasur King", "Walk-in Closet", "Meja Kerja", "TV 55 inch", "Kulkas", "Sofa", "Balkon"]', '/images/President-room/President-room.jpg');

-- Insert sample rooms
INSERT INTO rooms (room_type_id, room_number, status) VALUES
(1, 'STD-001', 'available'), (1, 'STD-002', 'available'), (1, 'STD-003', 'occupied'),
(2, 'SUP-001', 'available'), (2, 'SUP-002', 'available'),
(3, 'DLX-001', 'available'), (3, 'DLX-002', 'occupied'),
(4, 'STE-001', 'available'),
(5, 'SHR-001', 'available'), (5, 'SHR-002', 'available'),
(6, 'TWN-001', 'available'),
(7, 'LRG-001', 'available'),
(8, 'PRE-001', 'available');