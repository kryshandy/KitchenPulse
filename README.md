<div align="center">

# 🍽️ KitchenPulse
### *Le cerveau vivant de la cuisine*

**Un écosystème digital qui pense, connecte et nourrit intelligemment votre restaurant**

[![Node.js](https://img.shields.io/badge/Node.js-20_LTS-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://socket.io)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![License](https://img.shields.io/badge/Licence-Académique-blue?style=for-the-badge)](./LICENSE)

---

*Projet Tutoré — KEYCE Informatique Yaoundé, Cameroun — Groupe 7*

</div>

---

## 📋 Table des Matières

1. [Présentation du Projet](#-présentation-du-projet)
2. [Architecture Générale](#️-architecture-générale)
3. [Stack Technologique](#-stack-technologique)
4. [Prérequis](#-prérequis)
5. [Installation](#-installation)
6. [Configuration](#️-configuration)
7. [Lancement](#-lancement)
8. [Structure du Projet](#-structure-du-projet)
9. [API Endpoints](#-api-endpoints)
10. [Événements Socket.io](#-événements-socketio)
11. [Rôles & Permissions](#-rôles--permissions)
12. [Fonctionnalités](#-fonctionnalités)
13. [Branches Git](#-branches-git)
14. [Dépannage](#-dépannage)
15. [Équipe](#-équipe)

---

## 🎯 Présentation du Projet

KitchenPulse est une **solution complète de gestion de restaurant en temps réel**, développée pour digitaliser l'ensemble des opérations d'un établissement de restauration — de la prise de commande par le client jusqu'au service en salle, en passant par la préparation en cuisine et l'administration.

### Problème résolu

La restauration moderne fait face à un double défi :
- Les clients sont de plus en plus exigeants (allergies, régimes, profils de santé divers)
- La communication interne entre salle et cuisine reste artisanale (bons papier, erreurs fréquentes)

### Solution apportée

KitchenPulse propose un **écosystème interconnecté en temps réel** couvrant quatre interfaces métier :

| Interface | Utilisateurs cibles | Plateforme |
|-----------|---------------------|------------|
| 📱 Application Client | Clients du restaurant | Mobile iOS/Android |
| 👨‍🍳 Application Cuisine | Cuisiniers, chefs de rang | Tablette/Écran mural |
| 🛎️ Application Serveur | Serveurs, maîtres d'hôtel | Smartphone |
| 🖥️ Dashboard Admin | Gérant, manager | Navigateur web |

### Avantages concurrentiels

- **Module nutritionnel avancé** — 10+ profils de santé (diabète, hypertension, allergies, sport…)
- **Conçu pour l'Afrique** — Mobile Money (MTN/Orange), interface en français
- **Communication temps réel** — Client ↔ Serveur ↔ Cuisine ↔ Admin via Socket.io
- **Adapté aux PME** — Prix et complexité accessibles aux petites et moyennes structures

---

## 🏗️ Architecture Générale

```
┌─────────────────────────────────────────────────────────────┐
│                     KitchenPulse                            │
│                                                             │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────┐  │
│  │  App      │  │  App      │  │  App      │  │Dashboard│  │
│  │  Client   │  │  Cuisine  │  │  Serveur  │  │  Admin  │  │
│  │(React Nat)│  │(React Nat)│  │(React Nat)│  │(React)  │  │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └────┬────┘  │
│        │              │              │              │        │
│        └──────────────┴──────────────┴──────────────┘        │
│                               │                              │
│                    ┌──────────▼──────────┐                   │
│                    │    Nginx (Gateway)   │                   │
│                    └──────────┬──────────┘                   │
│                               │                              │
│                    ┌──────────▼──────────┐                   │
│                    │  Node.js + Express  │                   │
│                    │  + Socket.io        │                   │
│                    └──────────┬──────────┘                   │
│                               │                              │
│              ┌────────────────┼────────────────┐             │
│              │                │                │             │
│    ┌─────────▼───────┐ ┌──────▼──────┐ ┌──────▼──────┐      │
│    │   MySQL 8.0+    │ │    Redis    │ │  Firebase   │      │
│    │  (Persistance)  │ │   (Cache)   │ │    (FCM)    │      │
│    └─────────────────┘ └─────────────┘ └─────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Technologique

### Backend

| Technologie | Version | Rôle |
|-------------|---------|------|
| Node.js | 20 LTS | Runtime JavaScript |
| Express.js | 5.2.1 | Framework web REST |
| MySQL | 8.0+ | Base de données principale |
| Socket.io | 4.8.3 | Communication temps réel |
| JWT | 9.0.3 | Authentification stateless |
| bcryptjs | 3.0.3 | Hachage des mots de passe |
| Multer | 2.x | Upload de fichiers (images plats) |
| dotenv | 17.x | Variables d'environnement |
| nodemon | 3.x | Hot reload en développement |

### Frontend (Dashboard Admin)

| Technologie | Version | Rôle |
|-------------|---------|------|
| React | 18.3.1 | Bibliothèque UI |
| Vite | 5.4.11 | Build tool ultra-rapide |
| React Router DOM | 6.x | Navigation SPA |
| Axios | 1.7.9 | Requêtes HTTP |
| Tailwind CSS | 3.4.17 | Styling utility-first |
| React Toastify | 10.x | Notifications UI |

### Sécurité

- **RBAC** (Role-Based Access Control) via middleware dédié
- **JWT** avec access token 15 min + refresh token 7 jours
- **bcrypt** salt factor 12 pour les mots de passe
- **CORS** configuré par whitelist de domaines
- **Variables d'environnement** pour tous les secrets

---

## ✅ Prérequis

Avant de commencer, assurez-vous d'avoir installé :

| Logiciel | Version minimale | Vérification |
|----------|------------------|--------------|
| Node.js | v18+ | `node --version` |
| npm | v9+ | `npm --version` |
| MySQL | v8.0+ | `mysql --version` |
| Git | v2.30+ | `git --version` |

---

## 📦 Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/kryshandy/KitchenPulse.git
cd KitchenPulse
```

### 2. Initialiser la base de données

```bash
# Connexion à MySQL
mysql -u root -p

# Dans le shell MySQL
CREATE DATABASE kitchenpulse_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
exit;

# Import du schéma et des données initiales
mysql -u root -p kitchenpulse_db < backend/database/restaurant.sql
```

### 3. Installer les dépendances du backend

```bash
cd backend
npm install
```

### 4. Installer les dépendances du frontend

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Backend — `backend/.env`

Copiez le fichier d'exemple et renseignez vos valeurs :

```bash
cp backend/.env.example backend/.env
```

```env
# Serveur
PORT=3001
NODE_ENV=development

# Base de données MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=kitchenpulse_db
DB_USER=root
DB_PASSWORD=votre_mot_de_passe

# Authentification JWT
JWT_SECRET=votre_secret_jwt_tres_long_et_securise

# Socket.io — origine autorisée (frontend)
SOCKET_CORS_ORIGIN=http://localhost:5173
```

> ⚠️ **Ne jamais committer le fichier `.env`** — il est déjà listé dans `.gitignore`.

### Frontend — `frontend/.env`

```bash
# Créer le fichier .env du frontend
echo "VITE_API_URL=http://localhost:3001/api" > frontend/.env
```

---

## 🚀 Lancement

### Démarrer le backend

```bash
cd backend
npm run dev
```

Sortie attendue :
```
✅ Connexion MySQL réussie !
🍴 KitchenPulse backend → http://localhost:3001
⚡ Socket.io prêt
```

### Démarrer le frontend (dans un nouveau terminal)

```bash
cd frontend
npm run dev
```

Sortie attendue :
```
  VITE v5.4.11  ready in 312 ms
  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.x.x:5173/
```

### Accéder à l'application

Ouvrez votre navigateur sur **http://localhost:5173**

---

## 📁 Structure du Projet

```
KitchenPulse/
├── backend/
│   ├── config/
│   │   └── db.js                  # Connexion MySQL (pool)
│   ├── controllers/
│   │   ├── authController.js      # Register, login, profil
│   │   ├── dishController.js      # CRUD plats
│   │   ├── orderController.js     # Gestion des commandes
│   │   ├── platController.js      # Gestion avancée plats
│   │   ├── statsController.js     # Dashboard & statistiques
│   │   ├── tableController.js     # Gestion des tables
│   │   └── userConntrollers.js    # Gestion utilisateurs (admin)
│   ├── database/
│   │   ├── kitchenpulse_db.sql    # Schéma complet
│   │   └── restaurant.sql         # Données initiales (seed)
│   ├── middleware/
│   │   ├── upload.js              # Multer — upload images
│   │   ├── verifyRole.js          # RBAC — contrôle des rôles
│   │   └── verifyToken.js         # JWT — vérification du token
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dishRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── platRoutes.js
│   │   ├── reviewRoutes.js
│   │   ├── statsRoutes.js
│   │   ├── tableRoutes.js
│   │   └── userRoutes.js
│   ├── socket/                    # Logique Socket.io
│   ├── uploads/                   # Images uploadées (non versionné)
│   ├── .env                       # Variables locales (non versionné)
│   ├── .env.example               # Template de configuration
│   ├── package.json
│   └── server.js                  # Point d'entrée principal
├── frontend/
│   ├── src/
│   │   ├── components/            # Composants réutilisables
│   │   ├── pages/                 # Pages par rôle
│   │   ├── hooks/                 # Custom React hooks
│   │   └── main.jsx               # Point d'entrée React
│   ├── public/
│   ├── index.html
│   └── package.json
├── .gitignore
└── README.md
```

---

## 🔌 API Endpoints

### Authentification (publique)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/auth/register` | Créer un compte utilisateur |
| `POST` | `/api/auth/login` | Se connecter — retourne un JWT |
| `GET` | `/api/auth/allergies` | Liste des allergènes disponibles |

**Exemple — Inscription :**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Jean",
    "last_name": "Dupont",
    "email": "jean@example.com",
    "password": "motdepasse123"
  }'
```

**Exemple — Connexion :**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jean@example.com", "password": "motdepasse123"}'
```

---

### Routes protégées (JWT requis)

> Ajouter le header `Authorization: Bearer <TOKEN>` à chaque requête.

#### Profil & Utilisateurs

| Méthode | Endpoint | Rôle requis | Description |
|---------|----------|-------------|-------------|
| `GET` | `/api/auth/me` | Tous | Profil de l'utilisateur connecté |
| `GET` | `/api/users` | Admin | Liste de tous les utilisateurs |

#### Plats & Menu

| Méthode | Endpoint | Rôle requis | Description |
|---------|----------|-------------|-------------|
| `GET` | `/api/dishes` | Tous | Lister les plats actifs |
| `GET` | `/api/dishes/:id` | Tous | Détail d'un plat |
| `POST` | `/api/dishes` | Admin/Cuisinier | Créer un plat |
| `PUT` | `/api/dishes/:id` | Admin/Cuisinier | Modifier un plat |
| `DELETE` | `/api/dishes/:id` | Admin | Supprimer un plat |

#### Commandes

| Méthode | Endpoint | Rôle requis | Description |
|---------|----------|-------------|-------------|
| `POST` | `/api/orders` | Client | Passer une commande |
| `GET` | `/api/orders/mine` | Client | Mes commandes |
| `GET` | `/api/orders/cuisine` | Cuisinier | Commandes en attente cuisine |
| `GET` | `/api/orders` | Serveur/Admin | Toutes les commandes actives |
| `PATCH` | `/api/orders/:id/take` | Cuisinier | Prendre en charge une commande |
| `PATCH` | `/api/orders/:id/ready` | Cuisinier | Marquer une commande prête |
| `PATCH` | `/api/orders/:id/cancel` | Client/Serveur/Admin | Annuler une commande |

#### Tables

| Méthode | Endpoint | Rôle requis | Description |
|---------|----------|-------------|-------------|
| `GET` | `/api/tables` | Serveur/Admin | État de toutes les tables |
| `PATCH` | `/api/tables/:id/status` | Serveur/Admin | Changer le statut d'une table |

#### Statistiques & Dashboard

| Méthode | Endpoint | Rôle requis | Description |
|---------|----------|-------------|-------------|
| `GET` | `/api/stats/dashboard` | Admin | KPIs temps réel |
| `GET` | `/api/stats/active-orders` | Serveur/Admin | Commandes actives |
| `GET` | `/api/stats/weekly` | Admin | Statistiques hebdomadaires |

#### Paiements

| Méthode | Endpoint | Rôle requis | Description |
|---------|----------|-------------|-------------|
| `GET` | `/api/payments` | Client/Admin | Historique des paiements |

**Exemple — Appel authentifié :**
```bash
curl http://localhost:3001/api/dishes \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

---

## ⚡ Événements Socket.io

Le serveur Socket.io est accessible sur le même port que l'API (`:3001`).

### Connexion à une room

```javascript
// Côté client
const socket = io('http://localhost:3001');

// Rejoindre la room cuisine (cuisiniers uniquement)
socket.emit('join_cuisine');
```

### Événements émis par le serveur

| Événement | Destinataire | Payload | Description |
|-----------|-------------|---------|-------------|
| `new_order` | Cuisine | `{ commande_id, table, plats[], profil_client }` | Nouvelle commande reçue |
| `order_in_progress` | Client | `{ commande_id, statut }` | Commande prise en charge |
| `order_ready` | Serveur | `{ commande_id, table_numero, plats[] }` | Plats prêts à servir |
| `order_cancelled` | Client/Serveur | `{ commande_id, raison }` | Commande annulée |
| `table:statut_change` | Admin/Serveur | `{ table_id, statut }` | Changement statut d'une table |
| `stock:alerte` | Admin | `{ ingredient_id, nom, quantite_restante }` | Alerte rupture de stock |

---

## 👥 Rôles & Permissions

Les rôles sont stockés en **minuscules** dans la base de données.

| Fonctionnalité | `client` | `serveur` | `cuisinier` | `admin` |
|----------------|:--------:|:---------:|:-----------:|:-------:|
| Consulter le menu | ✅ | ✅ | ✅ | ✅ |
| Passer une commande | ✅ | ✅ | ❌ | ❌ |
| Voir ses commandes | ✅ | ✅ | ✅ | ✅ |
| Changer statut commande | ❌ | ✅ (servie) | ✅ (prête) | ✅ |
| Gérer les tables | ❌ | ✅ | ❌ | ✅ |
| Gérer le menu | ❌ | ❌ | ✅ | ✅ |
| Gérer les stocks | ❌ | ❌ | ❌ | ✅ |
| Dashboard statistiques | ❌ | ❌ | ❌ | ✅ |
| Gérer les utilisateurs | ❌ | ❌ | ❌ | ✅ |

---

## ✨ Fonctionnalités

### ✅ Implémentées

- **Authentification complète** — Register, Login, JWT + bcrypt
- **Gestion du menu** — CRUD complet des plats avec upload photos
- **Commandes temps réel** — Création, suivi, changement de statut via Socket.io
- **Vue cuisine** — Flux `Nouveau → En préparation → Prêt`
- **Gestion des tables** — CRUD + changement de statut
- **Gestion utilisateurs** — CRUD complet avec rôles (admin)
- **Profil nutritionnel** — Profils de santé avancés (diabète, HTA, allergies, sport…)
- **Module statistiques** — Dashboard KPIs, commandes actives, weekly stats

### ⏳ En développement

| Fonctionnalité | Branche |
|----------------|---------|
| Assign/Deliver order (serveur) | `feature/serveur-admin` |
| Tests unitaires & intégration | `feature/tests` |
| Système d'avis et notes | *(à venir)* |
| Paiement Mobile Money (CinetPay) | *(à venir)* |

---

## 🌿 Branches Git

| Branche | Description | Statut |
|---------|-------------|--------|
| `main` | Version stable de production | ✅ Stable |
| `feature/tests` | Tests unitaires + intégration (Jest/Supertest) | 🔧 En cours |
| `feature/serveur-admin` | Fonctions serveur avancées (assign/deliver) | 🔧 En cours |
| `feature/setup-auth` | Mise en place authentification initiale | ✅ Mergée |
| `feature/socket` | Intégration Socket.io temps réel | ✅ Mergée |
| `feature/cuisinier` | Interface et logique côté cuisine | ✅ Mergée |
| `feature/client-ui` | Interface utilisateur client | ✅ Mergée |

> 📌 La branche active de développement est actuellement **`feature/tests`**.

### Workflow Git

```bash
# Créer une nouvelle feature
git checkout -b feature/ma-fonctionnalite

# Travailler, committer...
git add .
git commit -m "feat: description de la fonctionnalité"

# Pousser sur le remote
git push origin feature/ma-fonctionnalite
```

**Convention de commits :**

| Préfixe | Usage |
|---------|-------|
| `feat:` | Nouvelle fonctionnalité |
| `fix:` | Correction de bug |
| `docs:` | Mise à jour documentation |
| `test:` | Ajout/modification de tests |
| `refactor:` | Refactoring sans changement fonctionnel |
| `chore:` | Tâches de maintenance |

---

## 🔧 Dépannage

### Le backend ne démarre pas — port déjà utilisé

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# macOS / Linux
lsof -i :3001
kill -9 <PID>
```

### Connexion MySQL échouée

```bash
# Vérifier que MySQL est démarré
# Windows
net start MySQL80

# macOS / Linux
sudo systemctl start mysql

# Vérifier que la base de données existe
mysql -u root -p -e "SHOW DATABASES;"
```

Vérifier les variables dans `backend/.env` :
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

### Le frontend ne se connecte pas au backend

1. S'assurer que le backend tourne bien sur le port `3001`
2. Vérifier `frontend/.env` : `VITE_API_URL=http://localhost:3001/api`
3. Consulter les logs backend pour détecter des erreurs CORS

### Erreur "Module not found"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Token JWT expiré

Les access tokens ont une durée de vie de **15 minutes**. Se déconnecter et se reconnecter pour en obtenir un nouveau.

### Points d'attention importants

> ⚠️ **Conventions à respecter impérativement :**
> - **Statuts des commandes** (en minuscules) : `nouveau`, `en_preparation`, `pret`, `livree`, `cloturee`, `annule`
> - **Noms des tables SQL** : `commandes` (pas `orders`), `plats` (pas `dishes`)
> - **Socket.io** : utiliser `req.io.emit()` — l'instance est injectée via middleware
> - **Rôles en base** : `client`, `cuisinier`, `serveur`, `admin` (tout en minuscules)

---

## 📊 Statut du Projet

| Sprint | Description | Statut |
|--------|-------------|--------|
| S0 — Setup | Repo Git, BDD, Expo, React | ✅ Terminé |
| S1 — Base | Auth, CRUD menu, WebSocket basique | ✅ Terminé |
| S2 — Commande | Panier, paiement, Socket.io cuisine | ✅ Terminé |
| S3 — Nutrition | Profils, suggestions, scoring | 🔧 En cours |
| S4 — Finition | Sécurité avancée, tests, polish | 🔧 En cours |
| S5 — Démo | Déploiement production, soutenance | ⏳ À venir |

---

## 👨‍💻 Équipe

| Rôle | Responsabilités |
|------|-----------------|
| **Membre 1** — Chef de Projet & Backend Lead | Architecture, API REST, Socket.io, DevOps, CI/CD |
| **Membre 2** — Mobile Lead (Client) | App client React Native, module nutrition, paiement |
| **Membre 3** — Mobile Lead (Serveur & Cuisine) | App serveur, app cuisine, notifications FCM |
| **Membre 4** — Frontend Web (Dashboard Admin) | Dashboard React, statistiques, gestion stocks |
| **Membre 5** — Data, Nutrition & QA | Base nutritionnelle, algorithme scoring, tests, documentation |

**Établissement :** KEYCE Informatique — Yaoundé, Cameroun
**Promotion :** Groupe 7 — Projet Tutoré — Juin 2025/2026

---

## 📄 Licence

Ce projet est développé dans un cadre **académique exclusif** — KEYCE Informatique, Yaoundé. Usage et reproduction soumis à autorisation.

---

<div align="center">

**🍴 Bon appétit et bon développement avec KitchenPulse !**

*KEYCE Informatique Yaoundé — Groupe 7 — 2025/2026*

</div>