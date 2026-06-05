const verifyRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Non authentifié' });
  }

  // Comparaison insensible à la casse (ex: 'ADMIN' == 'admin')
  const userRole = req.user.role?.toLowerCase();
  const allowed  = roles.map(r => r.toLowerCase());

  if (!allowed.includes(userRole)) {
    return res.status(403).json({
      message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}`,
    });
  }

  next();
};

module.exports = verifyRole;