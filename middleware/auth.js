const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        req.session.redirectUrl = req.originalUrl;
        return res.redirect('/auth/login');
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.user) {
        req.session.redirectUrl = req.originalUrl;
        return res.redirect('/auth/login');
    }
    if (req.session.user.role !== 'admin') {
        return res.status(403).render('error/403');
    }
    next();
};

const requireUser = (req, res, next) => {
    if (!req.session.user) {
        req.session.redirectUrl = req.originalUrl;
        return res.redirect('/auth/login');
    }
    if (req.session.user.role !== 'user') {
        return res.status(403).render('error/403');
    }
    next();
};

const redirectIfAuth = (req, res, next) => {
    if (req.session.user) {
        const redirectPath = req.session.user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
        return res.redirect(redirectPath);
    }
    next();
};

module.exports = { requireAuth, requireAdmin, requireUser, redirectIfAuth };