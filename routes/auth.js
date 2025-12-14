const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../models/db');
const { redirectIfAuth } = require('../middleware/auth');

router.get('/login', redirectIfAuth, (req, res) => {
    const success = req.query.success;
    res.render('auth/login', { success });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        let user;
        
        // Try to find user by username first, then by email
        const [usersByUsername] = await db.execute('SELECT * FROM users WHERE username = ?', [email]);
        if (usersByUsername.length > 0) {
            user = usersByUsername[0];
        } else {
            // If not found by username, try by email
            const [usersByEmail] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
            if (usersByEmail.length > 0) {
                user = usersByEmail[0];
            }
        }
        
        if (!user) {
            return res.render('auth/login', { error: 'Username/Email atau password salah' });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
            return res.render('auth/login', { error: 'Username/Email atau password salah' });
        }
        
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            username: user.username,
            role: user.role
        };
        
        const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
        res.redirect(redirectPath);
    } catch (error) {
        console.error(error);
        res.render('auth/login', { error: 'Terjadi kesalahan sistem' });
    }
});

router.get('/register', redirectIfAuth, (req, res) => {
    res.render('auth/register');
});

router.post('/register', async (req, res) => {
    try {
        const { name, username, email, password, confirm_password, phone, birth_date, address } = req.body;
        
        // Validasi password match
        if (password !== confirm_password) {
            return res.render('auth/register', { 
                error: 'Password dan konfirmasi password tidak cocok',
                formData: req.body
            });
        }
        
        // Validasi panjang password
        if (password.length < 6) {
            return res.render('auth/register', { 
                error: 'Password minimal 6 karakter',
                formData: req.body
            });
        }
        
        // Validasi username (tidak boleh ada spasi)
        if (username.includes(' ')) {
            return res.render('auth/register', { 
                error: 'Username tidak boleh mengandung spasi',
                formData: req.body
            });
        }
        
        // Cek apakah email sudah terdaftar
        const [existingEmail] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail.length > 0) {
            return res.render('auth/register', { 
                error: 'Email sudah terdaftar',
                formData: req.body
            });
        }
        
        // Cek apakah username sudah terdaftar
        const [existingUsername] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsername.length > 0) {
            return res.render('auth/register', { 
                error: 'Username sudah terdaftar',
                formData: req.body
            });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO users (name, username, email, password, phone, birth_date, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, username, email, hashedPassword, phone, birth_date, address]
        );
        
        res.redirect('/auth/login?success=Registrasi berhasil! Silakan login dengan username atau email dan password Anda.');
    } catch (error) {
        console.error(error);
        res.render('auth/register', { 
            error: 'Terjadi kesalahan sistem',
            formData: req.body
        });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;