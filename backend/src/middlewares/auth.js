const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
  }
  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token tidak valid atau kedaluwarsa' });
  }
};

exports.requireRole = (...roles) => (req, res, next) => {
  // [BUG-04 FIX] Guard jika verifyToken tidak dipasang sebelumnya
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Token tidak ditemukan' });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }
  next();
};
