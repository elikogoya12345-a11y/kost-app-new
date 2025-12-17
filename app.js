const express = require('express');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use('/images', express.static(path.join(__dirname, 'images')));

// Handle favicon
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// CSP Headers
app.use((req, res, next) => {
    res.setHeader('Content-Security-Policy', "default-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdnjs.cloudflare.com; img-src 'self' data:; font-src 'self' https://cdnjs.cloudflare.com;");
    next();
});
app.use(session({
    secret: process.env.SESSION_SECRET || 'kost-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.use('/', require('./routes/home'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/user', require('./routes/user'));
app.use('/guest', require('./routes/guest'));
app.use('/upload', require('./routes/upload'));

// Error handlers
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error/404', { error: 'Internal Server Error' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error/404');
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});