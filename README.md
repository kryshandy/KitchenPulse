================================================================================
KITCHENPULSE - RESTAURANT MANAGEMENT SYSTEM
Documentation Officielle v4.0
KEYCE Informatique Yaoundé - Groupe 7
================================================================================

TABLE DES MATIERES
==================
1. Présentation du projet
2. Technologies utilisées
3. Prérequis
4. Installation et configuration
5. Lancement de l'application
6. API Endpoints
7. Fonctionnalités par rôle
8. Dépannage
9. Équipe et statut


1. PRESENTATION DU PROJET
=========================
KitchenPulse est une solution de gestion de restaurant en temps réel développée
par KEYCE Informatique - Groupe 7 (Yaoundé). L'application permet aux restaurants
de digitaliser leurs opérations, de la prise de commande à la gestion de cuisine,
en passant par le service en salle.

Objectifs :
- Digitaliser le processus de commande en restaurant
- Réduire les erreurs de transmission entre salle et cuisine
- Améliorer le temps de réponse et la satisfaction client
- Fournir des outils d'administration complets
- Offrir une expérience utilisateur moderne et intuitive


2. TECHNOLOGIES UTILISEES
=========================
BACKEND
-------
- Node.js v18+         (Runtime JavaScript)
- Express 5.2.1        (Framework web)
- MySQL 8.0+           (Base de données)
- JWT 9.0.3           (Authentification)
- Socket.io 4.8.3     (Communication temps réel)
- bcryptjs 3.0.3      (Hachage des mots de passe)

FRONTEND
--------
- React 18.3.1        (Bibliothèque UI)
- Vite 5.4.11         (Build tool)
- React Router DOM 6.28.0 (Navigation)
- Axios 1.7.9         (Requêtes HTTP)
- Tailwind CSS 3.4.17 (Styling)
- React Toastify 10.0.6 (Notifications)


3. PREREQUIS
============
Avant de commencer, assurez-vous d'avoir installé :

Logicier | Version | Commande de vérification
---------|---------|-------------------------
Node.js  | v18+    | node --version
npm      | v9+     | npm --version
MySQL    | v8+     | mysql --version
Git      | v2.30+  | git --version


4. INSTALLATION ET CONFIGURATION
================================
ETAPE 1 : Cloner le dépôt
-------------------------
git clone https://github.com/keyce-informatique/kitchenpulse.git
cd kitchenpulse

ETAPE 2 : Configurer la base de données
----------------------------------------
mysql -u root -p
CREATE DATABASE kitchenpulse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;
mysql -u root -p kitchenpulse_db < backend/database/restaurant.sql

ETAPE 3 : Configurer le backend
-------------------------------
cd backend
cp .env.example .env

Modifier le fichier .env avec vos informations :

DB_HOST=localhost
DB_PORT=3306
DB_NAME=kitchenpulse_db
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
PORT=3001
JWT_SECRET=kitchenpulse_secret_2026
SOCKET_CORS_ORIGIN=http://localhost:5173

ETAPE 4 : Configurer le frontend
--------------------------------
cd ../frontend
echo "VITE_API_URL=http://localhost:3001/api" > .env

ETAPE 5 : Installer les dépendances
-----------------------------------
# Backend (premier terminal)
cd backend
npm install

# Frontend (deuxième terminal)
cd frontend
npm install


5. LANCEMENT DE L'APPLICATION
==============================
ETAPE 1 : Démarrer le backend
-----------------------------
cd backend
npm run dev

Succès attendu :
✅ Connexion MySQL réussie !
🍴 KitchenPulse backend → http://localhost:3001

ETAPE 2 : Démarrer le frontend (nouveau terminal)
--------------------------------------------------
cd frontend
npm run dev

Succès attendu :
VITE v5.4.11 ready
➜ Local: http://localhost:5173/

ETAPE 3 : Accéder à l'application
---------------------------------
Ouvrez votre navigateur : http://localhost:5173


6. API ENDPOINTS
================
AUTHENTIFICATION PUBLIQUE
------------------------
POST   /api/auth/register     - Créer un compte
POST   /api/auth/login        - Se connecter
GET    /api/auth/allergies    - Liste des allergènes

Exemple d'inscription :
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Jean","last_name":"Dupont","email":"jean@example.com","password":"password123"}'

Exemple de connexion :
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"jean@example.com","password":"password123"}'

ROUTES PROTEGEES (nécessitent token JWT)
----------------------------------------
GET    /api/auth/me               - Profil utilisateur
GET    /api/dishes                - Lister les plats
GET    /api/dishes/:id            - Détail d'un plat
POST   /api/orders                - Créer commande (client)
GET    /api/orders/mine           - Mes commandes (client)
GET    /api/orders/cuisine        - Commandes cuisine (cuisinier)
GET    /api/orders                - Toutes commandes (serveur/admin)
PATCH  /api/orders/:id/take       - Prendre commande (cuisinier)
PATCH  /api/orders/:id/ready      - Marquer prête (cuisinier)
PATCH  /api/orders/:id/cancel     - Annuler (client/serveur/admin)
GET    /api/tables                - Liste tables
PATCH  /api/tables/:id/status     - Changer statut table (serveur/admin)
GET    /api/users                 - Liste utilisateurs (admin)

