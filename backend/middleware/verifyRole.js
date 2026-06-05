<<<<<<< HEAD
// Middleware temporaire pour simuler la vérification des rôles
const verifyRole = (roleAutorise) => {
  return (req, res, next) => {
    console.log(`🔹 [Middleware Mock] Vérification du rôle requis : ${roleAutorise}`);
    
    // Si l'utilisateur simulé a le bon rôle, on passe
    if (req.user && req.user.role === roleAutorise) {
      next();
    } else {
      res.status(403).json({ success: false, message: "Accès refusé : rôle insuffisant." });
    }
=======
const verifyRole = (...rolesAutorises) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Non authentifié.' });
    }

    if (!rolesAutorises.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé : rôle insuffisant.' });
    }

    next();
>>>>>>> origin/feature/cuisinier
  };
};

module.exports = verifyRole;