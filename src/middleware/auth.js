function requireAuth(req, res, next) {
  const userId = req.headers['x-user-id'] || req.headers['X-User-Id'];

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  req.user = { id: userId, role: req.headers['x-user-role'] || 'USER' };
  next();
}

function requireOrganizerOrStaff(req, res, next) {
  if (!req.user || !['ORGANIZER', 'ADMIN', 'STAFF'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Organizer or staff access required.' });
  }
  next();
}

module.exports = { requireAuth, requireOrganizerOrStaff };
