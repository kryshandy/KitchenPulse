const jwt = require('jsonwebtoken');

// Mapping rôle -> rooms automatiques
const ROLE_ROOMS = {
  cuisinier: ['cuisine'],
  serveur:   ['salle'],
  admin:     ['cuisine', 'salle'],
  client:    [],
};

exports.initSocket = (io) => {

  // -- Middleware de handshake — vérifie le JWT avant toute connexion --
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('AUTH_MISSING: token absent'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'kitchenpulse_secret');
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('AUTH_INVALID: token invalide ou expire'));
    }
  });

  // -- Connexion acceptée --
  io.on('connection', (socket) => {
    const { id: userId, role, first_name } = socket.user;

    console.log('[Socket] Connecte :', first_name, '|', role, '| id:', socket.id);

    // Assigner automatiquement les rooms selon le rôle
    const rooms = ROLE_ROOMS[role?.toLowerCase()] ?? [];
    rooms.forEach(room => {
      socket.join(room);
      console.log('[Socket] Room rejointe :', room, '|', first_name);
    });

    // Confirmer la connexion au client
    socket.emit('connected', { userId, role, rooms });

    // -- Client : suivre une commande spécifique --
    // Les changements de statut passent uniquement par REST (PATCH /api/orders/:id/status)
    // qui se charge lui-même d'émettre sur les bonnes rooms — pas de doublon ici
    socket.on('track_order', ({ orderId }) => {
      if (!orderId) return;
      socket.join(`order:${orderId}`);
      console.log('[Socket] Suivi commande :', orderId, '|', first_name);
    });

    // -- Déconnexion --
    socket.on('disconnect', (reason) => {
      console.log('[Socket] Deconnecte :', first_name, '|', role, '| raison :', reason);
    });
  });
};