# 🍴 KitchenPulse

KitchenPulse est une application moderne de gestion et de commande pour restaurant, divisée en une partie **Frontend (React/Vite)** et une partie **Backend (Express/Node.js)**.

Cette branche contient l'intégration complète de l'**Interface Client**, permettant la composition personnalisée de repas, le calcul énergétique (kcal) de groupe et la simulation de plusieurs modes de règlement locaux.

---

## 🚀 Fonctionnalités de l'Interface Client

- **Composition de Repas sur Mesure** : Possibilité de spécifier des ingrédients à ajouter ou retirer, ainsi qu'un objectif de calories ciblé (kcal) directement transmis au cuisinier.
- **Gestion des Quantités en Amont** : Choix du nombre de portions directement depuis la carte avant l'ajout au panier.
- **Ajustement Multi-Couverts** : Multiplicateur dynamique du prix et de l'apport calorique total selon le nombre de personnes à table.
- **Devise Locale** : Affichage intégral des tarifs en **FCFA**.
- **Flexibilité des Paiements** : Intégration de formulaires adaptés pour **Orange Money**, **MTN Mobile Money**, **Espèces (Caisse)** et **Carte Bancaire**.

---

## 🛠️ Installation et Lancement local

### 1. Prérequis
Assurez-vous d'avoir installé [Node.js](https://nodejs.org/) sur votre machine.

### 2. Configuration du Frontend
Ouvrez votre terminal dans le dossier du projet et exécutez les commandes suivantes :

```bash
# Entrer dans le dossier frontend
cd frontend

# Installer les dépendances (recrée le dossier node_modules localement)
npm install

# Lancer le serveur de développement
npm run dev