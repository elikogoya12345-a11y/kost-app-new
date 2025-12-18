-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 18 Des 2025 pada 04.22
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `kost_professional`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `bookings`
--

CREATE TABLE `bookings` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `duration_months` int(11) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','cancelled') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `bookings`
--

INSERT INTO `bookings` (`id`, `user_id`, `room_id`, `start_date`, `duration_months`, `total_amount`, `status`, `notes`, `created_at`) VALUES
(5, 3, 65, '2025-12-13', 1, 1800000.00, 'confirmed', NULL, '2025-12-13 10:42:18'),
(6, 4, 48, '2025-12-19', 1, 600000.00, 'confirmed', NULL, '2025-12-13 10:57:27');

-- --------------------------------------------------------

--
-- Struktur dari tabel `complaints`
--

CREATE TABLE `complaints` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `category` varchar(50) DEFAULT NULL,
  `priority` enum('low','medium','high') DEFAULT 'medium',
  `description` text NOT NULL,
  `facility_type` varchar(100) DEFAULT NULL,
  `status` enum('open','in_progress','resolved') DEFAULT 'open',
  `admin_response` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `complaints`
--

INSERT INTO `complaints` (`id`, `user_id`, `room_id`, `title`, `category`, `priority`, `description`, `facility_type`, `status`, `admin_response`, `created_at`, `updated_at`) VALUES
(3, 3, 65, 'AC MATI', 'fasilitas', 'medium', 'AC NYA MATI ', 'AC', 'resolved', NULL, '2025-12-13 11:05:58', '2025-12-13 11:07:17');

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','warning','success') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `created_at`) VALUES
(1, NULL, 'Selamat Datang', 'Selamat datang di sistem manajemen kost profesional', 'info', 0, '2025-12-13 08:36:30'),
(2, NULL, 'Pembersihan Rutin', 'Akan dilakukan pembersihan rutin area umum setiap hari Minggu', 'info', 0, '2025-12-13 08:36:30'),
(4, 3, 'AC MATI ', 'NANTI MINGGU SAYA PERBAIKI ', 'info', 0, '2025-12-13 11:06:43');

-- --------------------------------------------------------

--
-- Struktur dari tabel `occupants`
--

CREATE TABLE `occupants` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `occupants`
--

INSERT INTO `occupants` (`id`, `user_id`, `room_id`, `start_date`, `end_date`, `status`, `created_at`) VALUES
(1, 3, 66, '2025-12-13', '2026-01-13', 'active', '2025-12-13 10:48:46'),
(3, 4, 48, '2025-12-19', '2026-01-18', 'active', '2025-12-13 10:57:56');

-- --------------------------------------------------------

--
-- Struktur dari tabel `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `booking_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_date` date DEFAULT NULL,
  `due_date` date NOT NULL,
  `month_year` varchar(7) NOT NULL,
  `status` enum('pending','paid','overdue') DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `proof_image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `payments`
--

INSERT INTO `payments` (`id`, `user_id`, `booking_id`, `amount`, `payment_date`, `due_date`, `month_year`, `status`, `payment_method`, `proof_image`, `created_at`) VALUES
(4, 3, 5, 1800000.00, '2025-12-13', '2025-12-13', '2025-12', 'paid', NULL, NULL, '2025-12-13 10:42:20'),
(5, 4, 6, 600000.00, '2025-12-13', '2025-12-19', '2025-12', 'paid', NULL, NULL, '2025-12-13 10:57:29');

-- --------------------------------------------------------

