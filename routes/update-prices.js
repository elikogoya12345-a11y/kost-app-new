const express = require('express');
const router = express.Router();
const db = require('../models/db');

// Route untuk update harga
router.get('/update-prices', async (req, res) => {
    try {
        await db.execute("UPDATE room_types SET base_price = 800000 WHERE name = 'Share Room'");
        await db.execute("UPDATE room_types SET base_price = 1000000 WHERE name = 'Standard Room'");
        await db.execute("UPDATE room_types SET base_price = 1200000 WHERE name = 'Superior Room'");
        await db.execute("UPDATE room_types SET base_price = 1300000 WHERE name = 'Twin Room'");
        await db.execute("UPDATE room_types SET base_price = 1500000 WHERE name = 'Deluxe Room'");
        await db.execute("UPDATE room_types SET base_price = 1800000 WHERE name = 'Suite Room'");
        await db.execute("UPDATE room_types SET base_price = 2000000 WHERE name = 'Large Room'");
        await db.execute("UPDATE room_types SET base_price = 2500000 WHERE name = 'President Room'");

        const [rows] = await db.execute('SELECT name, base_price FROM room_types ORDER BY base_price');
        
        let result = '<h2>Harga berhasil diupdate!</h2><ul>';
        rows.forEach(row => {
            result += `<li>${row.name}: Rp ${row.base_price.toLocaleString('id-ID')}</li>`;
        });
        result += '</ul><a href="/">Kembali ke Home</a>';
        
        res.send(result);
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

module.exports = router;