const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers['authorization'];
  if (!header) return res.status(401).json({ message: 'Token manquant' });

  const token = header.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Format invalide (Bearer <token>)' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'kitchenpulse_secret');
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};