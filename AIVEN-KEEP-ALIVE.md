# Cara Menjaga Aiven MySQL Selalu Aktif

## Masalah:
Aiven free trial akan auto-shutdown jika tidak ada aktivitas untuk menghemat resources.

## Solusi:

### 1. **Upgrade ke Paid Plan (Recommended)**
- Masuk Aiven Dashboard
- Pilih service MySQL Anda
- Klik "Upgrade" atau "Change Plan"
- Pilih plan berbayar (mulai dari $10/bulan)
- Paid plan tidak akan auto-shutdown

### 2. **Keep-Alive Script (Temporary)**
Tambahkan di `app.js`:

```javascript
// Keep Aiven alive
if (process.env.AIVEN_PASSWORD) {
    require('./keep-aiven-alive');
}
```

Set environment variable di Railway:
- `AIVEN_PASSWORD` = password Aiven Anda

### 3. **Cron Job External**
Gunakan service seperti:
- **UptimeRobot** (gratis): https://uptimerobot.com
  - Monitor URL: https://kost-app-new-production.up.railway.app/auth/debug
  - Interval: 5 menit
  - Akan ping aplikasi yang otomatis ping database

- **Cron-job.org** (gratis): https://cron-job.org
  - Setup cron untuk hit endpoint setiap 5 menit

### 4. **Railway MySQL (Alternatif Terbaik)**
- Gratis
- Tidak pernah shutdown
- Terintegrasi langsung
- Setup 1 klik di Railway dashboard

## Rekomendasi:
**Gunakan Railway MySQL** untuk development/production gratis yang stabil.

Aiven bagus untuk production berbayar, tapi untuk gratis lebih baik Railway MySQL.

## Setup Railway MySQL:
1. Railway Dashboard → "New" → "Database" → "Add MySQL"
2. Variables otomatis ter-generate
3. Akses: https://kost-app-new-production.up.railway.app/admin/seed-database
4. Done!

## Perbandingan:

| Feature | Aiven Free | Railway MySQL |
|---------|-----------|---------------|
| Auto-shutdown | Ya | Tidak |
| Setup | Manual env vars | Auto-generated |
| DNS Issues | Kadang ada | Tidak ada |
| Gratis | 30 hari trial | Selamanya |
| Best for | Production paid | Development/Free |