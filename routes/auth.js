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
        const { email, password } = req.body;
        
        console.log('Login attempt:', { email, passwordLength: password?.length });
        
        // Find user by username OR email in single query
        let users;
        try {
            [users] = await db.execute(
                'SELECT * FROM users WHERE username = ? OR email = ? LIMIT 1', 
                [email, email]
            );
            console.log('Users found:', users.length);
        } catch (error) {
            // Fallback if username column doesn't exist
            console.log('Username column might not exist, trying email only:', error.message);
            [users] = await db.execute(
                'SELECT * FROM users WHERE email = ? LIMIT 1', 
                [email]
            );
            console.log('Users found (email only):', users.length);
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
            role: user.role,
            username: user.username
        };
        
        // Check if there's a redirect URL in session
        const redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;
        
        if (redirectUrl) {
            return res.redirect(redirectUrl);
        }
        
        const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
        res.redirect(redirectPath);
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Terjadi kesalahan sistem';
        
        if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Database tidak dapat diakses';
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            errorMessage = 'Tabel users tidak ditemukan';
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
        console.error('Register error:', error);
        let errorMessage = 'Terjadi kesalahan sistem';
        
        if (error.code === 'ECONNREFUSED') {
            errorMessage = 'Database tidak dapat diakses';
        } else if (error.code === 'ER_NO_SUCH_TABLE') {
            errorMessage = 'Tabel users tidak ditemukan';
        } else if (error.code === 'ER_DUP_ENTRY') {
            errorMessage = 'Email sudah terdaftar';
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