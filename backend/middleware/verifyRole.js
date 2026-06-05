const verifyRole = (...rolesAutorises) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Non authentifié.' });
    // Support majuscules et minuscules (cuisinier == CUISINIER)
    const userRole = req.user.role?.toLowerCase();
    const allowed  = rolesAutorises.map(r => r.toLowerCase());
    if (!allowed.includes(userRole)) {
      return res.status(403).json({ message: 'Accès refusé : rôle insuffisant.' });
    }
    next();
  };
};

module.exports = verifyRole;
