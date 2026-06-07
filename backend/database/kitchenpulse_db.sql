-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : dim. 07 juin 2026 à 13:30
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `kitchenpulse_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `allergies`
--

CREATE TABLE `allergies` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `label` varchar(100) NOT NULL,
  `icon` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `allergies`
--

INSERT INTO `allergies` (`id`, `code`, `label`, `icon`) VALUES
(1, 'GLUTEN', 'Céréales contenant du gluten', '🌾'),
(2, 'CRUSTACES', 'Crustacés', '🦐'),
(3, 'OEUFS', 'Œufs', '🥚'),
(4, 'POISSON', 'Poisson', '🐟'),
(5, 'ARACHIDES', 'Arachides (cacahuètes)', '🥜'),
(6, 'SOJA', 'Soja', '🫘'),
(7, 'LACTOSE', 'Lait et produits laitiers', '🥛'),
(8, 'NOIX', 'Fruits à coque (noix, amandes...)', '🌰'),
(9, 'CELERI', 'Céleri', '🥬'),
(10, 'MOUTARDE', 'Moutarde', '🌿'),
(11, 'SESAME', 'Graines de sésame', '🌱'),
(12, 'SULFITES', 'Dioxyde de soufre et sulfites', '🍷'),
(13, 'LUPIN', 'Lupin', '🌼'),
(14, 'MOLLUSQUES', 'Mollusques', '🦑');

-- --------------------------------------------------------

--
-- Structure de la table `avis`
--

CREATE TABLE `avis` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `plat_id` bigint(20) UNSIGNED NOT NULL,
  `note` tinyint(3) UNSIGNED NOT NULL,
  `commentaire` text DEFAULT NULL,
  `is_verified_purchase` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `avis`
--
DELIMITER $$
CREATE TRIGGER `trg_avis_bi` BEFORE INSERT ON `avis` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_avis_bu` BEFORE UPDATE ON `avis` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `icon` varchar(191) NOT NULL DEFAULT '',
  `color_hex` char(7) DEFAULT NULL,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `icon`, `color_hex`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Entrées', 'entrees', '🥗', '#27AE60', 1, 1, '2026-06-04 17:26:33', '2026-06-04 17:26:33'),
(2, 'Plats principaux', 'plats', '🍽️', '#1B3A6B', 2, 1, '2026-06-04 17:26:33', '2026-06-04 17:26:33'),
(3, 'Grillades', 'grillades', '🔥', '#E67E22', 3, 1, '2026-06-04 17:26:33', '2026-06-04 17:26:33'),
(4, 'Poissons & Fruits de mer', 'poissons', '🐟', '#0E7C7B', 4, 1, '2026-06-04 17:26:33', '2026-06-04 17:26:33'),
(5, 'Végétarien', 'vegetarien', '🌱', '#1A7A4A', 5, 1, '2026-06-04 17:26:33', '2026-06-04 17:26:33'),
(6, 'Desserts', 'desserts', '🍮', '#C0392B', 6, 1, '2026-06-04 17:26:33', '2026-06-04 17:26:33'),
(7, 'Boissons', 'boissons', '🥤', '#8E44AD', 7, 1, '2026-06-04 17:26:33', '2026-06-04 17:26:33'),
(8, 'Menus du jour', 'menus-du-jour', '📋', '#F39C12', 8, 1, '2026-06-04 17:26:33', '2026-06-04 17:26:33');