--
-- Struktur dari tabel `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `room_number` varchar(10) NOT NULL,
  `room_type_id` int(11) NOT NULL,
  `floor` int(11) DEFAULT NULL,
  `status` enum('available','occupied','maintenance') DEFAULT 'available',
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `rooms`
--

INSERT INTO `rooms` (`id`, `room_number`, `room_type_id`, `floor`, `status`, `description`, `created_at`) VALUES
(1, '101', 1, 1, 'available', NULL, '2025-12-13 08:36:28'),
(2, '102', 1, 1, 'occupied', NULL, '2025-12-13 08:36:28'),
(3, '103', 1, 1, 'available', NULL, '2025-12-13 08:36:28'),
(4, '104', 1, 1, 'available', NULL, '2025-12-13 08:36:28'),
(5, '105', 1, 1, 'available', NULL, '2025-12-13 08:36:28'),
(6, '201', 1, 2, 'available', NULL, '2025-12-13 08:36:28'),
(7, '202', 1, 2, 'available', NULL, '2025-12-13 08:36:28'),
(8, '203', 1, 2, 'available', NULL, '2025-12-13 08:36:28'),
(9, '204', 1, 2, 'available', NULL, '2025-12-13 08:36:28'),
(10, '205', 1, 2, 'available', NULL, '2025-12-13 08:36:28'),
(11, '301', 1, 2, 'available', NULL, '2025-12-13 08:36:28'),
(12, '302', 1, 3, 'available', NULL, '2025-12-13 08:36:28'),
(13, '303', 1, 3, 'available', NULL, '2025-12-13 08:36:28'),
(14, '304', 1, 3, 'available', NULL, '2025-12-13 08:36:28'),
(15, '305', 1, 3, 'available', NULL, '2025-12-13 08:36:28'),
(16, '106', 2, 2, 'available', NULL, '2025-12-13 08:36:28'),
(17, '107', 2, 2, 'available', NULL, '2025-12-13 08:36:28'),
(18, '108', 2, 2, 'available', NULL, '2025-12-13 08:36:28'),
(19, '109', 2, 2, 'available', NULL, '2025-12-13 08:36:28'),
(20, '206', 2, 2, 'available', NULL, '2025-12-13 08:36:28'),
(21, '207', 2, 2, 'available', NULL, '2025-12-13 08:36:28'),
(22, '208', 2, 2, 'available', NULL, '2025-12-13 08:36:28'),
(23, '209', 2, 2, 'available', NULL, '2025-12-13 08:36:28'),
(24, '306', 2, 3, 'available', NULL, '2025-12-13 08:36:28'),
(25, '307', 2, 3, 'available', NULL, '2025-12-13 08:36:28'),
(26, '308', 2, 3, 'available', NULL, '2025-12-13 08:36:28'),
(27, '309', 2, 3, 'available', NULL, '2025-12-13 08:36:28'),
(28, '110', 3, 2, 'available', NULL, '2025-12-13 08:36:28'),
(29, '111', 3, 1, 'available', NULL, '2025-12-13 08:36:28'),
(30, '112', 3, 1, 'available', NULL, '2025-12-13 08:36:28'),
(31, '210', 3, 2, 'available', NULL, '2025-12-13 08:36:28'),
(32, '211', 3, 2, 'available', NULL, '2025-12-13 08:36:28'),
(33, '212', 3, 2, 'available', NULL, '2025-12-13 08:36:28'),
(34, '310', 3, 3, 'available', NULL, '2025-12-13 08:36:28'),
(35, '311', 3, 3, 'available', NULL, '2025-12-13 08:36:28'),
(36, '312', 3, 3, 'available', NULL, '2025-12-13 08:36:28'),
(37, '313', 3, 3, 'available', NULL, '2025-12-13 08:36:28'),
(38, '401', 4, 4, 'available', NULL, '2025-12-13 08:36:28'),
(39, '402', 4, 4, 'available', NULL, '2025-12-13 08:36:28'),
(40, '403', 4, 4, 'available', NULL, '2025-12-13 08:36:28'),
(41, '404', 4, 4, 'available', NULL, '2025-12-13 08:36:28'),
(42, '501', 4, 5, 'available', NULL, '2025-12-13 08:36:28'),
(43, '502', 4, 5, 'available', NULL, '2025-12-13 08:36:28'),
(44, '503', 4, 5, 'available', NULL, '2025-12-13 08:36:28'),
(45, '504', 4, 5, 'available', NULL, '2025-12-13 08:36:28'),
(46, 'B01', 5, 1, 'occupied', NULL, '2025-12-13 08:36:28'),
(47, 'B02', 5, 1, 'occupied', NULL, '2025-12-13 08:36:28'),
(48, 'B03', 5, 1, 'occupied', NULL, '2025-12-13 08:36:28'),
(49, 'B04', 5, 1, 'available', NULL, '2025-12-13 08:36:28'),
(50, 'B05', 5, 1, 'available', NULL, '2025-12-13 08:36:28'),
(51, 'B06', 5, 1, 'available', NULL, '2025-12-13 08:36:28'),
(52, 'B07', 5, 1, 'available', NULL, '2025-12-13 08:36:28'),
(53, 'B08', 5, 1, 'available', NULL, '2025-12-13 08:36:28'),
(54, 'B09', 5, 1, 'available', NULL, '2025-12-13 08:36:28'),
(55, 'B10', 5, 1, 'available', NULL, '2025-12-13 08:36:28'),
(64, '505', 7, 5, 'available', NULL, '2025-12-13 08:36:28'),
(65, '506', 7, 5, 'occupied', NULL, '2025-12-13 08:36:28'),
(66, '507', 7, 5, 'occupied', NULL, '2025-12-13 08:36:28'),
(67, '601', 7, 5, 'available', NULL, '2025-12-13 08:36:28'),
(68, '602', 7, 5, 'available', NULL, '2025-12-13 08:36:28'),
(69, '603', 7, 5, 'available', NULL, '2025-12-13 08:36:28'),
(70, '701', 8, 5, 'available', NULL, '2025-12-13 08:36:28'),
(71, '702', 8, 5, 'available', NULL, '2025-12-13 08:36:28'),
(72, '703', 8, 5, 'available', NULL, '2025-12-13 08:36:28'),
(73, '704', 8, 5, 'available', NULL, '2025-12-13 11:13:09'),
(74, '705', 8, 5, 'available', NULL, '2025-12-13 17:12:21');

-- --------------------------------------------------------

--
-- Struktur dari tabel `room_types`
--

CREATE TABLE `room_types` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `facilities` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`facilities`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `room_types`
--

INSERT INTO `room_types` (`id`, `name`, `description`, `base_price`, `facilities`, `created_at`) VALUES
(1, 'Standard Room', 'Kamar standar dengan fasilitas dasar', 800000.00, '[\"Kasur Single\", \"Lemari\", \"Meja Belajar\", \"AC\", \"WiFi\"]', '2025-12-13 08:36:28'),
(2, 'Superior Room', 'Kamar superior dengan fasilitas lebih lengkap', 1200000.00, '[\"Kasur Queen\", \"Lemari Besar\", \"Meja Belajar\", \"AC\", \"WiFi\", \"TV\", \"Kulkas Mini\"]', '2025-12-13 08:36:28'),
(3, 'Deluxe Room', 'Kamar deluxe dengan fasilitas premium', 1500000.00, '[\"Kasur Queen\", \"Lemari Built-in\", \"Meja Kerja\", \"AC\", \"WiFi\", \"TV LED\", \"Kulkas\", \"Sofa\"]', '2025-12-13 08:36:28'),
(4, 'Suite Room', 'Kamar suite dengan ruang tamu terpisah', 2000000.00, '[\"Kasur King\", \"Walk-in Closet\", \"Meja Kerja\", \"AC\", \"WiFi\", \"TV LED\", \"Kulkas\", \"Sofa\", \"Ruang Tamu\"]', '2025-12-13 08:36:28'),
(5, 'Share Room', 'Kamar berbagi untuk 2 orang', 600000.00, '[\"2 Kasur Single\", \"2 Lemari\", \"2 Meja Belajar\", \"AC\", \"WiFi\"]', '2025-12-13 08:36:28'),
(7, 'Large Room', 'Kamar besar dengan space luas', 1800000.00, '[\"Kasur King\", \"Lemari Besar\", \"Meja Kerja Besar\", \"AC\", \"WiFi\", \"TV LED\", \"Kulkas\", \"Area Santai\"]', '2025-12-13 08:36:28'),
(8, 'President Room', 'Kamar president dengan fasilitas mewah', 3000000.00, '[\"Kasur King Premium\", \"Walk-in Closet\", \"Meja Kerja Executive\", \"AC Central\", \"WiFi Premium\", \"TV LED 55\", \"Kulkas Besar\", \"Sofa Set\", \"Ruang Tamu\", \"Balkon\"]', '2025-12-13 08:36:28');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `address` text DEFAULT NULL,
  `role` enum('admin','user') DEFAULT 'user',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `username`, `password`, `phone`, `birth_date`, `address`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'admin', 'admin', '$2a$10$xCx/Bsmrnct9bJCCK3TINezlkv8PZRciSs7Ve8Sn9YPkE6ZfTHZo2', NULL, NULL, NULL, 'admin', 'active', '2025-12-13 08:36:28', '2025-12-13 08:36:28'),
(3, 'DAMIANUS LOWA MITE ', 'damianuslowamite@gmail.com', 'DAMIAN', '$2a$10$HW5Old8W11unetEcai.YBO2TV5rRLkxqcHP9seGOSD9Tj9h5uaMNC', '081283456889', '2025-12-19', 'MEDANG LESTARI', 'user', 'active', '2025-12-13 10:41:05', '2025-12-13 10:41:05'),
(4, 'ELIGRAH ', 'eligrahphilip@gmail.com', 'eligrah', '$2a$10$K1I0dTIenkdTQXAmKovisuLz6lKDK.9/TjK9vVYJhc7IP6ysM5HWq', '082291817138', '2025-12-13', 'JALAN HALIM ', 'user', 'active', '2025-12-13 10:56:55', '2025-12-13 10:56:55');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indeks untuk tabel `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indeks untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `occupants`
--
ALTER TABLE `occupants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indeks untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Indeks untuk tabel `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `room_number` (`room_number`),
  ADD KEY `room_type_id` (`room_type_id`);

--
-- Indeks untuk tabel `room_types`
--
ALTER TABLE `room_types`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `bookings`
--
ALTER TABLE `bookings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT untuk tabel `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `occupants`
--
ALTER TABLE `occupants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=77;

--
-- AUTO_INCREMENT untuk tabel `room_types`
--
ALTER TABLE `room_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

--
-- Ketidakleluasaan untuk tabel `complaints`
--
ALTER TABLE `complaints`
  ADD CONSTRAINT `complaints_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `complaints_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

--
-- Ketidakleluasaan untuk tabel `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Ketidakleluasaan untuk tabel `occupants`
--
ALTER TABLE `occupants`
  ADD CONSTRAINT `occupants_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `occupants_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

--
-- Ketidakleluasaan untuk tabel `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `payments_ibfk_2` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`);

--
-- Ketidakleluasaan untuk tabel `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_types` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
