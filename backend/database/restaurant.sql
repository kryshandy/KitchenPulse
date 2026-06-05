-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 04 juin 2026 à 19:34
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
-- Base de données : `restaurant`
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
  `status` enum('LIBRE','RESERVEE','OCCUPEE','EN_SERVICE','ADDITION_DEMANDEE','EN_NETTOYAGE') NOT NULL DEFAULT 'LIBRE',
  `qr_code` varchar(255) NOT NULL,
  `area` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `role` enum('CLIENT','SERVEUR','CUISINIER','ADMIN') NOT NULL DEFAULT 'CLIENT',
  `password_hash` varchar(255) NOT NULL,
  `fcm_token` varchar(255) DEFAULT NULL,
  `email_verified` tinyint(1) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Doublure de structure pour la vue `v_commandes_actives`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_commandes_actives` (
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_plats_notes`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_plats_notes` (
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_plats_nutrition`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_plats_nutrition` (
);

-- --------------------------------------------------------

--
-- Doublure de structure pour la vue `v_stocks_alerte`
-- (Voir ci-dessous la vue réelle)
--
CREATE TABLE `v_stocks_alerte` (
);

-- --------------------------------------------------------

--
-- Structure de la vue `v_commandes_actives`
--
DROP TABLE IF EXISTS `v_commandes_actives`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_commandes_actives`  AS SELECT `co`.`id` AS `id`, `co`.`order_number` AS `order_number`, `co`.`status` AS `status`, `co`.`payment_status` AS `payment_status`, `co`.`total_amount` AS `total_amount`, `co`.`opened_at` AS `opened_at`, `t`.`table_number` AS `table_number`, `t`.`area` AS `area`, concat(`u`.`first_name`,' ',`u`.`last_name`) AS `client_name`, concat(`w`.`first_name`,' ',`w`.`last_name`) AS `waiter_name` FROM (((`kitchenpulse_db`.`commandes` `co` join `kitchenpulse_db`.`tables_restaurant` `t` on(`t`.`id` = `co`.`table_id`)) left join `kitchenpulse_db`.`users` `u` on(`u`.`id` = `co`.`user_id`)) left join `kitchenpulse_db`.`users` `w` on(`w`.`id` = `co`.`waiter_id`)) WHERE `co`.`status` not in ('CLOTUREE','ANNULEE') ;

-- --------------------------------------------------------

--
-- Structure de la vue `v_plats_notes`
--
DROP TABLE IF EXISTS `v_plats_notes`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_plats_notes`  AS SELECT `p`.`id` AS `id`, `p`.`name` AS `name`, count(`a`.`id`) AS `nb_avis`, round(avg(`a`.`note`),2) AS `note_moyenne`, sum(case when `a`.`note` = 5 then 1 else 0 end) AS `nb_5_etoiles` FROM (`kitchenpulse_db`.`plats` `p` left join `kitchenpulse_db`.`avis` `a` on(`a`.`plat_id` = `p`.`id`)) GROUP BY `p`.`id`, `p`.`name` ;

-- --------------------------------------------------------

--
-- Structure de la vue `v_plats_nutrition`
--
DROP TABLE IF EXISTS `v_plats_nutrition`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_plats_nutrition`  AS SELECT `p`.`id` AS `id`, `p`.`name` AS `plat_name`, `p`.`price` AS `price`, `p`.`nutri_score` AS `nutri_score`, `c`.`name` AS `categorie`, `pn`.`calories` AS `calories`, `pn`.`proteins` AS `proteins`, `pn`.`lipids` AS `lipids`, `pn`.`glucids` AS `glucids`, `pn`.`fibers` AS `fibers`, `pn`.`salt_mg` AS `salt_mg`, `pn`.`sugars` AS `sugars`, `pn`.`glycemic_index` AS `glycemic_index`, `pn`.`serving_size_g` AS `serving_size_g` FROM ((`kitchenpulse_db`.`plats` `p` join `kitchenpulse_db`.`categories` `c` on(`c`.`id` = `p`.`category_id`)) left join `kitchenpulse_db`.`plat_nutriments` `pn` on(`pn`.`plat_id` = `p`.`id`)) WHERE `p`.`is_active` = 1 ;

-- --------------------------------------------------------