--
-- Déclencheurs `categories`
--
DELIMITER $$
CREATE TRIGGER `trg_categories_bi` BEFORE INSERT ON `categories` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_categories_bu` BEFORE UPDATE ON `categories` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `commandes`
--

CREATE TABLE `commandes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `table_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `waiter_id` bigint(20) UNSIGNED DEFAULT NULL,
  `status` enum('RECUE','EN_PREPARATION','PRETE','EN_COURS_DE_SERVICE','SERVIE','CLOTUREE','ANNULEE') NOT NULL DEFAULT 'RECUE',
  `payment_status` enum('EN_ATTENTE','PARTIEL','PAYE','REMBOURSE','ECHEC') NOT NULL DEFAULT 'EN_ATTENTE',
  `order_number` varchar(50) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `loyalty_points_used` int(11) NOT NULL DEFAULT 0,
  `notes` text DEFAULT NULL,
  `opened_at` datetime NOT NULL,
  `closed_at` datetime DEFAULT NULL,
  `updated_at` datetime NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `commandes`
--

INSERT INTO `commandes` (`id`, `table_id`, `user_id`, `waiter_id`, `status`, `payment_status`, `order_number`, `subtotal`, `discount_amount`, `tax_amount`, `total_amount`, `loyalty_points_used`, `notes`, `opened_at`, `closed_at`, `updated_at`, `created_at`) VALUES
(1, 1, 2, NULL, 'SERVIE', 'EN_ATTENTE', 'KP-0001', 3500.00, 0.00, 0.00, 3500.00, 0, NULL, '2026-06-07 10:21:27', NULL, '2026-06-07 12:17:09', '2026-06-07 10:21:27');

--
-- Déclencheurs `commandes`
--
DELIMITER $$
CREATE TRIGGER `trg_commandes_bi` BEFORE INSERT ON `commandes` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
  -- opened_at prend la valeur de created_at si non fournie
  IF NEW.opened_at IS NULL OR NEW.opened_at = '0000-00-00 00:00:00' THEN
    SET NEW.opened_at = NOW();
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_commandes_bu` BEFORE UPDATE ON `commandes` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
  -- Fermeture automatique quand statut passe à CLOTUREE ou ANNULEE
  IF (NEW.status IN ('CLOTUREE','ANNULEE')) AND OLD.status NOT IN ('CLOTUREE','ANNULEE') THEN
    IF NEW.closed_at IS NULL THEN
      SET NEW.closed_at = NOW();
    END IF;
  END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_order_status_history` AFTER UPDATE ON `commandes` FOR EACH ROW BEGIN
  IF OLD.status <> NEW.status THEN
    INSERT INTO `order_status_history` (`commande_id`, `previous_status`, `new_status`)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `customization_items`
--

CREATE TABLE `customization_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `order_item_id` bigint(20) UNSIGNED NOT NULL,
  `ingredient_id` bigint(20) UNSIGNED NOT NULL,
  `action` enum('ADD','REMOVE','REPLACE') NOT NULL,
  `quantity` decimal(10,2) NOT NULL DEFAULT 0.00,
  `replacement_ingredient_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `customization_items`
--
DELIMITER $$
CREATE TRIGGER `trg_customization_items_bi` BEFORE INSERT ON `customization_items` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `fidelite`
--

CREATE TABLE `fidelite` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `points` int(11) NOT NULL DEFAULT 0,
  `level` enum('BRONZE','ARGENT','OR','PLATINE') NOT NULL DEFAULT 'BRONZE',
  `expires_at` datetime DEFAULT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `fidelite`
--
DELIMITER $$
CREATE TRIGGER `trg_fidelite_bu` BEFORE UPDATE ON `fidelite` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_fidelite_level_update` BEFORE UPDATE ON `fidelite` FOR EACH ROW BEGIN
  SET NEW.level = CASE
    WHEN NEW.points >= 5000 THEN 'PLATINE'
    WHEN NEW.points >= 2000 THEN 'OR'
    WHEN NEW.points >= 500  THEN 'ARGENT'
    ELSE 'BRONZE'
  END;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `ingredients`
--

CREATE TABLE `ingredients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `calories_100g` decimal(10,2) NOT NULL DEFAULT 0.00,
  `proteins_100g` decimal(10,2) NOT NULL DEFAULT 0.00,
  `lipids_100g` decimal(10,2) NOT NULL DEFAULT 0.00,
  `glucids_100g` decimal(10,2) NOT NULL DEFAULT 0.00,
  `fibers_100g` decimal(10,2) NOT NULL DEFAULT 0.00,
  `salt_100g` decimal(10,2) NOT NULL DEFAULT 0.00,
  `sugars_100g` decimal(10,2) NOT NULL DEFAULT 0.00,
  `source` varchar(100) DEFAULT NULL,
  `openfood_id` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `ingredients`
--
DELIMITER $$
CREATE TRIGGER `trg_ingredients_bi` BEFORE INSERT ON `ingredients` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_ingredients_bu` BEFORE UPDATE ON `ingredients` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `ingredient_allergens`
--

