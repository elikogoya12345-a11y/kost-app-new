# Kost Professional - Sistem Manajemen Kost

Aplikasi web untuk manajemen kost dengan fitur lengkap untuk admin dan penghuni.

## 🚀 Fitur Utama

### Admin Features:
- Dashboard dengan statistik lengkap
- Manajemen kamar dan tipe kamar
- Kelola penghuni (aktivasi/nonaktivasi user)
- Manajemen pembayaran
- Laporan keuangan dengan export PDF
- Sistem pengaduan dan notifikasi
- Reset semua kamar ke status tersedia

### User Features:
- Dashboard penghuni dengan informasi pembayaran
- Booking kamar otomatis
- Riwayat pembayaran dan aktivasi pembayaran
- Sistem pengaduan fasilitas
- Pengajuan perpanjangan pembayaran
- Print bukti booking

## 🛠️ Instalasi

1. **Clone atau download project**
   ```bash
   cd kost-app-new
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   - Copy file `.env` dan sesuaikan konfigurasi database MySQL Anda
   - Default configuration:
     ```
     DB_HOST=localhost
     DB_USER=root
     DB_PASSWORD=
     DB_NAME=kost_professional
     PORT=3000
     ```

4. **Setup database**
   ```bash
   npm run setup-db
   ```

5. **Jalankan aplikasi**
   ```bash
   npm start
   ```

6. **Akses aplikasi**
   - Buka browser: `http://localhost:3000`

## 👤 Login Credentials

### Admin:
- Email: `admin@kostapp.com`
- Password: `admin123`

### Sample Users:
- Email: `john@example.com` / Username: `johndoe`
- Email: `jane@example.com` / Username: `janesmith`
- Password untuk semua user: `user123`

## 📁 Struktur Project

```
kost-app-new/
├── database/           # Database schema dan seed
├── images/            # Gambar kamar
├── middleware/        # Authentication middleware
├── models/           # Database connection
├── routes/           # Route handlers
├── views/            # EJS templates
├── public/           # Static files
├── app.js            # Main application
└── setup-database.js # Database setup script
```

## 🎯 Cara Penggunaan

### Untuk Admin:
1. Login dengan akun admin
2. Gunakan menu "Reset Semua Kamar" untuk membuat semua kamar tersedia
3. Kelola penghuni dengan aktivasi/nonaktivasi user
4. Monitor pembayaran dan keuangan
5. Tangani pengaduan penghuni

### Untuk User:
1. Register akun baru atau login dengan akun existing
2. Browse kamar yang tersedia
3. Lakukan booking kamar (otomatis terkonfirmasi)
4. Aktifkan pembayaran setelah booking
5. Lihat riwayat pembayaran dan lakukan pembayaran
6. Ajukan pengaduan jika diperlukan

## 🔧 Fitur Teknis

- **Framework**: Express.js + EJS
- **Database**: MySQL
- **Authentication**: Session-based
- **UI**: Tailwind CSS dengan glassmorphism design
- **PDF Export**: Puppeteer untuk laporan keuangan
- **Password Hashing**: bcryptjs

## 📱 Responsive Design

Aplikasi fully responsive dan dapat diakses dari:
- Desktop
- Tablet
- Mobile

## 🎨 Theme

- **Admin**: Blue glossy theme dengan aksen professional
- **User**: Gold glossy theme dengan aksen warm dan welcoming

## 🔒 Security Features

- Password hashing dengan bcrypt
- Session management
- Role-based access control
- Input validation
- SQL injection protection

## 📞 Support

Jika ada pertanyaan atau masalah, silakan hubungi developer.

---

**Kost Professional** - Solusi manajemen kost modern dan profesional.

## 🚀 Deployment ke Railway

### Prerequisites:
- Akun Railway
- Database Aiven MySQL (atau Railway MySQL)
- Repository GitHub

### Langkah Deployment:

1. **Push ke GitHub**
   ```bash
   git add .
   git commit -m "Ready for Railway deployment"
   git push origin main
   ```

2. **Setup Railway Project**
   - Login ke [Railway](https://railway.app)
   - Create new project dari GitHub repository
   - Connect repository ini

3. **Set Environment Variables di Railway**
   Buka Railway dashboard → Variables tab, set:
   ```
   NODE_ENV=production
   SESSION_SECRET=your-secret-key-here
   DB_HOST=your-aiven-host
   DB_PORT=15388
   DB_USER=avnadmin
   DB_PASSWORD=your-aiven-password
   DB_NAME=defaultdb
   AIVEN_PASSWORD=your-aiven-password
   ```

4. **Setup Database Schema**
   Setelah deploy berhasil, jalankan:
   ```bash
   railway run npm run setup-aiven
   ```

5. **Akses Aplikasi**
   Railway akan memberikan URL public untuk aplikasi Anda.

### Database Configuration:
Aplikasi ini sudah dikonfigurasi untuk menggunakan:
- **Development**: MySQL localhost
- **Production**: Aiven MySQL dengan SSL

### Troubleshooting:
- Cek Railway logs jika deployment gagal
- Pastikan semua environment variables sudah diset
- Pastikan database Aiven dapat diakses dari Railway