--
-- Structure de la vue `v_stocks_alerte`
--
DROP TABLE IF EXISTS `v_stocks_alerte`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_stocks_alerte`  AS SELECT `s`.`id` AS `id`, `i`.`name` AS `ingredient`, `s`.`quantity` AS `quantity`, `s`.`alert_threshold` AS `alert_threshold`, `s`.`unit` AS `unit`, `s`.`location` AS `location`, round(`s`.`quantity` / nullif(`s`.`alert_threshold`,0) * 100,1) AS `pct_restant` FROM (`kitchenpulse_db`.`stocks` `s` join `kitchenpulse_db`.`ingredients` `i` on(`i`.`id` = `s`.`ingredient_id`)) WHERE `s`.`quantity` <= `s`.`alert_threshold` ORDER BY round(`s`.`quantity` / nullif(`s`.`alert_threshold`,0) * 100,1) ASC ;

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `allergies`
--
ALTER TABLE `allergies`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_allergies_code` (`code`);

--
-- Index pour la table `avis`
--
ALTER TABLE `avis`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_avis_user_plat` (`user_id`,`plat_id`),
  ADD KEY `idx_avis_plat` (`plat_id`),
  ADD KEY `idx_avis_note` (`note`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_categories_name` (`name`),
  ADD UNIQUE KEY `uq_categories_slug` (`slug`),
  ADD KEY `idx_categories_active_order` (`is_active`,`sort_order`);

--
-- Index pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_commandes_order_number` (`order_number`),
  ADD KEY `idx_commandes_table_status` (`table_id`,`status`),
  ADD KEY `idx_commandes_user` (`user_id`),
  ADD KEY `idx_commandes_status_date` (`status`,`opened_at`),
  ADD KEY `idx_commandes_payment_status` (`payment_status`),
  ADD KEY `fk_commandes_waiter` (`waiter_id`);

--
-- Index pour la table `customization_items`
--
ALTER TABLE `customization_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ci_order_item` (`order_item_id`),
  ADD KEY `fk_ci_ingredient` (`ingredient_id`),
  ADD KEY `fk_ci_replacement` (`replacement_ingredient_id`);

--
-- Index pour la table `fidelite`
--
ALTER TABLE `fidelite`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_fidelite_user` (`user_id`);

--
-- Index pour la table `ingredients`
--
ALTER TABLE `ingredients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_ingredients_name` (`name`),
  ADD KEY `idx_ingredients_active` (`is_active`);

--
-- Index pour la table `ingredient_allergens`
--
ALTER TABLE `ingredient_allergens`
  ADD PRIMARY KEY (`ingredient_id`,`allergy_id`),
  ADD KEY `fk_ia_allergy` (`allergy_id`);

