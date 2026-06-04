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
};

module.exports = verifyToken;