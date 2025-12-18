# 🏨 Panduan Kelola Kamar Admin - Kost Professional

## ✅ Fitur CRUD Kamar Sudah Lengkap!

Sistem manajemen kamar admin sudah memiliki semua fitur yang diperlukan:

### 📋 Fitur yang Tersedia:

#### 1. **CREATE (Tambah Kamar)**
- ✅ Tombol "Tambah Kamar Baru" dengan modal form
- ✅ Input: Nomor kamar, Tipe kamar, Lantai, Status, Deskripsi
- ✅ Validasi otomatis
- ✅ Notifikasi sukses/error

#### 2. **READ (Lihat Kamar)**
- ✅ Tabel daftar kamar lengkap dengan informasi:
  - Nomor kamar
  - Tipe kamar
  - Harga per bulan
  - Lantai
  - Status (Tersedia/Terisi/Maintenance)
- ✅ Statistik kamar (Total, Tersedia, Terisi, Maintenance)
- ✅ Filter dan sorting otomatis

#### 3. **UPDATE (Edit Kamar)**
- ✅ Tombol "Edit" pada setiap kamar
- ✅ Modal form pre-filled dengan data kamar
- ✅ Update semua field kamar
- ✅ Validasi dan notifikasi

#### 4. **DELETE (Hapus Kamar)**
- ✅ Tombol "Hapus" pada setiap kamar
- ✅ Konfirmasi sebelum hapus
- ✅ Hapus permanen dari database

#### 5. **BONUS Features**
- ✅ Reset semua kamar ke status "Tersedia"
- ✅ Statistik real-time
- ✅ UI Glossy Blue Theme yang modern
- ✅ Responsive design

---

## 🚀 Cara Setup Database dengan 35 Kamar

### Langkah 1: Pastikan MySQL Berjalan
```bash
# Jalankan XAMPP/WAMP/MAMP
# Atau start MySQL service
```

### Langkah 2: Setup Database
```bash
npm run setup-db
```

Script ini akan:
1. ✅ Membuat database `kost_professional`
2. ✅ Membuat semua tabel yang diperlukan
3. ✅ Menambahkan 7 tipe kamar
4. ✅ Menambahkan 35 kamar (5 kamar per tipe)

### Langkah 3: Jalankan Aplikasi
```bash
npm start
```

### Langkah 4: Login sebagai Admin
- URL: `http://localhost:3000`
- Email: `admin@kostapp.com`
- Password: `admin123`

---

## 📊 Data Kamar yang Akan Ditambahkan

### 35 Kamar Total (5 per tipe):

1. **Standard Room** (Rp 1.000.000/bulan)
   - STD-001, STD-002, STD-003, STD-004, STD-005
   - Lantai 1

2. **Superior Room** (Rp 1.200.000/bulan)
   - SUP-001, SUP-002, SUP-003, SUP-004, SUP-005
   - Lantai 2

3. **Deluxe Room** (Rp 1.500.000/bulan)
   - DLX-001, DLX-002, DLX-003, DLX-004, DLX-005
   - Lantai 3

4. **Suite Room** (Rp 1.800.000/bulan)
   - STE-001, STE-002, STE-003, STE-004, STE-005
   - Lantai 4

5. **Share Room** (Rp 800.000/bulan)
   - SHR-001, SHR-002, SHR-003, SHR-004, SHR-005
   - Lantai 1

6. **Large Room** (Rp 2.000.000/bulan)
   - LRG-001, LRG-002, LRG-003, LRG-004, LRG-005
   - Lantai 5

7. **President Room** (Rp 2.500.000/bulan)
   - PRE-001, PRE-002, PRE-003, PRE-004, PRE-005
   - Lantai 6

---

## 🎯 Cara Menggunakan Fitur Kelola Kamar

### Menambah Kamar Baru:
1. Klik tombol **"Tambah Kamar Baru"**
2. Isi form:
   - Nomor Kamar (contoh: STD-006)
   - Pilih Tipe Kamar
   - Nomor Lantai
   - Status (Tersedia/Terisi/Maintenance)
   - Deskripsi (opsional)
3. Klik **"Simpan"**

### Mengedit Kamar:
1. Klik tombol **"Edit"** pada kamar yang ingin diubah
2. Ubah data yang diperlukan
3. Klik **"Simpan"**

### Menghapus Kamar:
1. Klik tombol **"Hapus"** pada kamar yang ingin dihapus
2. Konfirmasi penghapusan
3. Kamar akan dihapus permanen

### Reset Semua Kamar:
1. Klik tombol **"Reset Semua Kamar ke Tersedia"**
2. Konfirmasi reset
3. Semua kamar akan berubah status menjadi "Tersedia"
4. Semua occupant menjadi inactive
5. Semua booking menjadi pending

---

## 🔧 Troubleshooting

### Masalah: MySQL tidak bisa connect
**Solusi:**
```bash
# Pastikan MySQL service berjalan
# Di XAMPP: Start Apache dan MySQL
# Di Windows Services: Start MySQL service
```

### Masalah: Database sudah ada
**Solusi:**
```bash
# Script akan otomatis update data yang sudah ada
# Atau hapus database manual dan jalankan ulang:
# DROP DATABASE kost_professional;
# npm run setup-db
```

### Masalah: Kamar tidak muncul
**Solusi:**
1. Refresh halaman (F5)
2. Cek console browser untuk error
3. Cek database: `SELECT * FROM rooms;`

---

## 📁 File-file Penting

```
kost-app-new/
├── routes/admin.js              # Route handler untuk admin
├── views/admin/rooms.ejs        # Tampilan kelola kamar
├── database/
│   ├── schema.sql              # Schema database
│   └── reset-and-seed.sql      # Data 35 kamar
├── setup-database.js           # Script setup database
└── ADMIN-ROOM-GUIDE.md         # Panduan ini
```

---

## 🎨 Fitur UI/UX

- ✅ **Glossy Blue Theme** - Tema admin yang profesional
- ✅ **Responsive Design** - Bisa diakses dari mobile/tablet
- ✅ **Modal Forms** - Form yang smooth dan modern
- ✅ **Real-time Stats** - Statistik kamar yang update otomatis
- ✅ **Icon-based Actions** - Tombol dengan icon yang jelas
- ✅ **Hover Effects** - Animasi smooth saat hover
- ✅ **Confirmation Dialogs** - Konfirmasi sebelum aksi penting

---

## 📞 Support

Jika ada masalah atau pertanyaan:
1. Cek file README.md untuk informasi umum
2. Cek console browser untuk error
3. Cek log MySQL untuk error database

---

**Kost Professional** - Sistem manajemen kost yang lengkap dan modern! 🏆
