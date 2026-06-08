import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3001';

let socketInstance = null;

/**
 * useSocket — connexion Socket.io sécurisée par JWT avec reconnexion automatique
 *
 * @param {string|null} orderId — si fourni, rejoint la room order:${orderId} (client)
 * @returns {object} socket
 *
 * Usage :
 *   const socket = useSocket();            // cuisinier, serveur, admin
 *   const socket = useSocket(commande.id); // client qui suit sa commande
 */
export const useSocket = (orderId = null) => {
  const socketRef  = useRef(null);
  const orderIdRef = useRef(orderId);

  // Garder orderId à jour sans recréer l'effet
  useEffect(() => { orderIdRef.current = orderId; }, [orderId]);

  useEffect(() => {
    const token = localStorage.getItem('kp_token');
    if (!token) return;

    // Créer l'instance une seule fois avec le JWT dans le handshake
    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        transports:         ['websocket'],
        auth:               { token },
        // Socket.io tente de se reconnecter automatiquement
        reconnection:       true,
        reconnectionDelay:  1000,   // 1s avant le 1er retry
        reconnectionDelayMax: 5000, // max 5s entre les retries
        reconnectionAttempts: Infinity,
      });

      // -- Connexion initiale --
      socketInstance.on('connect', () => {
        console.log('[Socket] Connecte :', socketInstance.id);
      });

      // -- Rooms confirmées par le serveur --
      socketInstance.on('connected', ({ role, rooms }) => {
        console.log('[Socket] Rooms assignees :', role, rooms);

        // Si on suivait une commande avant la coupure, on re-rejoint la room
        if (orderIdRef.current) {
          socketInstance.emit('track_order', { orderId: orderIdRef.current });
          console.log('[Socket] Re-suivi commande apres reconnexion :', orderIdRef.current);
        }
      });

      // -- Reconnexion en cours --
      socketInstance.on('reconnect_attempt', (attempt) => {
        console.log('[Socket] Tentative de reconnexion n°', attempt);

        // Mettre à jour le token au cas où il aurait été rafraîchi entre-temps
        const freshToken = localStorage.getItem('kp_token');
        if (freshToken) socketInstance.auth = { token: freshToken };
      });

      // -- Reconnexion réussie --
      socketInstance.on('reconnect', (attempt) => {
        console.log('[Socket] Reconnecte apres', attempt, 'tentative(s)');
        // Les rooms sont réassignées automatiquement côté serveur
        // via le middleware JWT au nouveau handshake
      });

      // -- Echec définitif (si reconnectionAttempts était limité) --
      socketInstance.on('reconnect_failed', () => {
        console.error('[Socket] Reconnexion echouee — verifier le serveur');
      });

      socketInstance.on('connect_error', (err) => {
        console.error('[Socket] Erreur connexion :', err.message);
      });

      socketInstance.on('disconnect', (reason) => {
        console.log('[Socket] Deconnecte :', reason);

        // Si c'est le serveur qui a fermé la connexion,
        // Socket.io ne reconnecte pas automatiquement — on force
        if (reason === 'io server disconnect') {
          socketInstance.connect();
        }
      });
    }

    socketRef.current = socketInstance;

    // Client : rejoindre la room de suivi d'une commande
    if (orderId) {
      socketInstance.emit('track_order', { orderId });
      console.log('[Socket] Suivi commande :', orderId);
    }

    return () => {
      // Le singleton reste actif toute la session
      // Déconnexion uniquement au logout via disconnectSocket()
    };
  }, [orderId]);

  return socketRef.current;
};

/**
 * Déconnecter proprement le socket — à appeler au logout
 */
export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
    console.log('[Socket] Deconnecte (logout)');
  }
};

/** Accès direct à l'instance sans hook */
export const getSocket = () => socketInstance;