--
-- Index pour la table `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_lt_user_date` (`user_id`,`created_at`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_notif_recipient_read` (`recipient_id`,`is_read`,`created_at`),
  ADD KEY `idx_notif_type` (`type`);

--
-- Index pour la table `notification_readers`
--
ALTER TABLE `notification_readers`
  ADD PRIMARY KEY (`notification_id`,`user_id`),
  ADD KEY `fk_nr_user` (`user_id`);

--
-- Index pour la table `nutrition_profiles`
--
ALTER TABLE `nutrition_profiles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_nutrition_profiles_user` (`user_id`);

--
-- Index pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_oi_order` (`commande_id`),
  ADD KEY `idx_oi_plat` (`plat_id`),
  ADD KEY `idx_oi_status` (`item_status`);

--
-- Index pour la table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_osh_order` (`commande_id`,`created_at`),
  ADD KEY `fk_osh_user` (`changed_by`);

--
-- Index pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_paiements_reference` (`reference`),
  ADD KEY `idx_paiements_commande_status` (`commande_id`,`status`),
  ADD KEY `idx_paiements_method` (`method`);

--
-- Index pour la table `patient_conditions`
--
ALTER TABLE `patient_conditions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pc_profile` (`profile_id`);

--
-- Index pour la table `payment_events`
--
ALTER TABLE `payment_events`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_pe_payment_date` (`paiement_id`,`created_at`);

--
-- Index pour la table `plats`
--
ALTER TABLE `plats`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_plats_slug` (`slug`),
  ADD KEY `idx_plats_category_active` (`category_id`,`is_active`),
  ADD KEY `idx_plats_featured` (`is_featured`,`is_active`);

--
-- Index pour la table `plat_allergens`
--
ALTER TABLE `plat_allergens`
  ADD PRIMARY KEY (`plat_id`,`allergy_id`),
  ADD KEY `fk_plat_al_allergy` (`allergy_id`);

--
-- Index pour la table `plat_ingredients`
--
ALTER TABLE `plat_ingredients`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_plat_ingredient` (`plat_id`,`ingredient_id`),
  ADD KEY `idx_pi_plat` (`plat_id`),
  ADD KEY `idx_pi_ingredient` (`ingredient_id`);

--
-- Index pour la table `plat_nutriments`
--
ALTER TABLE `plat_nutriments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_plat_nutriments_plat` (`plat_id`);

--
-- Index pour la table `profile_allergies`
--
ALTER TABLE `profile_allergies`
  ADD PRIMARY KEY (`profile_id`,`allergy_id`),
  ADD KEY `fk_pa_allergy` (`allergy_id`);

--
-- Index pour la table `recipe_items`
--
ALTER TABLE `recipe_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_recipe_step` (`plat_id`,`step_number`);

--
-- Index pour la table `review_votes`
--
ALTER TABLE `review_votes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_review_votes` (`avis_id`,`user_id`),
  ADD KEY `fk_rv_user` (`user_id`);

--
-- Index pour la table `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_stocks_ingredient` (`ingredient_id`),
  ADD KEY `idx_stocks_alert` (`quantity`,`alert_threshold`);

--
-- Index pour la table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_sm_ingredient_date` (`ingredient_id`,`created_at`),
  ADD KEY `idx_sm_type` (`movement_type`),
  ADD KEY `fk_sm_created_by` (`created_by`);

--
-- Index pour la table `tables_restaurant`
--
ALTER TABLE `tables_restaurant`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_tables_number` (`table_number`),
  ADD UNIQUE KEY `uq_tables_qrcode` (`qr_code`),
  ADD KEY `idx_tables_status` (`status`),
  ADD KEY `idx_tables_active` (`is_active`);

--
-- Index pour la table `table_assignments`
--
ALTER TABLE `table_assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ta_table` (`table_id`,`started_at`),
  ADD KEY `idx_ta_user` (`user_id`),
  ADD KEY `fk_ta_staff` (`assigned_by`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_users_email` (`email`),
  ADD UNIQUE KEY `uq_users_phone` (`phone`),
  ADD KEY `idx_users_role` (`role`),
  ADD KEY `idx_users_active` (`is_active`);

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `order_status_history`
--
ALTER TABLE `order_status_history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `plat_ingredients`
--
ALTER TABLE `plat_ingredients`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `plat_nutriments`
--
ALTER TABLE `plat_nutriments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

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
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `table_assignments`
--
ALTER TABLE `table_assignments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `avis`
--
ALTER TABLE `avis`
  ADD CONSTRAINT `fk_avis_plat` FOREIGN KEY (`plat_id`) REFERENCES `plats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_avis_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Contraintes pour la table `commandes`
--
ALTER TABLE `commandes`
  ADD CONSTRAINT `fk_commandes_table` FOREIGN KEY (`table_id`) REFERENCES `tables_restaurant` (`id`),
  ADD CONSTRAINT `fk_commandes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_commandes_waiter` FOREIGN KEY (`waiter_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `customization_items`
--
ALTER TABLE `customization_items`
  ADD CONSTRAINT `fk_ci_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`),
  ADD CONSTRAINT `fk_ci_order_item` FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ci_replacement` FOREIGN KEY (`replacement_ingredient_id`) REFERENCES `ingredients` (`id`);

--
-- Contraintes pour la table `fidelite`
--
ALTER TABLE `fidelite`
  ADD CONSTRAINT `fk_fidelite_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `ingredient_allergens`
--
ALTER TABLE `ingredient_allergens`
  ADD CONSTRAINT `fk_ia_allergy` FOREIGN KEY (`allergy_id`) REFERENCES `allergies` (`id`),
  ADD CONSTRAINT `fk_ia_ingredient` FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  ADD CONSTRAINT `fk_lt_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_recipient` FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `notification_readers`
--
ALTER TABLE `notification_readers`
  ADD CONSTRAINT `fk_nr_notification` FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_nr_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `nutrition_profiles`
--
ALTER TABLE `nutrition_profiles`
  ADD CONSTRAINT `fk_np_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_oi_order` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_oi_plat` FOREIGN KEY (`plat_id`) REFERENCES `plats` (`id`);

--
-- Contraintes pour la table `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `fk_osh_order` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_osh_user` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Contraintes pour la table `paiements`
--
ALTER TABLE `paiements`
  ADD CONSTRAINT `fk_paiements_commande` FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE;

--
-- Contraintes pour la table `patient_conditions`
--
ALTER TABLE `patient_conditions`
  ADD CONSTRAINT `fk_pc_profile` FOREIGN KEY (`profile_id`) REFERENCES `nutrition_profiles` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
