-- ============================================================
--  KITCHEN PULSE — Base de Données Finale
--  Compatible : MySQL 5.7 / 8.0 / MariaDB 10.4+
--  Charset    : utf8mb4 (support emoji + tous les caractères)
--  Groupe 7 — KEYCE Informatique Yaoundé
--
--  ⚠️  NOTE STATUTS : L'ENUM dans la table `commandes` utilise
--  les MAJUSCULES (RECUE, EN_PREPARATION…). Les controllers et
--  le frontend utilisent les minuscules. Deux options :
--    A) Modifier les ENUM ci-dessous en minuscules (recommandé)
--    B) Faire la conversion dans les controllers
--  La colonne est définie avec les minuscules dans ce fichier.
-- ============================================================

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- ============================================================
-- 0. CRÉATION / SÉLECTION DE LA BASE
-- ============================================================
CREATE DATABASE IF NOT EXISTS `kitchenpulse_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `kitchenpulse_db`;

-- ============================================================
-- 1. NETTOYAGE (ordre inverse des dépendances FK)
-- ============================================================
DROP TABLE IF EXISTS `recipe_items`;
DROP TABLE IF EXISTS `notification_readers`;
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `loyalty_transactions`;
DROP TABLE IF EXISTS `fidelite`;
DROP TABLE IF EXISTS `review_votes`;
DROP TABLE IF EXISTS `avis`;
DROP TABLE IF EXISTS `payment_events`;
DROP TABLE IF EXISTS `paiements`;
DROP TABLE IF EXISTS `customization_items`;
DROP TABLE IF EXISTS `order_items`;
DROP TABLE IF EXISTS `order_status_history`;
DROP TABLE IF EXISTS `commandes`;
DROP TABLE IF EXISTS `table_assignments`;
DROP TABLE IF EXISTS `tables_restaurant`;
DROP TABLE IF EXISTS `stock_movements`;
DROP TABLE IF EXISTS `stocks`;
DROP TABLE IF EXISTS `plat_ingredients`;
DROP TABLE IF EXISTS `plat_nutriments`;
DROP TABLE IF EXISTS `plat_allergens`;
DROP TABLE IF EXISTS `profile_allergies`;
DROP TABLE IF EXISTS `ingredient_allergens`;
DROP TABLE IF EXISTS `patient_conditions`;
DROP TABLE IF EXISTS `nutrition_profiles`;
DROP TABLE IF EXISTS `ingredients`;
DROP TABLE IF EXISTS `plats`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `allergies`;
DROP TABLE IF EXISTS `users`;

-- ============================================================
-- 2. USERS
-- ============================================================
CREATE TABLE `users` (
  `id`             BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `email`          VARCHAR(191)        DEFAULT NULL,
  `phone`          VARCHAR(30)         DEFAULT NULL,
  `first_name`     VARCHAR(100)        NOT NULL DEFAULT '',
  `last_name`      VARCHAR(100)        NOT NULL DEFAULT '',
  `avatar_url`     VARCHAR(255)        DEFAULT NULL,
  `role`           ENUM('client','serveur','cuisinier','admin') NOT NULL DEFAULT 'client',
  `password_hash`  VARCHAR(255)        NOT NULL,
  `fcm_token`      VARCHAR(255)        DEFAULT NULL,
  `email_verified` TINYINT(1)          NOT NULL DEFAULT 0,
  `is_active`      TINYINT(1)          NOT NULL DEFAULT 1,
  `last_login_at`  DATETIME            DEFAULT NULL,
  `created_at`     DATETIME            NOT NULL,
  `updated_at`     DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email`  (`email`),
  UNIQUE KEY `uq_users_phone`  (`phone`),
  KEY `idx_users_role`         (`role`),
  KEY `idx_users_active`       (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_users_bi`
BEFORE INSERT ON `users` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_users_bu`
BEFORE UPDATE ON `users` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 3. ALLERGIES (14 allergènes majeurs EU)
-- ============================================================
CREATE TABLE `allergies` (
  `id`    BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `code`  VARCHAR(50)         NOT NULL,
  `label` VARCHAR(100)        NOT NULL,
  `icon`  VARCHAR(50)         DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_allergies_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `allergies` (`code`, `label`, `icon`) VALUES
  ('GLUTEN',     'Céréales contenant du gluten',      '🌾'),
  ('CRUSTACES',  'Crustacés',                         '🦐'),
  ('OEUFS',      'Œufs',                              '🥚'),
  ('POISSON',    'Poisson',                           '🐟'),
  ('ARACHIDES',  'Arachides (cacahuètes)',             '🥜'),
  ('SOJA',       'Soja',                              '🫘'),
  ('LACTOSE',    'Lait et produits laitiers',         '🥛'),
  ('NOIX',       'Fruits à coque (noix, amandes...)', '🌰'),
  ('CELERI',     'Céleri',                            '🥬'),
  ('MOUTARDE',   'Moutarde',                          '🌿'),
  ('SESAME',     'Graines de sésame',                 '🌱'),
  ('SULFITES',   'Dioxyde de soufre et sulfites',     '🍷'),
  ('LUPIN',      'Lupin',                             '🌼'),
  ('MOLLUSQUES', 'Mollusques',                        '🦑');

-- ============================================================
-- 4. PROFILS NUTRITIONNELS
-- ============================================================
CREATE TABLE `nutrition_profiles` (
  `id`               BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`          BIGINT(20) UNSIGNED NOT NULL,
  `diabetes_type`    ENUM('aucun','type1','type2','gestationnel') NOT NULL DEFAULT 'aucun',
  `hypertension`     TINYINT(1) NOT NULL DEFAULT 0,
  `kidney_failure`   TINYINT(1) NOT NULL DEFAULT 0,
  `pregnancy`        TINYINT(1) NOT NULL DEFAULT 0,
  `pregnancy_weeks`  TINYINT(3) UNSIGNED DEFAULT NULL,
  `diet`             ENUM('omnivore','vegetarien','vegan','halal','casher','sans_porc') NOT NULL DEFAULT 'omnivore',
  `goal`             ENUM('maintien','perte_poids','prise_masse','performance','sante') NOT NULL DEFAULT 'maintien',
  `activity_level`   ENUM('sedentaire','leger','modere','intense','competition') NOT NULL DEFAULT 'sedentaire',
  `sport_type`       VARCHAR(100) DEFAULT NULL,
  `calories_target`  INT(10) UNSIGNED DEFAULT NULL,
  `proteins_target`  INT(10) UNSIGNED DEFAULT NULL,
  `lipids_target`    INT(10) UNSIGNED DEFAULT NULL,
  `glucids_target`   INT(10) UNSIGNED DEFAULT NULL,
  `notes`            TEXT DEFAULT NULL,
  `created_at`       DATETIME NOT NULL,
  `updated_at`       DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_nutrition_profiles_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_nutrition_profiles_bi`
BEFORE INSERT ON `nutrition_profiles` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_nutrition_profiles_bu`
BEFORE UPDATE ON `nutrition_profiles` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 5. PROFIL ↔ ALLERGIES
-- ============================================================
CREATE TABLE `profile_allergies` (
  `profile_id` BIGINT(20) UNSIGNED NOT NULL,
  `allergy_id` BIGINT(20) UNSIGNED NOT NULL,
  `severity`   ENUM('intolerance','allergie','allergie_severe') NOT NULL DEFAULT 'allergie',
  PRIMARY KEY (`profile_id`, `allergy_id`),
  KEY `fk_pa_allergy` (`allergy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. CONDITIONS MÉDICALES
-- ============================================================
CREATE TABLE `patient_conditions` (
  `id`             BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `profile_id`     BIGINT(20) UNSIGNED NOT NULL,
  `condition_type` VARCHAR(100)        NOT NULL,
  `severity`       ENUM('low','moderate','high','critical') NOT NULL DEFAULT 'moderate',
  `notes`          TEXT DEFAULT NULL,
  `created_at`     DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pc_profile` (`profile_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_patient_conditions_bi`
BEFORE INSERT ON `patient_conditions` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 7. CATÉGORIES
-- ============================================================
CREATE TABLE `categories` (
  `id`         BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(191)        NOT NULL,
  `slug`       VARCHAR(191)        NOT NULL,
  `icon`       VARCHAR(191)        NOT NULL DEFAULT '',
  `color_hex`  CHAR(7)             DEFAULT NULL,
  `sort_order` INT(11)             NOT NULL DEFAULT 0,
  `is_active`  TINYINT(1)          NOT NULL DEFAULT 1,
  `created_at` DATETIME            NOT NULL,
  `updated_at` DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_categories_name`       (`name`),
  UNIQUE KEY `uq_categories_slug`       (`slug`),
  KEY `idx_categories_active_order`     (`is_active`, `sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_categories_bi`
BEFORE INSERT ON `categories` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_categories_bu`
BEFORE UPDATE ON `categories` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$
DELIMITER ;

INSERT INTO `categories` (`name`, `slug`, `icon`, `color_hex`, `sort_order`, `is_active`) VALUES
  ('Entrées',                  'entrees',       '🥗', '#27AE60', 1, 1),
  ('Plats principaux',         'plats',         '🍽️', '#1B3A6B', 2, 1),
  ('Grillades',                'grillades',     '🔥', '#E67E22', 3, 1),
  ('Poissons & Fruits de mer', 'poissons',      '🐟', '#0E7C7B', 4, 1),
  ('Végétarien',               'vegetarien',    '🌱', '#1A7A4A', 5, 1),
  ('Desserts',                 'desserts',      '🍮', '#C0392B', 6, 1),
  ('Boissons',                 'boissons',      '🥤', '#8E44AD', 7, 1),
  ('Menus du jour',            'menus-du-jour', '📋', '#F39C12', 8, 1);

-- ============================================================
-- 8. INGRÉDIENTS
-- ============================================================
CREATE TABLE `ingredients` (
  `id`            BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`          VARCHAR(191)        NOT NULL,
  `unit`          VARCHAR(50)         NOT NULL,
  `calories_100g` DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
  `proteins_100g` DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
  `lipids_100g`   DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
  `glucids_100g`  DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
  `fibers_100g`   DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
  `salt_100g`     DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
  `sugars_100g`   DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
  `source`        VARCHAR(100)        DEFAULT NULL,
  `openfood_id`   VARCHAR(100)        DEFAULT NULL,
  `is_active`     TINYINT(1)          NOT NULL DEFAULT 1,
  `created_at`    DATETIME            NOT NULL,
  `updated_at`    DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_ingredients_name` (`name`),
  KEY `idx_ingredients_active`     (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_ingredients_bi`
BEFORE INSERT ON `ingredients` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_ingredients_bu`
BEFORE UPDATE ON `ingredients` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 9. INGRÉDIENT ↔ ALLERGÈNES
-- ============================================================
CREATE TABLE `ingredient_allergens` (
  `ingredient_id` BIGINT(20) UNSIGNED NOT NULL,
  `allergy_id`    BIGINT(20) UNSIGNED NOT NULL,
  PRIMARY KEY (`ingredient_id`, `allergy_id`),
  KEY `fk_ia_allergy` (`allergy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 10. PLATS
-- ============================================================
CREATE TABLE `plats` (
  `id`                BIGINT(20) UNSIGNED  NOT NULL AUTO_INCREMENT,
  `category_id`       BIGINT(20) UNSIGNED  NOT NULL,
  `name`              VARCHAR(191)         NOT NULL,
  `slug`              VARCHAR(191)         NOT NULL,
  `description`       TEXT                 NOT NULL,
  `price`             DECIMAL(12,2)        NOT NULL,
  `image_url`         VARCHAR(255)         DEFAULT NULL,
  `prep_time_minutes` SMALLINT(5) UNSIGNED DEFAULT NULL,
  `is_active`         TINYINT(1)           NOT NULL DEFAULT 1,
  `is_featured`       TINYINT(1)           NOT NULL DEFAULT 0,
  `nutri_score`       ENUM('A','B','C','D','E') DEFAULT NULL,
  `created_at`        DATETIME             NOT NULL,
  `updated_at`        DATETIME             NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_plats_slug`          (`slug`),
  KEY `idx_plats_category_active`     (`category_id`, `is_active`),
  KEY `idx_plats_featured`            (`is_featured`, `is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_plats_bi`
BEFORE INSERT ON `plats` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_plats_bu`
BEFORE UPDATE ON `plats` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 11. PLAT_NUTRIMENTS
-- ============================================================
CREATE TABLE `plat_nutriments` (
  `id`             BIGINT(20) UNSIGNED  NOT NULL AUTO_INCREMENT,
  `plat_id`        BIGINT(20) UNSIGNED  NOT NULL,
  `calories`       INT(10) UNSIGNED     NOT NULL DEFAULT 0,
  `proteins`       DECIMAL(8,2)         NOT NULL DEFAULT 0.00,
  `lipids`         DECIMAL(8,2)         NOT NULL DEFAULT 0.00,
  `glucids`        DECIMAL(8,2)         NOT NULL DEFAULT 0.00,
  `fibers`         DECIMAL(8,2)         NOT NULL DEFAULT 0.00,
  `salt_mg`        DECIMAL(10,2)        NOT NULL DEFAULT 0.00,
  `sugars`         DECIMAL(8,2)         NOT NULL DEFAULT 0.00,
  `saturated_fats` DECIMAL(8,2)         NOT NULL DEFAULT 0.00,
  `glycemic_index` TINYINT(3) UNSIGNED  DEFAULT NULL,
  `serving_size_g` SMALLINT(5) UNSIGNED DEFAULT NULL,
  `created_at`     DATETIME             NOT NULL,
  `updated_at`     DATETIME             NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_plat_nutriments_plat` (`plat_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_plat_nutriments_bi`
BEFORE INSERT ON `plat_nutriments` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_plat_nutriments_bu`
BEFORE UPDATE ON `plat_nutriments` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 12. PLAT_INGREDIENTS
-- ============================================================
CREATE TABLE `plat_ingredients` (
  `id`            BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `plat_id`       BIGINT(20) UNSIGNED NOT NULL,
  `ingredient_id` BIGINT(20) UNSIGNED NOT NULL,
  `quantity`      DECIMAL(10,2)       NOT NULL,
  `unit`          VARCHAR(50)         NOT NULL,
  `optional`      TINYINT(1)          NOT NULL DEFAULT 0,
  `removable`     TINYINT(1)          NOT NULL DEFAULT 1,
  `addable`       TINYINT(1)          NOT NULL DEFAULT 0,
  `sort_order`    INT(11)             NOT NULL DEFAULT 0,
  `created_at`    DATETIME            NOT NULL,
  `updated_at`    DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_plat_ingredient`  (`plat_id`, `ingredient_id`),
  KEY `idx_pi_plat`                (`plat_id`),
  KEY `idx_pi_ingredient`          (`ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_plat_ingredients_bi`
BEFORE INSERT ON `plat_ingredients` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_plat_ingredients_bu`
BEFORE UPDATE ON `plat_ingredients` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 13. PLAT_ALLERGENS
-- ============================================================
CREATE TABLE `plat_allergens` (
  `plat_id`    BIGINT(20) UNSIGNED NOT NULL,
  `allergy_id` BIGINT(20) UNSIGNED NOT NULL,
  PRIMARY KEY (`plat_id`, `allergy_id`),
  KEY `fk_plat_al_allergy` (`allergy_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 14. STOCKS
-- ============================================================
CREATE TABLE `stocks` (
  `id`              BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ingredient_id`   BIGINT(20) UNSIGNED NOT NULL,
  `quantity`        DECIMAL(12,3)       NOT NULL DEFAULT 0.000,
  `alert_threshold` DECIMAL(12,3)       NOT NULL DEFAULT 0.000,
  `unit`            VARCHAR(50)         NOT NULL,
  `location`        VARCHAR(100)        DEFAULT NULL,
  `last_counted_at` DATETIME            DEFAULT NULL,
  `updated_at`      DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_stocks_ingredient` (`ingredient_id`),
  KEY `idx_stocks_alert`            (`quantity`, `alert_threshold`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_stocks_bu`
BEFORE UPDATE ON `stocks` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 15. STOCK_MOVEMENTS
-- ============================================================
CREATE TABLE `stock_movements` (
  `id`             BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `ingredient_id`  BIGINT(20) UNSIGNED NOT NULL,
  `movement_type`  ENUM('IN','OUT','ADJUSTMENT','WASTE','INVENTORY') NOT NULL,
  `quantity`       DECIMAL(12,3)       NOT NULL,
  `unit_cost`      DECIMAL(12,2)       DEFAULT NULL,
  `reference_type` VARCHAR(50)         DEFAULT NULL,
  `reference_id`   BIGINT(20) UNSIGNED DEFAULT NULL,
  `note`           TEXT                DEFAULT NULL,
  `created_by`     BIGINT(20) UNSIGNED DEFAULT NULL,
  `created_at`     DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_sm_ingredient_date` (`ingredient_id`, `created_at`),
  KEY `idx_sm_type`            (`movement_type`),
  KEY `fk_sm_created_by`       (`created_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_stock_movements_bi`
BEFORE INSERT ON `stock_movements` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 16. TABLES DU RESTAURANT
-- ============================================================
CREATE TABLE `tables_restaurant` (
  `id`           BIGINT(20) UNSIGNED  NOT NULL AUTO_INCREMENT,
  `table_number` INT(10) UNSIGNED     NOT NULL,
  `label`        VARCHAR(50)          DEFAULT NULL,
  `capacity`     TINYINT(3) UNSIGNED  NOT NULL,
  `status`       ENUM('libre','reservee','occupee','en_service','addition_demandee','en_nettoyage') NOT NULL DEFAULT 'libre',
  `qr_code`      VARCHAR(255)         NOT NULL,
  `area`         VARCHAR(100)         DEFAULT NULL,
  `is_active`    TINYINT(1)           NOT NULL DEFAULT 1,
  `created_at`   DATETIME             NOT NULL,
  `updated_at`   DATETIME             NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tables_number` (`table_number`),
  UNIQUE KEY `uq_tables_qrcode` (`qr_code`),
  KEY `idx_tables_status`       (`status`),
  KEY `idx_tables_active`       (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_tables_restaurant_bi`
BEFORE INSERT ON `tables_restaurant` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_tables_restaurant_bu`
BEFORE UPDATE ON `tables_restaurant` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$
DELIMITER ;

-- Seed : 10 tables de démonstration
INSERT INTO `tables_restaurant` (`table_number`, `label`, `capacity`, `status`, `qr_code`, `area`, `is_active`) VALUES
  (1,  'Table Fenêtre 1', 4, 'libre', 'QR-T01', 'Salle principale', 1),
  (2,  'Table Fenêtre 2', 4, 'libre', 'QR-T02', 'Salle principale', 1),
  (3,  'Table Centre 1',  6, 'libre', 'QR-T03', 'Salle principale', 1),
  (4,  'Table Centre 2',  6, 'libre', 'QR-T04', 'Salle principale', 1),
  (5,  'Table Bar 1',     2, 'libre', 'QR-T05', 'Bar',              1),
  (6,  'Table Bar 2',     2, 'libre', 'QR-T06', 'Bar',              1),
  (7,  'Table Terrasse 1',4, 'libre', 'QR-T07', 'Terrasse',         1),
  (8,  'Table Terrasse 2',4, 'libre', 'QR-T08', 'Terrasse',         1),
  (9,  'Table VIP 1',     8, 'libre', 'QR-T09', 'Salon VIP',        1),
  (10, 'Table VIP 2',     8, 'libre', 'QR-T10', 'Salon VIP',        1);

-- ============================================================
-- 17. TABLE_ASSIGNMENTS
-- ============================================================
CREATE TABLE `table_assignments` (
  `id`          BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `table_id`    BIGINT(20) UNSIGNED NOT NULL,
  `user_id`     BIGINT(20) UNSIGNED DEFAULT NULL,
  `assigned_by` BIGINT(20) UNSIGNED DEFAULT NULL,
  `started_at`  DATETIME            NOT NULL,
  `ended_at`    DATETIME            DEFAULT NULL,
  `created_at`  DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ta_table`  (`table_id`, `started_at`),
  KEY `idx_ta_user`   (`user_id`),
  KEY `fk_ta_staff`   (`assigned_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_table_assignments_bi`
BEFORE INSERT ON `table_assignments` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.started_at = COALESCE(NEW.started_at, NOW());
END$$
DELIMITER ;

-- ============================================================
-- 18. COMMANDES
-- ============================================================
CREATE TABLE `commandes` (
  `id`                  BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `table_id`            BIGINT(20) UNSIGNED NOT NULL,
  `user_id`             BIGINT(20) UNSIGNED DEFAULT NULL,
  `waiter_id`           BIGINT(20) UNSIGNED DEFAULT NULL,
  `status`              ENUM('nouveau','en_preparation','pret','en_cours_de_service','livree','cloturee','annule') NOT NULL DEFAULT 'nouveau',
  `payment_status`      ENUM('en_attente','partiel','paye','rembourse','echec') NOT NULL DEFAULT 'en_attente',
  `order_number`        VARCHAR(50)         NOT NULL,
  `subtotal`            DECIMAL(12,2)       NOT NULL DEFAULT 0.00,
  `discount_amount`     DECIMAL(12,2)       NOT NULL DEFAULT 0.00,
  `tax_amount`          DECIMAL(12,2)       NOT NULL DEFAULT 0.00,
  `total_amount`        DECIMAL(12,2)       NOT NULL DEFAULT 0.00,
  `loyalty_points_used` INT(11)             NOT NULL DEFAULT 0,
  `notes`               TEXT                DEFAULT NULL,
  `opened_at`           DATETIME            NOT NULL,
  `closed_at`           DATETIME            DEFAULT NULL,
  `updated_at`          DATETIME            NOT NULL,
  `created_at`          DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_commandes_order_number`  (`order_number`),
  KEY `idx_commandes_table_status`        (`table_id`, `status`),
  KEY `idx_commandes_user`                (`user_id`),
  KEY `idx_commandes_status_date`         (`status`, `opened_at`),
  KEY `idx_commandes_payment_status`      (`payment_status`),
  KEY `fk_commandes_waiter`               (`waiter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_commandes_bi`
BEFORE INSERT ON `commandes` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
  IF NEW.opened_at IS NULL OR NEW.opened_at = '0000-00-00 00:00:00' THEN
    SET NEW.opened_at = NOW();
  END IF;
END$$

CREATE TRIGGER `trg_commandes_bu`
BEFORE UPDATE ON `commandes` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
  IF (NEW.status IN ('cloturee','annule')) AND OLD.status NOT IN ('cloturee','annule') THEN
    IF NEW.closed_at IS NULL THEN
      SET NEW.closed_at = NOW();
    END IF;
  END IF;
END$$

CREATE TRIGGER `trg_order_status_history`
AFTER UPDATE ON `commandes` FOR EACH ROW
BEGIN
  IF OLD.status <> NEW.status THEN
    INSERT INTO `order_status_history` (`commande_id`, `previous_status`, `new_status`)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
END$$
DELIMITER ;

-- ============================================================
-- 19. ORDER_STATUS_HISTORY
-- ============================================================
CREATE TABLE `order_status_history` (
  `id`              BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `commande_id`     BIGINT(20) UNSIGNED NOT NULL,
  `previous_status` VARCHAR(50)         DEFAULT NULL,
  `new_status`      VARCHAR(50)         NOT NULL,
  `changed_by`      BIGINT(20) UNSIGNED DEFAULT NULL,
  `reason`          VARCHAR(255)        DEFAULT NULL,
  `created_at`      DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_osh_order`  (`commande_id`, `created_at`),
  KEY `fk_osh_user`    (`changed_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_order_status_history_bi`
BEFORE INSERT ON `order_status_history` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 20. ORDER_ITEMS
-- ============================================================
CREATE TABLE `order_items` (
  `id`                 BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `commande_id`        BIGINT(20) UNSIGNED NOT NULL,
  `plat_id`            BIGINT(20) UNSIGNED NOT NULL,
  `quantity`           INT(10) UNSIGNED    NOT NULL DEFAULT 1,
  `unit_price`         DECIMAL(12,2)       NOT NULL,
  `item_total`         DECIMAL(12,2)       NOT NULL,
  `special_notes`      TEXT                DEFAULT NULL,
  `nutrition_snapshot` LONGTEXT            DEFAULT NULL,
  `item_status`        ENUM('en_attente','en_preparation','pret','servi','annule') NOT NULL DEFAULT 'en_attente',
  `created_at`         DATETIME            NOT NULL,
  `updated_at`         DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_oi_order`   (`commande_id`),
  KEY `idx_oi_plat`    (`plat_id`),
  KEY `idx_oi_status`  (`item_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_order_items_bi`
BEFORE INSERT ON `order_items` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_order_items_bu`
BEFORE UPDATE ON `order_items` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_commande_total_after_item_insert`
AFTER INSERT ON `order_items` FOR EACH ROW
BEGIN
  UPDATE `commandes`
  SET
    `subtotal`     = `subtotal`     + NEW.item_total,
    `total_amount` = `subtotal`     + NEW.item_total + `tax_amount` - `discount_amount`
  WHERE `id` = NEW.commande_id;
END$$

CREATE TRIGGER `trg_stock_after_order_item_insert`
AFTER INSERT ON `order_items` FOR EACH ROW
BEGIN
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
END$$
DELIMITER ;

-- ============================================================
-- 21. CUSTOMIZATION_ITEMS
-- ============================================================
CREATE TABLE `customization_items` (
  `id`                        BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_item_id`             BIGINT(20) UNSIGNED NOT NULL,
  `ingredient_id`             BIGINT(20) UNSIGNED NOT NULL,
  `action`                    ENUM('ADD','REMOVE','REPLACE') NOT NULL,
  `quantity`                  DECIMAL(10,2)       NOT NULL DEFAULT 0.00,
  `replacement_ingredient_id` BIGINT(20) UNSIGNED DEFAULT NULL,
  `created_at`                DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ci_order_item`  (`order_item_id`),
  KEY `fk_ci_ingredient`   (`ingredient_id`),
  KEY `fk_ci_replacement`  (`replacement_ingredient_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_customization_items_bi`
BEFORE INSERT ON `customization_items` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 22. PAIEMENTS
-- ============================================================
CREATE TABLE `paiements` (
  `id`          BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `commande_id` BIGINT(20) UNSIGNED NOT NULL,
  `method`      ENUM('MTN_MOMO','ORANGE_MONEY','CARTE_BANCAIRE','CAISSE','QR_LOCAL','SPLIT_BILL') NOT NULL,
  `amount`      DECIMAL(12,2)       NOT NULL,
  `currency`    CHAR(3)             NOT NULL DEFAULT 'XAF',
  `provider`    VARCHAR(50)         DEFAULT NULL,
  `reference`   VARCHAR(191)        NOT NULL,
  `status`      ENUM('PENDING','SUCCESS','FAILED','CANCELLED','REFUNDED') NOT NULL DEFAULT 'PENDING',
  `paid_at`     DATETIME            DEFAULT NULL,
  `created_at`  DATETIME            NOT NULL,
  `updated_at`  DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_paiements_reference`     (`reference`),
  KEY `idx_paiements_commande_status`     (`commande_id`, `status`),
  KEY `idx_paiements_method`              (`method`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_paiements_bi`
BEFORE INSERT ON `paiements` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_paiements_bu`
BEFORE UPDATE ON `paiements` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
  IF NEW.status = 'SUCCESS' AND OLD.status <> 'SUCCESS' THEN
    IF NEW.paid_at IS NULL THEN
      SET NEW.paid_at = NOW();
    END IF;
  END IF;
END$$
DELIMITER ;

-- ============================================================
-- 23. PAYMENT_EVENTS
-- ============================================================
CREATE TABLE `payment_events` (
  `id`          BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `paiement_id` BIGINT(20) UNSIGNED NOT NULL,
  `event_type`  VARCHAR(100)        NOT NULL,
  `payload`     LONGTEXT            DEFAULT NULL,
  `created_at`  DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_pe_payment_date` (`paiement_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_payment_events_bi`
BEFORE INSERT ON `payment_events` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 24. FIDÉLITÉ
-- ============================================================
CREATE TABLE `fidelite` (
  `id`         BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`    BIGINT(20) UNSIGNED NOT NULL,
  `points`     INT(11)             NOT NULL DEFAULT 0,
  `level`      ENUM('BRONZE','ARGENT','OR','PLATINE') NOT NULL DEFAULT 'BRONZE',
  `expires_at` DATETIME            DEFAULT NULL,
  `updated_at` DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_fidelite_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_fidelite_bu`
BEFORE UPDATE ON `fidelite` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_fidelite_level_update`
BEFORE UPDATE ON `fidelite` FOR EACH ROW
BEGIN
  SET NEW.level = CASE
    WHEN NEW.points >= 5000 THEN 'PLATINE'
    WHEN NEW.points >= 2000 THEN 'OR'
    WHEN NEW.points >= 500  THEN 'ARGENT'
    ELSE 'BRONZE'
  END;
END$$
DELIMITER ;

-- ============================================================
-- 25. LOYALTY_TRANSACTIONS
-- ============================================================
CREATE TABLE `loyalty_transactions` (
  `id`             BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`        BIGINT(20) UNSIGNED NOT NULL,
  `points_delta`   INT(11)             NOT NULL,
  `reason`         VARCHAR(255)        NOT NULL,
  `reference_type` VARCHAR(50)         DEFAULT NULL,
  `reference_id`   BIGINT(20) UNSIGNED DEFAULT NULL,
  `created_at`     DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_lt_user_date` (`user_id`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_loyalty_transactions_bi`
BEFORE INSERT ON `loyalty_transactions` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 26. AVIS & VOTES
-- ============================================================
CREATE TABLE `avis` (
  `id`                   BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id`              BIGINT(20) UNSIGNED NOT NULL,
  `plat_id`              BIGINT(20) UNSIGNED NOT NULL,
  `note`                 TINYINT(3) UNSIGNED NOT NULL,
  `commentaire`          TEXT                DEFAULT NULL,
  `is_verified_purchase` TINYINT(1)          NOT NULL DEFAULT 0,
  `created_at`           DATETIME            NOT NULL,
  `updated_at`           DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_avis_user_plat` (`user_id`, `plat_id`),
  KEY `idx_avis_plat`            (`plat_id`),
  KEY `idx_avis_note`            (`note`),
  CONSTRAINT `chk_avis_note` CHECK (`note` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_avis_bi`
BEFORE INSERT ON `avis` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_avis_bu`
BEFORE UPDATE ON `avis` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$
DELIMITER ;

CREATE TABLE `review_votes` (
  `id`         BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `avis_id`    BIGINT(20) UNSIGNED NOT NULL,
  `user_id`    BIGINT(20) UNSIGNED NOT NULL,
  `vote`       ENUM('UP','DOWN')   NOT NULL,
  `created_at` DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_review_votes` (`avis_id`, `user_id`),
  KEY `fk_rv_user`             (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_review_votes_bi`
BEFORE INSERT ON `review_votes` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 27. NOTIFICATIONS
-- ============================================================
CREATE TABLE `notifications` (
  `id`           BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
  `recipient_id` BIGINT(20) UNSIGNED NOT NULL,
  `type`         VARCHAR(100)        NOT NULL,
  `title`        VARCHAR(191)        DEFAULT NULL,
  `body`         TEXT                DEFAULT NULL,
  `payload`      LONGTEXT            NOT NULL,
  `is_read`      TINYINT(1)          NOT NULL DEFAULT 0,
  `push_sent`    TINYINT(1)          NOT NULL DEFAULT 0,
  `push_sent_at` DATETIME            DEFAULT NULL,
  `created_at`   DATETIME            NOT NULL,
  `updated_at`   DATETIME            NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_notif_recipient_read` (`recipient_id`, `is_read`, `created_at`),
  KEY `idx_notif_type`           (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_notifications_bi`
BEFORE INSERT ON `notifications` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_notifications_bu`
BEFORE UPDATE ON `notifications` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$
DELIMITER ;

CREATE TABLE `notification_readers` (
  `notification_id` BIGINT(20) UNSIGNED NOT NULL,
  `user_id`         BIGINT(20) UNSIGNED NOT NULL,
  `read_at`         DATETIME            NOT NULL,
  PRIMARY KEY (`notification_id`, `user_id`),
  KEY `fk_nr_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 28. RECIPE_ITEMS
-- ============================================================
CREATE TABLE `recipe_items` (
  `id`               BIGINT(20) UNSIGNED  NOT NULL AUTO_INCREMENT,
  `plat_id`          BIGINT(20) UNSIGNED  NOT NULL,
  `step_number`      TINYINT(3) UNSIGNED  NOT NULL,
  `instruction`      TEXT                 NOT NULL,
  `duration_seconds` INT(10) UNSIGNED     DEFAULT NULL,
  `image_url`        VARCHAR(255)         DEFAULT NULL,
  `created_at`       DATETIME             NOT NULL,
  `updated_at`       DATETIME             NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_recipe_step` (`plat_id`, `step_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$
CREATE TRIGGER `trg_recipe_items_bi`
BEFORE INSERT ON `recipe_items` FOR EACH ROW
BEGIN
  SET NEW.created_at = NOW();
  SET NEW.updated_at = NOW();
END$$

CREATE TRIGGER `trg_recipe_items_bu`
BEFORE UPDATE ON `recipe_items` FOR EACH ROW
BEGIN
  SET NEW.updated_at = NOW();
END$$
DELIMITER ;

-- ============================================================
-- 29. CLÉS ÉTRANGÈRES (après toutes les tables)
-- ============================================================
ALTER TABLE `nutrition_profiles`
  ADD CONSTRAINT `fk_np_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `profile_allergies`
  ADD CONSTRAINT `fk_pa_profile`
    FOREIGN KEY (`profile_id`) REFERENCES `nutrition_profiles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pa_allergy`
    FOREIGN KEY (`allergy_id`) REFERENCES `allergies` (`id`);

ALTER TABLE `patient_conditions`
  ADD CONSTRAINT `fk_pc_profile`
    FOREIGN KEY (`profile_id`) REFERENCES `nutrition_profiles` (`id`) ON DELETE CASCADE;

ALTER TABLE `ingredient_allergens`
  ADD CONSTRAINT `fk_ia_ingredient`
    FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ia_allergy`
    FOREIGN KEY (`allergy_id`) REFERENCES `allergies` (`id`);

ALTER TABLE `plats`
  ADD CONSTRAINT `fk_plats_category`
    FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

ALTER TABLE `plat_nutriments`
  ADD CONSTRAINT `fk_pn_plat`
    FOREIGN KEY (`plat_id`) REFERENCES `plats` (`id`) ON DELETE CASCADE;

ALTER TABLE `plat_ingredients`
  ADD CONSTRAINT `fk_pi_plat`
    FOREIGN KEY (`plat_id`) REFERENCES `plats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_pi_ingredient`
    FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`);

ALTER TABLE `plat_allergens`
  ADD CONSTRAINT `fk_plat_al_plat`
    FOREIGN KEY (`plat_id`) REFERENCES `plats` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_plat_al_allergy`
    FOREIGN KEY (`allergy_id`) REFERENCES `allergies` (`id`);

ALTER TABLE `stocks`
  ADD CONSTRAINT `fk_stocks_ingredient`
    FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`) ON DELETE CASCADE;

ALTER TABLE `stock_movements`
  ADD CONSTRAINT `fk_sm_ingredient`
    FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`),
  ADD CONSTRAINT `fk_sm_created_by`
    FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `table_assignments`
  ADD CONSTRAINT `fk_ta_table`
    FOREIGN KEY (`table_id`) REFERENCES `tables_restaurant` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ta_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_ta_staff`
    FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `commandes`
  ADD CONSTRAINT `fk_commandes_table`
    FOREIGN KEY (`table_id`) REFERENCES `tables_restaurant` (`id`),
  ADD CONSTRAINT `fk_commandes_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_commandes_waiter`
    FOREIGN KEY (`waiter_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `order_status_history`
  ADD CONSTRAINT `fk_osh_order`
    FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_osh_user`
    FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_oi_order`
    FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_oi_plat`
    FOREIGN KEY (`plat_id`) REFERENCES `plats` (`id`);

ALTER TABLE `customization_items`
  ADD CONSTRAINT `fk_ci_order_item`
    FOREIGN KEY (`order_item_id`) REFERENCES `order_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ci_ingredient`
    FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients` (`id`),
  ADD CONSTRAINT `fk_ci_replacement`
    FOREIGN KEY (`replacement_ingredient_id`) REFERENCES `ingredients` (`id`);

ALTER TABLE `paiements`
  ADD CONSTRAINT `fk_paiements_commande`
    FOREIGN KEY (`commande_id`) REFERENCES `commandes` (`id`) ON DELETE CASCADE;

ALTER TABLE `payment_events`
  ADD CONSTRAINT `fk_pe_payment`
    FOREIGN KEY (`paiement_id`) REFERENCES `paiements` (`id`) ON DELETE CASCADE;

ALTER TABLE `fidelite`
  ADD CONSTRAINT `fk_fidelite_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `loyalty_transactions`
  ADD CONSTRAINT `fk_lt_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `avis`
  ADD CONSTRAINT `fk_avis_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `fk_avis_plat`
    FOREIGN KEY (`plat_id`) REFERENCES `plats` (`id`) ON DELETE CASCADE;

ALTER TABLE `review_votes`
  ADD CONSTRAINT `fk_rv_review`
    FOREIGN KEY (`avis_id`) REFERENCES `avis` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rv_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_recipient`
    FOREIGN KEY (`recipient_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `notification_readers`
  ADD CONSTRAINT `fk_nr_notification`
    FOREIGN KEY (`notification_id`) REFERENCES `notifications` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_nr_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

ALTER TABLE `recipe_items`
  ADD CONSTRAINT `fk_ri_plat`
    FOREIGN KEY (`plat_id`) REFERENCES `plats` (`id`) ON DELETE CASCADE;

-- ============================================================
-- 30. VUES (sans DEFINER — portables)
-- ============================================================
DROP VIEW IF EXISTS `v_plats_nutrition`;
CREATE VIEW `v_plats_nutrition` AS
SELECT p.`id`, p.`name` AS `plat_name`, p.`price`, p.`nutri_score`,
       c.`name` AS `categorie`,
       pn.`calories`, pn.`proteins`, pn.`lipids`, pn.`glucids`,
       pn.`fibers`, pn.`salt_mg`, pn.`sugars`, pn.`glycemic_index`, pn.`serving_size_g`
FROM `plats` p
JOIN `categories` c         ON c.`id`      = p.`category_id`
LEFT JOIN `plat_nutriments` pn ON pn.`plat_id` = p.`id`
WHERE p.`is_active` = 1;

DROP VIEW IF EXISTS `v_commandes_actives`;
CREATE VIEW `v_commandes_actives` AS
SELECT co.`id`, co.`order_number`, co.`status`, co.`payment_status`,
       co.`total_amount`, co.`opened_at`,
       t.`table_number`, t.`area`,
       CONCAT(u.`first_name`, ' ', u.`last_name`) AS `client_name`,
       CONCAT(w.`first_name`, ' ', w.`last_name`) AS `waiter_name`
FROM `commandes` co
JOIN `tables_restaurant` t ON t.`id` = co.`table_id`
LEFT JOIN `users` u        ON u.`id` = co.`user_id`
LEFT JOIN `users` w        ON w.`id` = co.`waiter_id`
WHERE co.`status` NOT IN ('cloturee', 'annule');

DROP VIEW IF EXISTS `v_stocks_alerte`;
CREATE VIEW `v_stocks_alerte` AS
SELECT s.`id`, i.`name` AS `ingredient`,
       s.`quantity`, s.`alert_threshold`, s.`unit`, s.`location`,
       ROUND((s.`quantity` / NULLIF(s.`alert_threshold`, 0)) * 100, 1) AS `pct_restant`
FROM `stocks` s
JOIN `ingredients` i ON i.`id` = s.`ingredient_id`
WHERE s.`quantity` <= s.`alert_threshold`
ORDER BY `pct_restant` ASC;

DROP VIEW IF EXISTS `v_plats_notes`;
CREATE VIEW `v_plats_notes` AS
SELECT p.`id`, p.`name`,
       COUNT(a.`id`)                                   AS `nb_avis`,
       ROUND(AVG(a.`note`), 2)                         AS `note_moyenne`,
       SUM(CASE WHEN a.`note` = 5 THEN 1 ELSE 0 END)  AS `nb_5_etoiles`
FROM `plats` p
LEFT JOIN `avis` a ON a.`plat_id` = p.`id`
GROUP BY p.`id`, p.`name`;

-- ============================================================
-- 31. RESTAURATION PARAMÈTRES SYSTÈME
-- ============================================================
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- ============================================================
-- FIN — KitchenPulse DB v10-final — Groupe 7 KEYCE Yaoundé
-- ============================================================