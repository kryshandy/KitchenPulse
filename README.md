# ⚡ KitchenPulse — Système de Gestion Intégrée pour Restaurant

> **Projet Tuteuré — Semestre 2** > **KEYCE Informatique Yaoundé** > **Groupe N°7** > **Développeur Principal / Administrateur Système :** Henri Michel Essomba Djomeni (Matricule : KIA-25-2A-149)

---

## 📋 Présentation du Projet

**KitchenPulse** est une application web moderne de type SaaS conçue pour optimiser et synchroniser la communication en temps réel au sein d'un restaurant. L'application interconnecte trois acteurs clés de l'établissement :
1. **L'Administration** : Suivi du chiffre d'affaires, gestion fine des stocks et approvisionnements, contrôle des rôles du personnel et édition de la carte du menu.
2. **La Cuisine** : Réception instantanée des commandes et mise à jour de l'avancement de la production via un tableau Kanban.
3. **La Salle (Serveurs)** : Saisie rapide des commandes clients par table et suivi du statut des plats prêts à servir.

---

## ✨ Fonctionnalités Majeures (Côté Admin)

* **Dashboard Épuré (Charte Premium Ambrée)** : Indicateurs financiers (Chiffre d'affaires, panier moyen) recalculés en temps réel avec un système d'alerte visuel sur les stocks critiques en cuisine.
* **Sidebar Rétractable Clinique** : Menu de navigation asymétrique et fluide, maximisant l'espace de travail sur l'affichage des données.
* **Gestion Dynamique des Rôles** : Interface d'administration pour affecter et modifier instantanément les habilitations du personnel (`SERVEUR`, `CUISINIER`, `ADMIN`).
* **Gestion de la Carte** : Formulaire d'insertion de nouveaux articles (Entrées, Plats, Boissons, Desserts) connecté directement à la base de données.
* **Suivi Kanban des Commandes** : Gestion du flux de production en trois colonnes majeures (*Nouvelles Requêtes*, *En Préparation*, *Prêt à Servir*).

---

## 🛠️ Technologies Utilisées

### Frontend
* **React.js (v18+)** : Architecture modulaire basée sur les composants avec gestion des états locaux (`useState`, `useEffect`).
* **CSS-in-JS & Transitions Cubiques** : Interface utilisateur asymétrique haut de gamme, sans dépendances lourdes, garantissant une fluidité maximale.

### Backend & Base de données
* **Node.js & Express** : Serveur d'API REST robuste gérant les requêtes asynchrones.
* **MySQL (kitchenpulse_db)** : Modèle relationnel complet avec Triggers automatiques et Vues SQL optimisées pour les calculs de statistiques.

---

## 🚀 Installation et Lancement du Projet

### 1. Prérequis
* **Node.js** (Version v24.15.0 ou ultérieure recommandée)
* **XAMPP / Wampserver** (Pour faire tourner la base de données MySQL)

### 2. Configuration de la Base de Données
1. Démarrez les modules Apache et MySQL sur votre panneau de contrôle XAMPP.
2. Rendez-vous sur `http://localhost/phpmyadmin/`.
3. Créez une nouvelle base de données nommée `kitchenpulse_db`.
4. Importez le fichier script final fourni : `restaurant.sql`.

### 3. Lancement du Backend
Ouvrez un terminal dans le dossier du serveur et exécutez :
```bash
cd backend
npm install
node server.js