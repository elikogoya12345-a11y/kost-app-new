const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../models/db');
const { redirectIfAuth } = require('../middleware/auth');

// Public debug route - no auth required
router.get('/debug', async (req, res) => {
    try {
        console.log('Testing database connection...');
        const [result] = await db.execute('SELECT 1 as test');
        console.log('Basic test passed');
        
        const [tables] = await db.execute('SHOW TABLES');
        console.log('Tables query passed');
        
        let userCount = 0;
        try {
            const [users] = await db.execute('SELECT COUNT(*) as count FROM users');
            userCount = users[0].count;
        } catch (userError) {
            console.log('Users table error:', userError.message);
        }
        
        res.json({
            status: 'OK',
            connection: 'SUCCESS',
            config: {
                database: process.env.DB_NAME || 'not set',
                host: process.env.DB_HOST ? process.env.DB_HOST.substring(0, 20) + '...' : 'not set',
                user: process.env.DB_USER ? 'set' : 'not set',
                password: process.env.DB_PASSWORD ? 'set' : 'not set',
                port: process.env.DB_PORT || 'not set'
            },
            test: result[0].test,
            tables: tables.map(t => Object.values(t)[0]),
            userCount: userCount
        });
    } catch (error) {
        console.error('Database debug error:', error);
        res.json({ 
            status: 'ERROR',
            connection: 'FAILED',
            config: {
                database: process.env.DB_NAME || 'not set',
                host: process.env.DB_HOST ? process.env.DB_HOST.substring(0, 20) + '...' : 'not set',
                user: process.env.DB_USER ? 'set' : 'not set',
                password: process.env.DB_PASSWORD ? 'set' : 'not set',
                port: process.env.DB_PORT || 'not set'
            },
            error: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            fullHost: process.env.DB_HOST || 'not set'
        });
    }
});

router.get('/login', redirectIfAuth, (req, res) => {
    const success = req.query.success;
    res.render('auth/login', { success });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body; // 'email' field bisa berisi username atau email
        
        console.log('Login attempt:', { loginInput: email, passwordLength: password?.length });
        
        if (!email || !password) {
            return res.render('auth/login', { error: 'Username/Email dan password harus diisi' });
        }
        
        // Cari user berdasarkan username ATAU email
        let users = [];
        
        try {
            // Query untuk mencari user berdasarkan username atau email
            [users] = await db.execute(
                'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1', 
                [email.trim(), email.trim()]
            );
            console.log('Users found with username/email query:', users.length);
        } catch (error) {
            console.log('Username column might not exist, trying email only:', error.message);
            // Fallback jika kolom username tidak ada
            try {
                [users] = await db.execute(
                    'SELECT * FROM users WHERE email = ? LIMIT 1', 
                    [email.trim()]
                );
                console.log('Users found with email only query:', users.length);
            } catch (fallbackError) {
                console.error('Both queries failed:', fallbackError);
                return res.render('auth/login', { error: 'Terjadi kesalahan sistem. Silakan coba lagi.' });
            }
        }
        
        if (users.length === 0) {
            return res.render('auth/login', { 
                error: 'Username/Email atau password salah. Pastikan Anda sudah terdaftar.' 
            });
        }
        
        const user = users[0];
        console.log('Found user:', { id: user.id, name: user.name, email: user.email, username: user.username });
        
        // Cek status user
        if (user.status === 'inactive') {
            return res.render('auth/login', { error: 'Akun Anda telah dinonaktifkan. Hubungi admin.' });
        }
        
        // Verifikasi password
        const isValid = await bcrypt.compare(password, user.password);
        console.log('Password validation result:', isValid);
        
        if (!isValid) {
            return res.render('auth/login', { error: 'Username/Email atau password salah' });
        }
        
        // Simpan data user ke session
        req.session.user = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            username: user.username || user.email.split('@')[0] // fallback username dari email
        };
        
        console.log('Login successful for user:', req.session.user);
        
        // Cek redirect URL
        const redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;
        
        if (redirectUrl) {
            return res.redirect(redirectUrl);
        }
        
        // Redirect berdasarkan role
        const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
        console.log('Redirecting to:', redirectPath);
        res.redirect(redirectPath);
        
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Terjadi kesalahan sistem';
        
        if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Database tidak dapat diakses';
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            errorMessage = 'Tabel users tidak ditemukan. Silakan hubungi admin.';
        } else if (error.code === 'ER_BAD_DB_ERROR') {
            errorMessage = 'Database tidak ditemukan. Silakan hubungi admin.';
        } else if (error.sqlMessage) {
            errorMessage = 'Database error: ' + error.sqlMessage;
        }
        
        res.render('auth/login', { error: errorMessage });
    }
});

router.get('/register', redirectIfAuth, (req, res) => {
    res.render('auth/register');
});

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, confirm_password } = req.body;
        
        // Validasi input
        if (!name || !email || !password || !confirm_password) {
            return res.render('auth/register', { 
                error: 'Semua field harus diisi',
                formData: req.body
            });
        }
        
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
        
        // Validasi format email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.render('auth/register', { 
                error: 'Format email tidak valid',
                formData: req.body
            });
        }
        
        // Cek apakah email sudah terdaftar
        const [existingEmail] = await db.execute('SELECT id FROM users WHERE email = ?', [email.trim()]);
        if (existingEmail && existingEmail.length > 0) {
            return res.render('auth/register', { 
                error: 'Email sudah terdaftar. Silakan gunakan email lain atau login.',
                formData: req.body
            });
        }
        
        // Generate username dari email (bagian sebelum @)
        let username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        
        // Pastikan username unik
        const [existingUsername] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
        if (existingUsername && existingUsername.length > 0) {
            // Jika username sudah ada, tambahkan angka random
            username = username + Math.floor(Math.random() * 1000);
        }
        
        console.log('Creating user:', { name, email, username });
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user baru
        await db.execute(
            'INSERT INTO users (name, username, email, password, role, status) VALUES (?, ?, ?, ?, ?, ?)',
            [name.trim(), username, email.trim(), hashedPassword, 'user', 'active']
        );
        
        console.log('User created successfully');
        
        res.redirect('/auth/login?success=Registrasi berhasil! Silakan login dengan username "' + username + '" atau email "' + email + '"');
    } catch (error) {
        console.error('Register error:', error);
        let errorMessage = 'Terjadi kesalahan sistem';
        
        if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Database tidak dapat diakses';
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            errorMessage = 'Tabel users tidak ditemukan. Silakan hubungi admin.';
        } else if (error.code === 'ER_DUP_ENTRY') {
            if (error.sqlMessage.includes('email')) {
                errorMessage = 'Email sudah terdaftar';
            } else if (error.sqlMessage.includes('username')) {
                errorMessage = 'Username sudah digunakan';
            } else {
                errorMessage = 'Data sudah terdaftar';
            }
        } else if (error.sqlMessage) {
            errorMessage = 'Database error: ' + error.sqlMessage;
        }
        
        res.render('auth/register', { 
            error: errorMessage,
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