Exemple d'appel authentifié :
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"


7. FONCTIONNALITES PAR ROLE
===========================
CLIENT (🍽️)
-----------
- Consulter le menu (plats par catégorie)
- Passer une commande
- Suivre l'état de sa commande (temps réel via Socket.io)
- Voir l'historique des commandes
- Modifier son profil

CUISINIER (👨‍🍳)
--------------
- Voir les nouvelles commandes en temps réel
- Prendre en charge une commande
- Marquer une commande comme prête
- Gérer la carte (ajout/modification de plats)
- Accéder à la room Socket.io "cuisine"

SERVEUR (🛎️)
-----------
- Visualiser toutes les commandes actives
- Gérer l'état des tables (libre, occupée, réservée)
- (assign/deliver - stubs 501 à implémenter)

ADMINISTRATEUR (⚙️)
------------------
- Gestion complète des utilisateurs (CRUD)
- Dashboard d'analyse
- Gestion de la carte (validation/modification/suppression)
- Supervision des commandes
- Accès à toutes les données du système

EVENEMENTS SOCKET.IO
--------------------
join_cuisine       - Rejoindre room cuisine (client → serveur)
new_order          - Nouvelle commande (serveur → client)
order_in_progress  - Commande en préparation (serveur → client)
order_ready        - Commande prête (serveur → client)
order_cancelled    - Commande annulée (serveur → client)


8. DEPANNAGE
============
PROBLEME : Backend ne démarre pas - port déjà utilisé
------------------------------------------------------
Windows : netstat -ano | findstr :3001 puis taskkill /PID <PID> /F
Mac/Linux : lsof -i :3001 puis kill -9 <PID>

PROBLEME : Connexion MySQL échouée
----------------------------------
1. Vérifier que MySQL est démarré
   Windows : net start MySQL80
   Mac/Linux : sudo systemctl start mysql
2. Vérifier les identifiants dans .env
3. Vérifier que la base existe : SHOW DATABASES;

PROBLEME : Frontend ne se connecte pas au backend
-------------------------------------------------
1. Vérifier que le backend est démarré sur le port 3001
2. Vérifier .env du frontend : VITE_API_URL=http://localhost:3001/api
3. Vérifier les logs backend pour les erreurs CORS

PROBLEME : Erreur "Module not found"
------------------------------------
rm -rf node_modules package-lock.json
npm install

PROBLEME : Token JWT expiré
---------------------------
Déconnecter puis reconnecter l'utilisateur (tokens valides 7 jours)


9. STATUT DU PROJET
===================
FONCTIONNALITES COMPLETES (✅)
-----------------------------
- Authentification (register/login) - JWT + bcrypt
- Gestion des plats (CRUD complet)
- Création de commande avec panier
- Suivi commande client (Socket.io temps réel)
- Vue cuisine (Nouveau → Préparation → Prêt)
- Gestion des tables (CRUD + changement statut)
- Gestion utilisateurs admin (CRUD + rôles)

EN DEVELOPPEMENT / STUBS (⏳)
-----------------------------
- assignOrder / deliverOrder (feat/serveur-admin)
- Système d'avis et notes (feat/reviews)
- Dashboard statistiques (feat/stats)
- Tableaux de bord cuisinier/serveur complets

POINTS D'ATTENTION ⚠️
---------------------
- Statuts commandes en minuscules : nouveau, en_preparation, pret, livree, cloturee, annule
- Noms de tables : commandes (pas orders), plats (pas dishes)
- Socket.io : utiliser req.io.emit() (injecté via middleware)
- Rôles en minuscules dans la DB : client, cuisinier, serveur, admin

================================================================================
HISTORIQUE DES VERSIONS
================================================================================
v1.0 - Juin 2026 : Merge initial feature/client-ui ← feature/tests
v2.0 - Juin 2026 : Correctifs configuration (.env, db.js, server.js)
v3.0 - Juin 2026 : Correctifs middlewares et controllers
v4.0 - Juin 2026 : Bugfix runtime - Version stable finale

================================================================================
SUPPORT & CONTACT
================================================================================
Documentation : /docs/KitchenPulse_Complet.md
Issues : GitHub Issues du projet
Email : support@kitchenpulse.com

================================================================================
KEYCE Informatique Yaoundé - Groupe 7 - Juin 2026
🍴 Bon appétit et bon développement avec KitchenPulse !
================================================================================
