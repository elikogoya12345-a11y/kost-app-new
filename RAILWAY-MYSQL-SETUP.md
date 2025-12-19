# Setup Railway MySQL Database

## Langkah Setup:

1. **Buka Railway Dashboard**
   - Masuk ke project kost-app-new

2. **Tambah MySQL Database**
   - Klik "New" → "Database" → "Add MySQL"
   - Railway akan otomatis generate environment variables

3. **Variables yang akan dibuat otomatis:**
   - `MYSQLHOST` = hostname database
   - `MYSQLUSER` = username
   - `MYSQLPASSWORD` = password  
   - `MYSQLDATABASE` = nama database
   - `MYSQLPORT` = port (3306)

4. **Setup Database Schema**
   - Setelah database aktif, akses:
   - https://kost-app-new-production.up.railway.app/admin/seed-database

5. **Test Connection**
   - https://kost-app-new-production.up.railway.app/auth/debug

## Kenapa Railway MySQL?
- ✅ Gratis untuk development
- ✅ Auto-generated environment variables
- ✅ Tidak ada DNS issues seperti Aiven
- ✅ Langsung terintegrasi dengan Railway

## Setelah Setup:
- Login/Register akan berfungsi normal
- Database akan terisi dengan 35 kamar otomatis
- Admin default: admin@kostapp.com / admin123