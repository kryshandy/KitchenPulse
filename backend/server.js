const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

// 1. Initialisation d'Express
const app = express();

// 2. Création du serveur HTTP
const server = http.createServer(app);

// 3. Initialisation et configuration globale de Socket.io (C'est ici qu'on définit "io")
const io = new Server(server, {
    cors: {
        origin: "*", // Autorise toutes les connexions en développement
        methods: ["GET", "POST"]
    }
});

// Route de test HTTP
app.get('/', (req, res) => {
    res.send("Le serveur KitchenPulse est en marche ! 🚀");
});

// ==========================================
// 🎯 TON ESPACE DE TRAVAIL (GESTION DES SOCKETS)
// ==========================================

io.on('connection', (socket) => {
    console.log(`🔌 Connexion établie | ID : ${socket.id}`);

    // 1. Un utilisateur rejoint un rôle spécifique (cuisine, serveur, ou client)
    socket.on('rejoindre_role', (role) => {
        socket.join(role);
        console.log(`👤 L'utilisateur ${socket.id} a rejoint la room : [${role}]`);
    });

    // 2. ÉVÉNEMENT : Le Client passe une commande
    socket.on('nouvelle_commande', (donneesCommande) => {
        console.log("🛒 Nouvelle commande reçue au serveur ! Envoi à la cuisine...");
        
        // On envoie la commande UNIQUEMENT à la cuisine
        io.to('cuisine').emit('notification_cuisine', {
            message: "👨‍🍳 Un client a passé une commande !",
            commande: donneesCommande,
            timestamp: new Date()
        });
    });

    // 3. ÉVÉNEMENT : Le Cuisinier valide un plat (Prêt)
    socket.on('plat_pret', (donneesPlat) => {
        console.log("🍳 Un plat est prêt ! Notification des serveurs...");
        
        // On alerte UNIQUEMENT les serveurs pour qu'ils fassent le service
        io.to('serveurs').emit('notification_serveur', {
            message: "🏃‍♂️ Plat prêt à être servi !",
            plat: donneesPlat,
            timestamp: new Date()
        });
    });

    // 4. ÉVÉNEMENT : Le Client demande l'addition ou de l'aide
    socket.on('appel_serveur', (donneesTable) => {
        console.log(`🔔 Demande d'assistance à la Table ${donneesTable.numeroTable}`);
        
        // On alerte les serveurs en temps réel
        io.to('serveurs').emit('alerte_table', {
            table: donneesTable.numeroTable,
            type: donneesTable.typeAppel // "addition" ou "besoin d'aide"
        });
    });

    // Déconnexion
    socket.on('disconnect', () => {
        console.log(`❌ Déconnexion | ID : ${socket.id}`);
    });
});

// ==========================================

// 5. Lancement du serveur sur le port 5000
const PORT = 5000;
server.listen(PORT, () => {
    console.log(`⚡ Serveur KitchenPulse démarré sur : http://localhost:${PORT}`);
});