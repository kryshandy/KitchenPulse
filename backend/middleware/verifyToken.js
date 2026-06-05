<<<<<<< HEAD
// Middleware temporaire pour simuler la validation d'un token JWT
const verifyToken = (req, res, next) => {
  console.log("🔹 [Middleware Mock] Validation du Token...");
  
  // On simule un utilisateur ADMIN connecté pour tes tests
  req.user = {
    id: 1,
    email: 'admin@kitchenpulse.com',
    role: 'ADMIN'
  };
  
  next(); // On laisse passer la requête
=======
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token manquant ou invalide.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Token expiré ou invalide.' });
  }
>>>>>>> origin/feature/cuisinier
};

module.exports = verifyToken;