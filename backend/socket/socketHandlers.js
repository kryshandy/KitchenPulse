exports.initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Socket connecté:', socket.id);

    // Rejoindre une room selon le rôle
    socket.on('join_room', ({ room }) => {
      socket.join(room);
      console.log(`Socket ${socket.id} → room "${room}"`);
    });

    // Rejoindre le suivi d'une commande spécifique
    socket.on('track_order', ({ orderId }) => {
      socket.join(`order:${orderId}`);
    });

    // Cuisinier met à jour un statut
    socket.on('update_order_status', ({ orderId, status }) => {
      io.to(`order:${orderId}`).emit('order_status_update', { orderId, status });
      io.to('salle').emit('order_status_update', { orderId, status });
      if (status === 'PRETE') {
        io.to('salle').emit('order_ready', { orderId });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket déconnecté:', socket.id);
    });
  });
};