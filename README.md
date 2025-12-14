# KostPro - Professional Boarding House Management System

Website manajemen kost profesional dengan Node.js, Express, MySQL, dan EJS yang dilengkapi dengan UI/UX modern menggunakan Tailwind CSS.

## ✨ Fitur Utama

### 🔐 Sistem Login (3 Mode Akses)
1. **Admin**: Email: `admin`, Password: `admin123`
2. **User**: Harus registrasi terlebih dahulu
3. **Guest**: Akses terbatas tanpa login

### 👑 Fitur Admin
- Dashboard dengan statistik real-time dan filter periode
- Kelola penghuni (aktif/nonaktif, hapus penghuni)
- Kelola kamar (9 tipe kamar, CRUD kamar)
- Laporan keuangan dengan filter dan export PDF
- Kelola pengaduan dengan update status
- Sistem notifikasi untuk user

### 👤 Fitur User
- Dashboard personal dengan tracking pembayaran
- Sistem booking kamar dengan 9 tipe pilihan
- Laporan pembayaran dengan export PDF
- Form pengaduan dengan fasilitas spesifik
- Pengajuan perpanjangan pembayaran

### 👥 Fitur Guest
- Informasi umum kost dan fasilitas
- Preview tipe kamar (redirect ke registrasi untuk detail)
- Kontak admin via WhatsApp

## 🏠 Tipe Kamar (9 Jenis)
1. Standard Room - Rp 800.000
2. Superior Room - Rp 1.200.000
3. Deluxe Room - Rp 1.500.000
4. Suite Room - Rp 2.000.000
5. Share Room - Rp 600.000
6. Twin Room - Rp 1.000.000
7. Large Room - Rp 1.800.000
8. President Room - Rp 3.000.000

## 🚀 Teknologi
- **Backend**: Node.js, Express.js
- **Database**: MySQL dengan mysql2/promise
- **Frontend**: EJS, Tailwind CSS (CDN)
- **Authentication**: Session-based dengan bcryptjs
- **Icons**: Font Awesome 6

## 📋 Instalasi

### 1. Clone & Install
```bash
git clone [repository-url]
cd kost-app-new
npm install
```

### 2. Setup Database
```bash
# Buat database MySQL
mysql -u root -p
CREATE DATABASE kost_professional;
exit

# Import schema dan data
mysql -u root -p kost_professional < database/schema.sql
mysql -u root -p kost_professional < database/seed.sql
```

### 3. Konfigurasi Environment
```bash
cp .env.example .env
# Edit .env sesuai konfigurasi database Anda
```

### 4. Jalankan Aplikasi
```bash
# Development
npm run dev

# Production
npm start
```

Aplikasi akan berjalan di `http://localhost:3000`

## 👥 Akun Default

### Admin
- Email: `admin`
- Password: `admin123`

## 📁 Struktur Database
- `users` - Data pengguna (admin/user)
- `room_types` - 9 tipe kamar dengan fasilitas
- `rooms` - Kamar individual (5-15 per tipe)
- `occupants` - Data penghuni aktif
- `bookings` - Riwayat booking
- `payments` - Tracking pembayaran
- `complaints` - Sistem pengaduan
- `notifications` - Notifikasi sistem

## 🎯 Alur Penggunaan

### Guest → User
1. Guest lihat landing page
2. Klik "Masuk Sebagai Tamu" untuk preview
3. Untuk booking → wajib registrasi
4. Setelah registrasi → login sebagai user

### User Flow
1. Login → Dashboard user
2. Lihat 9 tipe kamar → pilih kamar available
3. Form booking dengan durasi → total otomatis
4. Tracking pembayaran & pengajuan telat bayar
5. Form pengaduan dengan fasilitas spesifik

### Admin Flow
1. Login → Dashboard admin dengan statistik
2. Filter pendapatan (minggu/bulan/tahun)
3. Kelola penghuni (aktif/nonaktif/hapus)
4. Kelola kamar & tipe kamar
5. Laporan keuangan dengan export PDF
6. Tangani pengaduan & kirim notifikasi

## 🔧 Fitur Khusus
- **Responsive Design**: Mobile-first dengan Tailwind CSS
- **Real-time Statistics**: Dashboard admin dengan data live
- **Payment Tracking**: Sistem pembayaran dengan reminder
- **Notification System**: Admin bisa kirim notifikasi ke user
- **PDF Export**: Laporan keuangan dan pembayaran
- **Facility-based Complaints**: Pengaduan berdasarkan fasilitas kamar

## 📱 UI/UX Features
- Modern gradient design
- Hover effects dan smooth transitions
- Card-based layouts
- Modal dialogs
- Dropdown menus
- Responsive navigation
- Professional color schemes

## 🛡️ Keamanan
- Password hashing dengan bcryptjs
- Session-based authentication
- Role-based access control (admin/user/guest)
- Input validation
- SQL injection protection

## 📞 Support
- WhatsApp: +62 812-3456-7890
- Email: admin@kostpro.com

---

**KostPro** - Solusi manajemen kost modern dan profesional 🏠