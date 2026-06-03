-- Création de la base
CREATE DATABASE IF NOT EXISTS kitchenpulse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE kitchenpulse;

-- Table users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL,
  role ENUM('client', 'cuisinier', 'serveur', 'admin') NOT NULL DEFAULT 'client',
  allergenes TEXT DEFAULT NULL,
  kcal_max INT DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table dishes (structure seule, remplie dans feat/cuisinier)
CREATE TABLE IF NOT EXISTS dishes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  description TEXT,
  prix DECIMAL(10,2) NOT NULL,
  calories INT DEFAULT 0,
  categorie VARCHAR(50),
  photo VARCHAR(255),
  disponible TINYINT(1) DEFAULT 1
);

-- Table orders
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  serveur_id INT DEFAULT NULL,
  statut ENUM('en_attente', 'en_preparation', 'pret', 'livre', 'annule') DEFAULT 'en_attente',
  total DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (serveur_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Table order_items
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  dish_id INT NOT NULL,
  quantite INT NOT NULL DEFAULT 1,
  kcal_total INT DEFAULT 0,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);

-- Table reviews
CREATE TABLE IF NOT EXISTS reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  dish_id INT NOT NULL,
  note INT CHECK (note BETWEEN 1 AND 5),
  commentaire TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE CASCADE
);

-- Table payments
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  methode ENUM('carte', 'especes', 'ticket_restaurant') NOT NULL,
  montant DECIMAL(10,2) NOT NULL,
  statut ENUM('en_attente', 'valide', 'rembourse') DEFAULT 'en_attente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);