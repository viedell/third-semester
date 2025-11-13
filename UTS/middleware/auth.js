function requireAuth(req, res, next) {
  if (!req.session.user) {
    if (req.headers['content-type'] === 'application/json') {
      return res.status(401).json({ error: 'Please login to continue' });
    }
    return res.redirect('/auth/login?redirect=' + encodeURIComponent(req.originalUrl));
  }
  next();
}

function requireGuest(req, res, next) {
  if (req.session.user) {
    return res.redirect('/profile');
  }
  next();
}

module.exports = {
  requireAuth,
  requireGuest
};