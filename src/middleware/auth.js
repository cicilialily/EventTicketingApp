export function requireAuth(req, res, next) {
  const userId = req.headers['x-user-id'] || req.headers['X-User-Id'];

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Authentication required.' });
  }

  const roleHeader = (req.headers['x-user-role'] || 'USER').toString().toUpperCase();

  req.user = {
    id: userId,
    role: roleHeader,
  };

  next();
}

export function requireOrganizerOrAdmin(req, res, next) {
  if (!req.user || !['ORGANIZER', 'ADMIN'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Organizer or Admin access required.' });
  }
  next();
}