CREATE TABLE `ingredient_allergens` (
  `ingredient_id` bigint(20) UNSIGNED NOT NULL,
  `allergy_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `loyalty_transactions`
--

CREATE TABLE `loyalty_transactions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `points_delta` int(11) NOT NULL,
  `reason` varchar(255) NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `loyalty_transactions`
--
DELIMITER $$
CREATE TRIGGER `trg_loyalty_transactions_bi` BEFORE INSERT ON `loyalty_transactions` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `recipient_id` bigint(20) UNSIGNED NOT NULL,
  `type` varchar(100) NOT NULL,
  `title` varchar(191) DEFAULT NULL,
  `body` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `push_sent` tinyint(1) NOT NULL DEFAULT 0,
  `push_sent_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `notifications`
--
DELIMITER $$
CREATE TRIGGER `trg_notifications_bi` BEFORE INSERT ON `notifications` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_notifications_bu` BEFORE UPDATE ON `notifications` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `notification_readers`
--

CREATE TABLE `notification_readers` (
  `notification_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `read_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `nutrition_profiles`
--

CREATE TABLE `nutrition_profiles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `diabetes_type` enum('aucun','type1','type2','gestationnel') NOT NULL DEFAULT 'aucun',
  `hypertension` tinyint(1) NOT NULL DEFAULT 0,
  `kidney_failure` tinyint(1) NOT NULL DEFAULT 0,
  `pregnancy` tinyint(1) NOT NULL DEFAULT 0,
  `pregnancy_weeks` tinyint(3) UNSIGNED DEFAULT NULL,
  `diet` enum('omnivore','vegetarien','vegan','halal','casher','sans_porc') NOT NULL DEFAULT 'omnivore',
  `goal` enum('maintien','perte_poids','prise_masse','performance','sante') NOT NULL DEFAULT 'maintien',
  `activity_level` enum('sedentaire','leger','modere','intense','competition') NOT NULL DEFAULT 'sedentaire',
  `sport_type` varchar(100) DEFAULT NULL,
  `calories_target` int(10) UNSIGNED DEFAULT NULL,
  `proteins_target` int(10) UNSIGNED DEFAULT NULL,
  `lipids_target` int(10) UNSIGNED DEFAULT NULL,
  `glucids_target` int(10) UNSIGNED DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `nutrition_profiles`
--
DELIMITER $$
CREATE TRIGGER `trg_nutrition_profiles_bi` BEFORE INSERT ON `nutrition_profiles` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_nutrition_profiles_bu` BEFORE UPDATE ON `nutrition_profiles` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `order_items`
--

CREATE TABLE `order_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `commande_id` bigint(20) UNSIGNED NOT NULL,
  `plat_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `unit_price` decimal(12,2) NOT NULL,
  `item_total` decimal(12,2) NOT NULL,
  `special_notes` text DEFAULT NULL,
  `nutrition_snapshot` longtext DEFAULT NULL,
  `item_status` enum('EN_ATTENTE','EN_PREPARATION','PRET','SERVI','ANNULE') NOT NULL DEFAULT 'EN_ATTENTE',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `order_items`
--

INSERT INTO `order_items` (`id`, `commande_id`, `plat_id`, `quantity`, `unit_price`, `item_total`, `special_notes`, `nutrition_snapshot`, `item_status`, `created_at`, `updated_at`) VALUES
(1, 1, 0, 1, 3500.00, 0.00, NULL, NULL, 'EN_ATTENTE', '2026-06-07 10:21:27', '2026-06-07 10:21:27');

--
-- Déclencheurs `order_items`
--
DELIMITER $$
CREATE TRIGGER `trg_commande_total_after_item_insert` AFTER INSERT ON `order_items` FOR EACH ROW BEGIN
  UPDATE `commandes`
  SET
    `subtotal`     = `subtotal`     + NEW.item_total,
    `total_amount` = `subtotal`     + NEW.item_total + `tax_amount` - `discount_amount`
  WHERE `id` = NEW.commande_id;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_order_items_bi` BEFORE INSERT ON `order_items` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_order_items_bu` BEFORE UPDATE ON `order_items` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_stock_after_order_item_insert` AFTER INSERT ON `order_items` FOR EACH ROW BEGIN
  INSERT INTO `stock_movements` (`ingredient_id`, `movement_type`, `quantity`, `reference_type`, `reference_id`)
  SELECT
    pi.`ingredient_id`,
    'OUT',
    pi.`quantity` * NEW.quantity,
    'commande',
    NEW.commande_id
  FROM `plat_ingredients` pi
  WHERE pi.`plat_id` = NEW.plat_id;

  UPDATE `stocks` s
  JOIN `plat_ingredients` pi ON pi.`ingredient_id` = s.`ingredient_id`
  SET s.`quantity` = s.`quantity` - (pi.`quantity` * NEW.quantity)
  WHERE pi.`plat_id` = NEW.plat_id;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `order_status_history`
--

CREATE TABLE `order_status_history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `commande_id` bigint(20) UNSIGNED NOT NULL,
  `previous_status` varchar(50) DEFAULT NULL,
  `new_status` varchar(50) NOT NULL,
  `changed_by` bigint(20) UNSIGNED DEFAULT NULL,
  `reason` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `order_status_history`
--

INSERT INTO `order_status_history` (`id`, `commande_id`, `previous_status`, `new_status`, `changed_by`, `reason`, `created_at`) VALUES
(1, 1, 'RECUE', 'EN_PREPARATION', NULL, NULL, '2026-06-07 11:46:37'),
(2, 1, 'EN_PREPARATION', 'PRETE', NULL, NULL, '2026-06-07 11:46:57'),
(3, 1, 'PRETE', 'EN_COURS_DE_SERVICE', NULL, NULL, '2026-06-07 12:17:02'),
(4, 1, 'EN_COURS_DE_SERVICE', 'SERVIE', NULL, NULL, '2026-06-07 12:17:09');

--
-- Déclencheurs `order_status_history`
--
DELIMITER $$
CREATE TRIGGER `trg_order_status_history_bi` BEFORE INSERT ON `order_status_history` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `paiements`
--

CREATE TABLE `paiements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `commande_id` bigint(20) UNSIGNED NOT NULL,
  `method` enum('MTN_MOMO','ORANGE_MONEY','CARTE_BANCAIRE','CAISSE','QR_LOCAL','SPLIT_BILL') NOT NULL,
  `amount` decimal(12,2) NOT NULL,
  `currency` char(3) NOT NULL DEFAULT 'XAF',
  `provider` varchar(50) DEFAULT NULL,
  `reference` varchar(191) NOT NULL,
  `status` enum('PENDING','SUCCESS','FAILED','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `paiements`
--
DELIMITER $$
CREATE TRIGGER `trg_paiements_bi` BEFORE INSERT ON `paiements` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_paiements_bu` BEFORE UPDATE ON `paiements` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
  -- Enregistrer la date de paiement quand le statut passe à SUCCESS
  IF NEW.status = 'SUCCESS' AND OLD.status <> 'SUCCESS' THEN
    IF NEW.paid_at IS NULL THEN
      SET NEW.paid_at = NOW();
    END IF;
  END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `patient_conditions`
--

CREATE TABLE `patient_conditions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `profile_id` bigint(20) UNSIGNED NOT NULL,
  `condition_type` varchar(100) NOT NULL,
  `severity` enum('low','moderate','high','critical') NOT NULL DEFAULT 'moderate',
  `notes` text DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `patient_conditions`
--
DELIMITER $$
CREATE TRIGGER `trg_patient_conditions_bi` BEFORE INSERT ON `patient_conditions` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `payment_events`
--

CREATE TABLE `payment_events` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `paiement_id` bigint(20) UNSIGNED NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `payload` longtext DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `payment_events`
--
DELIMITER $$
CREATE TRIGGER `trg_payment_events_bi` BEFORE INSERT ON `payment_events` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `plats`
--

CREATE TABLE `plats` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `prep_time_minutes` smallint(5) UNSIGNED DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `is_featured` tinyint(1) NOT NULL DEFAULT 0,
  `nutri_score` enum('A','B','C','D','E') DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `plats`
--

INSERT INTO `plats` (`id`, `category_id`, `name`, `slug`, `description`, `price`, `image_url`, `prep_time_minutes`, `is_active`, `is_featured`, `nutri_score`, `created_at`, `updated_at`) VALUES
(1, 8, 'poulet', 'poulet-1780779343429', 'poulet dg', 3500.00, '/uploads/dishes/1780779343412-919007.jpg', 40, 1, 1, NULL, '2026-06-06 21:55:43', '2026-06-06 21:55:43');

--
-- Déclencheurs `plats`
--
DELIMITER $$
CREATE TRIGGER `trg_plats_bi` BEFORE INSERT ON `plats` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_plats_bu` BEFORE UPDATE ON `plats` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `plat_allergens`
--

CREATE TABLE `plat_allergens` (
  `plat_id` bigint(20) UNSIGNED NOT NULL,
  `allergy_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `plat_ingredients`
--

CREATE TABLE `plat_ingredients` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `plat_id` bigint(20) UNSIGNED NOT NULL,
  `ingredient_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit` varchar(50) NOT NULL,
  `optional` tinyint(1) NOT NULL DEFAULT 0,
  `removable` tinyint(1) NOT NULL DEFAULT 1,
  `addable` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `plat_ingredients`
--
DELIMITER $$
CREATE TRIGGER `trg_plat_ingredients_bi` BEFORE INSERT ON `plat_ingredients` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_plat_ingredients_bu` BEFORE UPDATE ON `plat_ingredients` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `plat_nutriments`
--

CREATE TABLE `plat_nutriments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `plat_id` bigint(20) UNSIGNED NOT NULL,
  `calories` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `proteins` decimal(8,2) NOT NULL DEFAULT 0.00,
  `lipids` decimal(8,2) NOT NULL DEFAULT 0.00,
  `glucids` decimal(8,2) NOT NULL DEFAULT 0.00,
  `fibers` decimal(8,2) NOT NULL DEFAULT 0.00,
  `salt_mg` decimal(10,2) NOT NULL DEFAULT 0.00,
  `sugars` decimal(8,2) NOT NULL DEFAULT 0.00,
  `saturated_fats` decimal(8,2) NOT NULL DEFAULT 0.00,
  `glycemic_index` tinyint(3) UNSIGNED DEFAULT NULL,
  `serving_size_g` smallint(5) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `plat_nutriments`
--

INSERT INTO `plat_nutriments` (`id`, `plat_id`, `calories`, `proteins`, `lipids`, `glucids`, `fibers`, `salt_mg`, `sugars`, `saturated_fats`, `glycemic_index`, `serving_size_g`, `created_at`, `updated_at`) VALUES
(1, 0, 45, 14.00, 23.00, 14.00, 0.00, 0.00, 0.00, 0.00, NULL, NULL, '2026-06-06 21:55:43', '2026-06-06 21:55:43');

--
-- Déclencheurs `plat_nutriments`
--
DELIMITER $$
CREATE TRIGGER `trg_plat_nutriments_bi` BEFORE INSERT ON `plat_nutriments` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_plat_nutriments_bu` BEFORE UPDATE ON `plat_nutriments` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `profile_allergies`
--

CREATE TABLE `profile_allergies` (
  `profile_id` bigint(20) UNSIGNED NOT NULL,
  `allergy_id` bigint(20) UNSIGNED NOT NULL,
  `severity` enum('intolerance','allergie','allergie_severe') NOT NULL DEFAULT 'allergie'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `recipe_items`
--

CREATE TABLE `recipe_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `plat_id` bigint(20) UNSIGNED NOT NULL,
  `step_number` tinyint(3) UNSIGNED NOT NULL,
  `instruction` text NOT NULL,
  `duration_seconds` int(10) UNSIGNED DEFAULT NULL,
  `image_url` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `recipe_items`
--
DELIMITER $$
CREATE TRIGGER `trg_recipe_items_bi` BEFORE INSERT ON `recipe_items` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_recipe_items_bu` BEFORE UPDATE ON `recipe_items` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `review_votes`
--

CREATE TABLE `review_votes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `avis_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `vote` enum('UP','DOWN') NOT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `review_votes`
--
DELIMITER $$
CREATE TRIGGER `trg_review_votes_bi` BEFORE INSERT ON `review_votes` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `stocks`
--

CREATE TABLE `stocks` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ingredient_id` bigint(20) UNSIGNED NOT NULL,
  `quantity` decimal(12,3) NOT NULL DEFAULT 0.000,
  `alert_threshold` decimal(12,3) NOT NULL DEFAULT 0.000,
  `unit` varchar(50) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `last_counted_at` datetime DEFAULT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `stocks`
--
DELIMITER $$
CREATE TRIGGER `trg_stocks_bu` BEFORE UPDATE ON `stocks` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `ingredient_id` bigint(20) UNSIGNED NOT NULL,
  `movement_type` enum('IN','OUT','ADJUSTMENT','WASTE','INVENTORY') NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `unit_cost` decimal(12,2) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` bigint(20) UNSIGNED DEFAULT NULL,
  `note` text DEFAULT NULL,
  `created_by` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `stock_movements`
--
DELIMITER $$
CREATE TRIGGER `trg_stock_movements_bi` BEFORE INSERT ON `stock_movements` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `tables_restaurant`
--

CREATE TABLE `tables_restaurant` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `table_number` int(10) UNSIGNED NOT NULL,
  `label` varchar(50) DEFAULT NULL,
  `capacity` tinyint(3) UNSIGNED NOT NULL,
  `status` enum('LIBRE','RESERVEE','OCCUPEE','EN_SERVICE','ADDITION_DEMANDEE','EN_NETTOYAGE','libre','reservee','occupee','en_service','addition_demandee','en_nettoyage') NOT NULL DEFAULT 'LIBRE',
  `qr_code` varchar(255) NOT NULL,
  `area` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `tables_restaurant`
--

INSERT INTO `tables_restaurant` (`id`, `table_number`, `label`, `capacity`, `status`, `qr_code`, `area`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 0, 'Livraison à domicile', 1, 'EN_NETTOYAGE', 'KP-DELIVERY', 'Livraison', 1, '2026-06-07 08:56:56', '2026-06-07 12:16:50'),
(2, 1, 'Table 1', 4, 'LIBRE', 'KP-TABLE-001', 'Salle principale', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(3, 2, 'Table 2', 4, 'LIBRE', 'KP-TABLE-002', 'Salle principale', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(4, 3, 'Table 3', 4, 'LIBRE', 'KP-TABLE-003', 'Salle principale', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(5, 4, 'Table 4', 4, 'LIBRE', 'KP-TABLE-004', 'Salle principale', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(6, 5, 'Table 5', 4, 'LIBRE', 'KP-TABLE-005', 'Salle principale', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(7, 6, 'Table 6', 6, 'LIBRE', 'KP-TABLE-006', 'Salle principale', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(8, 7, 'Table 7', 6, 'LIBRE', 'KP-TABLE-007', 'Salle principale', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(9, 8, 'Table 8', 6, 'LIBRE', 'KP-TABLE-008', 'Salle principale', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(10, 9, 'Table 9', 2, 'LIBRE', 'KP-TABLE-009', 'Terrasse', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(11, 10, 'Table 10', 2, 'LIBRE', 'KP-TABLE-010', 'Terrasse', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(12, 11, 'Table 11', 4, 'LIBRE', 'KP-TABLE-011', 'Terrasse', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(13, 12, 'Table 12', 4, 'LIBRE', 'KP-TABLE-012', 'Terrasse', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(14, 13, 'Table 13', 8, 'LIBRE', 'KP-TABLE-013', 'Salle VIP', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(15, 14, 'Table 14', 8, 'LIBRE', 'KP-TABLE-014', 'Salle VIP', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(16, 15, 'Table 15', 4, 'LIBRE', 'KP-TABLE-015', 'Bar', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(17, 16, 'Table 16', 4, 'LIBRE', 'KP-TABLE-016', 'Bar', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(18, 17, 'Table 17', 4, 'LIBRE', 'KP-TABLE-017', 'Salle principale', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(19, 18, 'Table 18', 4, 'LIBRE', 'KP-TABLE-018', 'Salle principale', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(20, 19, 'Table 19', 6, 'LIBRE', 'KP-TABLE-019', 'Salle principale', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56'),
(21, 20, 'Table 20', 6, 'LIBRE', 'KP-TABLE-020', 'Salle principale', 1, '2026-06-07 08:56:56', '2026-06-07 08:56:56');

--
-- Déclencheurs `tables_restaurant`
--
DELIMITER $$
CREATE TRIGGER `trg_tables_restaurant_bi` BEFORE INSERT ON `tables_restaurant` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_tables_restaurant_bu` BEFORE UPDATE ON `tables_restaurant` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `table_assignments`
--

CREATE TABLE `table_assignments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `table_id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `assigned_by` bigint(20) UNSIGNED DEFAULT NULL,
  `started_at` datetime NOT NULL,
  `ended_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déclencheurs `table_assignments`
--
DELIMITER $$
CREATE TRIGGER `trg_table_assignments_bi` BEFORE INSERT ON `table_assignments` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.started_at = COALESCE(NEW.started_at, NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL DEFAULT '',
  `last_name` varchar(100) NOT NULL DEFAULT '',
  `avatar_url` varchar(255) DEFAULT NULL,
  `role` enum('client','serveur','cuisinier','admin') NOT NULL DEFAULT 'client',
  `password_hash` varchar(255) NOT NULL,
  `fcm_token` varchar(255) DEFAULT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `phone`, `first_name`, `last_name`, `avatar_url`, `role`, `password_hash`, `fcm_token`, `email_verified`, `is_active`, `last_login_at`, `created_at`, `updated_at`) VALUES
(1, 'rosealexiaabenaze@gmail.com', '697417842', 'Rose', 'Abena', NULL, 'admin', '$2b$10$.5FRQocaWABxkxVUIsp8weDyMU9QUr6AOUsbqwbY8GwPhsTAy8vp6', NULL, 0, 1, '2026-06-07 10:10:58', '2026-06-06 15:25:21', '2026-06-07 10:10:58'),
(2, 'azrapink18@gmail.com', '621636695', 'Florette', 'Flore', NULL, 'client', '$2b$10$x6kkNp6M6ZjERdaPGazdUuZX4co8fN5iwWENv1jtTg8TF/DwBxqRq', NULL, 0, 1, '2026-06-07 12:27:23', '2026-06-06 15:28:27', '2026-06-07 12:27:23'),
(3, 'mamoubaby@gmail.com', '655202159', 'Azra', 'Pink', NULL, 'serveur', '$2b$10$KWPr1bIZORMuFNw/RLTjn.EJV8Vd1EgMrD6FAEbEhXUPhTLIexAOC', NULL, 0, 1, '2026-06-07 12:16:10', '2026-06-06 15:31:55', '2026-06-07 12:16:10'),
(4, 'taks@gmail.com', '655234812', 'Krys', 'Taks', NULL, 'cuisinier', '$2b$10$goZx3NioN8ynkm0DjaAwHObHawZV7clcK5fjmAFd.oAaytbakTJg6', NULL, 0, 1, '2026-06-07 12:21:33', '2026-06-06 15:42:08', '2026-06-07 12:21:33'),
(5, 'h@gmail.com', '655894712', 'h', 'h', NULL, 'client', '$2b$10$hsG4ziQXcM4dl8SD62d1FutHx.idH2qbjcJ0kNregSMt/uNhWL20C', NULL, 0, 1, '2026-06-06 23:24:31', '2026-06-06 16:45:46', '2026-06-07 08:56:55'),
(6, 'k @gmzi.com', '655124763', 'k', 'p', NULL, 'serveur', '$2b$10$sEih4kQgOqNOAbKzyALOwu08RAV.AwjDPSp1u3bsf07iQK6l5O9MO', NULL, 0, 1, '2026-06-06 23:24:31', '2026-06-06 17:22:03', '2026-06-07 08:56:55'),
(7, 'a@gmail.com', '633584215', 'a', 'a', NULL, 'client', '$2b$10$K9fuv1q2WH3Hvuemnq9QYOsbMlaawynMNL17Uu5Cc5cuYU6l2GdKy', NULL, 0, 1, '2026-06-06 23:24:31', '2026-06-06 23:24:07', '2026-06-07 08:56:55');

--
-- Déclencheurs `users`
--
DELIMITER $$
CREATE TRIGGER `trg_users_bi` BEFORE INSERT ON `users` FOR EACH ROW BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `trg_users_bu` BEFORE UPDATE ON `users` FOR EACH ROW BEGIN
  SET NEW.updated_at = NOW();
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `v_commandes_actives`
--

CREATE TABLE `v_commandes_actives` (
  `id` bigint(20) UNSIGNED DEFAULT NULL,
  `order_number` varchar(50) DEFAULT NULL,
  `status` enum('RECUE','EN_PREPARATION','PRETE','EN_COURS_DE_SERVICE','SERVIE','CLOTUREE','ANNULEE') DEFAULT NULL,
  `payment_status` enum('EN_ATTENTE','PARTIEL','PAYE','REMBOURSE','ECHEC') DEFAULT NULL,
  `total_amount` decimal(12,2) DEFAULT NULL,
  `opened_at` datetime DEFAULT NULL,
  `table_number` int(10) UNSIGNED DEFAULT NULL,
  `area` varchar(100) DEFAULT NULL,
  `client_name` varchar(201) DEFAULT NULL,
  `waiter_name` varchar(201) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_plats_notes`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_plats_notes` (
`id` bigint(20) unsigned
,`name` varchar(191)
,`nb_avis` bigint(21)
,`note_moyenne` decimal(5,1)
,`nb_5_etoiles` decimal(23,0)
);

-- --------------------------------------------------------

--
-- Structure de la table `v_plats_nutrition`
--

CREATE TABLE `v_plats_nutrition` (
  `id` bigint(20) UNSIGNED DEFAULT NULL,
  `plat_name` varchar(191) DEFAULT NULL,
  `price` decimal(12,2) DEFAULT NULL,
  `nutri_score` enum('A','B','C','D','E') DEFAULT NULL,
  `categorie` varchar(191) DEFAULT NULL,
  `calories` int(10) UNSIGNED DEFAULT NULL,
  `proteins` decimal(8,2) DEFAULT NULL,
  `lipids` decimal(8,2) DEFAULT NULL,
  `glucids` decimal(8,2) DEFAULT NULL,
  `fibers` decimal(8,2) DEFAULT NULL,
  `salt_mg` decimal(10,2) DEFAULT NULL,
  `sugars` decimal(8,2) DEFAULT NULL,
  `glycemic_index` tinyint(3) UNSIGNED DEFAULT NULL,
  `serving_size_g` smallint(5) UNSIGNED DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `v_stocks_alerte`
--

CREATE TABLE `v_stocks_alerte` (
  `id` bigint(20) UNSIGNED DEFAULT NULL,
  `ingredient` varchar(191) DEFAULT NULL,
  `quantity` decimal(12,3) DEFAULT NULL,
  `alert_threshold` decimal(12,3) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `pct_restant` decimal(17,1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la vue `v_plats_notes`
--
DROP TABLE IF EXISTS `v_plats_notes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_plats_notes`  AS SELECT `p`.`id` AS `id`, `p`.`name` AS `name`, count(`a`.`id`) AS `nb_avis`, round(avg(`a`.`note`),1) AS `note_moyenne`, sum(`a`.`note` = 5) AS `nb_5_etoiles` FROM (`plats` `p` left join `avis` `a` on(`a`.`plat_id` = `p`.`id`)) GROUP BY `p`.`id`, `p`.`name` ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `allergies`
--
ALTER TABLE `allergies`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `avis`
--
ALTER TABLE `avis`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `customization_items`
--
ALTER TABLE `customization_items`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `fidelite`
--
ALTER TABLE `fidelite`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `nutrition_profiles`
--
ALTER TABLE `nutrition_profiles`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `patient_conditions`
--
ALTER TABLE `patient_conditions`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `payment_events`
--
ALTER TABLE `payment_events`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `plats`
--
ALTER TABLE `plats`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `plat_ingredients`
--
ALTER TABLE `plat_ingredients`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `plat_nutriments`
--
ALTER TABLE `plat_nutriments`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `recipe_items`
--
ALTER TABLE `recipe_items`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `review_votes`
--
ALTER TABLE `review_votes`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `tables_restaurant`
--
ALTER TABLE `tables_restaurant`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `table_assignments`
--
ALTER TABLE `table_assignments`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `allergies`
--
ALTER TABLE `allergies`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT pour la table `avis`
--
ALTER TABLE `avis`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT pour la table `commandes`
--
ALTER TABLE `commandes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `customization_items`
--
ALTER TABLE `customization_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `fidelite`
--
ALTER TABLE `fidelite`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `ingredients`
--
ALTER TABLE `ingredients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `nutrition_profiles`
--
ALTER TABLE `nutrition_profiles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `paiements`
--
ALTER TABLE `paiements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `patient_conditions`
--
ALTER TABLE `patient_conditions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `payment_events`
--
ALTER TABLE `payment_events`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `plats`
--
ALTER TABLE `plats`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `plat_ingredients`
--
ALTER TABLE `plat_ingredients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `plat_nutriments`
--
ALTER TABLE `plat_nutriments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `recipe_items`
--
ALTER TABLE `recipe_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `review_votes`
--
ALTER TABLE `review_votes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `stocks`
--
ALTER TABLE `stocks`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `tables_restaurant`
--
ALTER TABLE `tables_restaurant`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT pour la table `table_assignments`
--
ALTER TABLE `table_assignments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
