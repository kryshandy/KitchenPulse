const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou format invalide (Bearer <token>)' });
  }

  const token = authHeader.split(' ')[1];

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'kitchenpulse_secret');
    next();
  } catch {
    return res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

module.exports = verifyToken;