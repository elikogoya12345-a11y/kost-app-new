# 🚀 Panduan Setup Aplikasi Kost Professional

## Langkah-langkah Setup:

### 1. Persiapan Database MySQL
Pastikan MySQL sudah terinstall dan berjalan di komputer Anda.

### 2. Buat Database Manual (Jika setup otomatis gagal)
Buka MySQL Command Line atau phpMyAdmin, lalu jalankan file:
```sql
-- Jalankan file: database/complete-database.sql
```

Atau copy-paste isi file `database/complete-database.sql` ke MySQL.

### 3. Konfigurasi Environment
Pastikan file `.env` sudah sesuai dengan konfigurasi MySQL Anda:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=kost_professional
PORT=3000
```

### 4. Install Dependencies
```bash
npm install
```

### 5. Jalankan Aplikasi
```bash
npm start
```

### 6. Akses Aplikasi
Buka browser: `http://localhost:3000`

## 🔑 Login Credentials

### Admin:
- Email: `admin@kostapp.com`
- Password: `admin123`

### Sample Users:
- Email: `john@example.com` atau Username: `johndoe`
- Email: `jane@example.com` atau Username: `janesmith`
- Password: `user123`

## ✨ Fitur yang Sudah Diperbaiki:

### ✅ Admin Features:
- ✅ Dashboard dengan statistik lengkap
- ✅ Kelola penghuni dengan tombol aktivasi/nonaktivasi user
- ✅ Reset semua kamar ke status "tersedia" untuk booking
- ✅ Manajemen pembayaran
- ✅ Laporan keuangan
- ✅ Sistem pengaduan

### ✅ User Features:
- ✅ Booking kamar otomatis (langsung confirmed)
- ✅ Setelah booking, user berpindah ke menu booking
- ✅ Tombol "Aktifkan Pembayaran" untuk membuat riwayat pembayaran
- ✅ Lihat riwayat pembayaran lengkap
- ✅ Pengajuan perpanjangan pembayaran
- ✅ Sistem pengaduan

### ✅ Database:
- ✅ Semua tabel sudah diperbaiki
- ✅ Semua kamar tersedia untuk booking
- ✅ Data sample lengkap
- ✅ Gambar kamar sudah tersedia

## 🎯 Alur Penggunaan User:

1. **Register/Login** → User masuk ke sistem
2. **Lihat Kamar** → Browse kamar yang tersedia
3. **Booking Kamar** → Pilih kamar dan booking (otomatis confirmed)
4. **Pindah ke Menu Booking** → Lihat booking yang sudah dibuat
5. **Aktifkan Pembayaran** → Klik tombol untuk membuat riwayat pembayaran
6. **Lihat Riwayat Pembayaran** → Monitor pembayaran bulanan
7. **Bayar** → Konfirmasi pembayaran yang jatuh tempo

## 🔧 Troubleshooting:

### Jika database error:
1. Pastikan MySQL berjalan
2. Periksa konfigurasi `.env`
3. Import manual file `database/complete-database.sql`

### Jika gambar tidak muncul:
Gambar sudah tersedia di folder `images/` dengan struktur yang benar.

### Jika ada error lain:
1. Restart aplikasi: `npm start`
2. Clear browser cache
3. Periksa console untuk error

## 📱 Responsive Design:
Aplikasi sudah responsive dan bisa diakses dari desktop, tablet, dan mobile.

---

**Aplikasi sudah siap digunakan dengan semua fitur yang diminta!** 🎉