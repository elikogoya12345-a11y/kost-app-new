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
        
        // Find user by username OR email in single query
        let users;
        try {
            [users] = await db.execute(
                'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1', 
                [email, email]
            );
        } catch (error) {
            // Fallback if username column doesn't exist
            console.log('Username column might not exist, trying email only');
            [users] = await db.execute(
                'SELECT * FROM users WHERE email = ? LIMIT 1', 
                [email]
            );
        }
        
        if (users.length === 0) {
            return res.render('auth/login', { error: 'Username/Email atau password salah' });
        }
        
        const user = users[0];
        
        // Check if user is active
        if (user.status === 'inactive') {
            return res.render('auth/login', { error: 'Akun Anda telah dinonaktifkan. Hubungi admin.' });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
            return res.render('auth/login', { error: 'Username/Email atau password salah' });
        }
        
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
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
        const { name, email, password, confirm_password } = req.body;
        
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
        
        // Cek apakah email sudah terdaftar
        const [existingEmail] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existingEmail && existingEmail.length > 0) {
            return res.render('auth/register', { 
                error: 'Email sudah terdaftar',
                formData: req.body
            });
        }
        
        // Generate username from email (before @)
        const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute(
            'INSERT INTO users (name, username, email, password) VALUES (?, ?, ?, ?)',
            [name, username, email, hashedPassword]
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
    req.session.destroy((err) => {
        if (err) {
            console.error('Session destroy error:', err);
        }
        res.redirect('/');
    });
});

module.exports = router;