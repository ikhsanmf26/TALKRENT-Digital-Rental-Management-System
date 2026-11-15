/**
 * TALKRENT MySQL / MariaDB Database Dump Generator (talkrent_db.sql)
 * Generates complete DDL with 15 tables, foreign keys, indexes, and initial seed data.
 */

export function generateMySQLDump(): string {
  return `-- ==============================================================
-- DATABASE: talkrent_db
-- SYSTEM: TALKRENT Digital Rental Management System
-- BRAND: TALKRENT - Your Communication Partner
-- LOCATION: Kabupaten Tasikmalaya, Jawa Barat, Indonesia
-- TARGET: MySQL 8.0+ / MariaDB 10.4+ (XAMPP Compatible)
-- GENERATED: ${new Date().toISOString()}
-- ==============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+07:00";

CREATE DATABASE IF NOT EXISTS \`talkrent_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`talkrent_db\`;

-- --------------------------------------------------------
-- 1. Table structure for table \`users\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`username\` VARCHAR(50) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`full_name\` VARCHAR(100) NOT NULL,
  \`email\` VARCHAR(100) NOT NULL,
  \`role\` ENUM('admin') NOT NULL DEFAULT 'admin',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`last_login_at\` DATETIME DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_users_username\` (\`username\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Table structure for table \`customers\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`customers\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`customer_code\` VARCHAR(20) NOT NULL UNIQUE,
  \`name\` VARCHAR(120) NOT NULL,
  \`whatsapp\` VARCHAR(25) NOT NULL,
  \`email\` VARCHAR(100) DEFAULT NULL,
  \`organization\` VARCHAR(150) DEFAULT NULL,
  \`address\` TEXT DEFAULT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_customers_code\` (\`customer_code\`),
  INDEX \`idx_customers_whatsapp\` (\`whatsapp\`),
  INDEX \`idx_customers_name\` (\`name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Table structure for table \`equipment_models\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`equipment_models\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`brand\` VARCHAR(50) NOT NULL DEFAULT 'WLN',
  \`model_name\` VARCHAR(100) NOT NULL,
  \`frequency_range\` VARCHAR(60) NOT NULL,
  \`channel_count\` INT UNSIGNED NOT NULL DEFAULT 16,
  \`power_output\` VARCHAR(30) NOT NULL,
  \`battery_type\` VARCHAR(60) NOT NULL,
  \`daily_rate\` DECIMAL(12,2) NOT NULL DEFAULT 25000.00,
  \`description\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_models_brand_model\` (\`brand\`, \`model_name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Table structure for table \`equipment_units\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`equipment_units\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`model_id\` INT UNSIGNED NOT NULL,
  \`unit_code\` VARCHAR(30) NOT NULL UNIQUE,
  \`serial_number\` VARCHAR(80) NOT NULL UNIQUE,
  \`physical_condition\` VARCHAR(100) NOT NULL DEFAULT 'Sangat Baik',
  \`battery_health\` TINYINT UNSIGNED NOT NULL DEFAULT 100,
  \`purchase_date\` DATE NOT NULL,
  \`purchase_price\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`status\` ENUM('Tersedia', 'Dipesan', 'Disewa', 'Perawatan', 'Hilang', 'Tidak Aktif') NOT NULL DEFAULT 'Tersedia',
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_units_code\` (\`unit_code\`),
  INDEX \`idx_units_status\` (\`status\`),
  INDEX \`idx_units_model\` (\`model_id\`),
  CONSTRAINT \`fk_units_model\` FOREIGN KEY (\`model_id\`) REFERENCES \`equipment_models\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Table structure for table \`bookings\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`bookings\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`booking_code\` VARCHAR(30) NOT NULL UNIQUE,
  \`customer_id\` INT UNSIGNED NOT NULL,
  \`event_name\` VARCHAR(150) NOT NULL,
  \`event_location\` VARCHAR(200) NOT NULL,
  \`start_date\` DATE NOT NULL,
  \`end_date\` DATE NOT NULL,
  \`total_days\` INT UNSIGNED NOT NULL DEFAULT 1,
  \`requested_quantity\` INT UNSIGNED NOT NULL DEFAULT 1,
  \`rate_per_day\` DECIMAL(12,2) NOT NULL DEFAULT 25000.00,
  \`estimated_cost\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`down_payment\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`status\` ENUM('Menunggu', 'Dikonfirmasi', 'Menjadi Penyewaan', 'Dibatalkan') NOT NULL DEFAULT 'Menunggu',
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_bookings_code\` (\`booking_code\`),
  INDEX \`idx_bookings_customer\` (\`customer_id\`),
  INDEX \`idx_bookings_dates\` (\`start_date\`, \`end_date\`),
  INDEX \`idx_bookings_status\` (\`status\`),
  CONSTRAINT \`fk_bookings_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Table structure for table \`booking_items\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`booking_items\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`booking_id\` INT UNSIGNED NOT NULL,
  \`unit_id\` INT UNSIGNED DEFAULT NULL,
  \`daily_rate\` DECIMAL(12,2) NOT NULL DEFAULT 25000.00,
  \`notes\` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_bi_booking\` (\`booking_id\`),
  INDEX \`idx_bi_unit\` (\`unit_id\`),
  CONSTRAINT \`fk_bi_booking\` FOREIGN KEY (\`booking_id\`) REFERENCES \`bookings\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_bi_unit\` FOREIGN KEY (\`unit_id\`) REFERENCES \`equipment_units\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Table structure for table \`rentals\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`rentals\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`rental_code\` VARCHAR(30) NOT NULL UNIQUE,
  \`customer_id\` INT UNSIGNED NOT NULL,
  \`booking_id\` INT UNSIGNED DEFAULT NULL,
  \`out_date\` DATETIME NOT NULL,
  \`due_date\` DATETIME NOT NULL,
  \`actual_return_date\` DATETIME DEFAULT NULL,
  \`total_days\` INT UNSIGNED NOT NULL DEFAULT 1,
  \`subtotal\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`discount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`deposit_amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`total_cost\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`payment_status\` ENUM('Lunas', 'DP', 'Belum Bayar') NOT NULL DEFAULT 'Belum Bayar',
  \`rental_status\` ENUM('Berlangsung', 'Selesai', 'Terlambat', 'Dibatalkan') NOT NULL DEFAULT 'Berlangsung',
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_rentals_code\` (\`rental_code\`),
  INDEX \`idx_rentals_customer\` (\`customer_id\`),
  INDEX \`idx_rentals_status\` (\`rental_status\`),
  INDEX \`idx_rentals_due_date\` (\`due_date\`),
  CONSTRAINT \`fk_rentals_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT \`fk_rentals_booking\` FOREIGN KEY (\`booking_id\`) REFERENCES \`bookings\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. Table structure for table \`rental_items\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`rental_items\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`rental_id\` INT UNSIGNED NOT NULL,
  \`unit_id\` INT UNSIGNED NOT NULL,
  \`daily_rate\` DECIMAL(12,2) NOT NULL DEFAULT 25000.00,
  \`condition_out\` VARCHAR(100) NOT NULL,
  \`battery_level_out\` TINYINT UNSIGNED NOT NULL DEFAULT 100,
  \`accessories_out\` JSON DEFAULT NULL,
  \`condition_in\` VARCHAR(100) DEFAULT NULL,
  \`battery_level_in\` TINYINT UNSIGNED DEFAULT NULL,
  \`accessories_in\` JSON DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_ri_rental\` (\`rental_id\`),
  INDEX \`idx_ri_unit\` (\`unit_id\`),
  CONSTRAINT \`fk_ri_rental\` FOREIGN KEY (\`rental_id\`) REFERENCES \`rentals\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_ri_unit\` FOREIGN KEY (\`unit_id\`) REFERENCES \`equipment_units\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 9. Table structure for table \`returns\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`returns\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`return_code\` VARCHAR(30) NOT NULL UNIQUE,
  \`rental_id\` INT UNSIGNED NOT NULL,
  \`return_date\` DATETIME NOT NULL,
  \`late_hours\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`late_fee\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`damage_fee\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`lost_fee\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`deposit_refunded\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`final_payment_adjusted\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`receiver_notes\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_returns_code\` (\`return_code\`),
  INDEX \`idx_returns_rental\` (\`rental_id\`),
  CONSTRAINT \`fk_returns_rental\` FOREIGN KEY (\`rental_id\`) REFERENCES \`rentals\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 10. Table structure for table \`return_items\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`return_items\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`return_id\` INT UNSIGNED NOT NULL,
  \`rental_item_id\` INT UNSIGNED NOT NULL,
  \`unit_id\` INT UNSIGNED NOT NULL,
  \`physical_condition_returned\` VARCHAR(100) NOT NULL,
  \`battery_condition_returned\` TINYINT UNSIGNED NOT NULL DEFAULT 100,
  \`accessories_missing\` JSON DEFAULT NULL,
  \`damage_notes\` TEXT DEFAULT NULL,
  \`assessed_repair_cost\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`resulting_unit_status\` ENUM('Tersedia', 'Perawatan', 'Hilang') NOT NULL DEFAULT 'Tersedia',
  PRIMARY KEY (\`id\`),
  INDEX \`idx_retitem_return\` (\`return_id\`),
  INDEX \`idx_retitem_unit\` (\`unit_id\`),
  CONSTRAINT \`fk_retitem_return\` FOREIGN KEY (\`return_id\`) REFERENCES \`returns\` (\`id\`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT \`fk_retitem_unit\` FOREIGN KEY (\`unit_id\`) REFERENCES \`equipment_units\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 11. Table structure for table \`payments\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`payments\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`payment_code\` VARCHAR(30) NOT NULL UNIQUE,
  \`rental_id\` INT UNSIGNED DEFAULT NULL,
  \`booking_id\` INT UNSIGNED DEFAULT NULL,
  \`type\` ENUM('Sewa', 'Deposit', 'Denda', 'Kerusakan', 'Pengembalian Deposit') NOT NULL,
  \`amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`payment_method\` ENUM('Tunai', 'Transfer Bank', 'QRIS') NOT NULL DEFAULT 'Tunai',
  \`payment_date\` DATETIME NOT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_payments_rental\` (\`rental_id\`),
  INDEX \`idx_payments_booking\` (\`booking_id\`),
  INDEX \`idx_payments_type\` (\`type\`),
  INDEX \`idx_payments_date\` (\`payment_date\`),
  CONSTRAINT \`fk_payments_rental\` FOREIGN KEY (\`rental_id\`) REFERENCES \`rentals\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT \`fk_payments_booking\` FOREIGN KEY (\`booking_id\`) REFERENCES \`bookings\` (\`id\`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 12. Table structure for table \`expenses\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`expenses\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`expense_code\` VARCHAR(30) NOT NULL UNIQUE,
  \`category\` ENUM('Perawatan HT', 'Pembelian Baterai', 'Pembelian Charger', 'Operasional', 'Gaji/Transport', 'Lainnya') NOT NULL,
  \`amount\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`expense_date\` DATE NOT NULL,
  \`description\` VARCHAR(255) NOT NULL,
  \`payment_method\` ENUM('Tunai', 'Transfer Bank') NOT NULL DEFAULT 'Tunai',
  \`recipient\` VARCHAR(100) DEFAULT NULL,
  \`notes\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_expenses_category\` (\`category\`),
  INDEX \`idx_expenses_date\` (\`expense_date\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 13. Table structure for table \`maintenance_records\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`maintenance_records\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`maintenance_code\` VARCHAR(30) NOT NULL UNIQUE,
  \`unit_id\` INT UNSIGNED NOT NULL,
  \`check_date\` DATE NOT NULL,
  \`damage_type\` VARCHAR(100) NOT NULL,
  \`damage_description\` TEXT NOT NULL,
  \`cost\` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  \`status\` ENUM('Dilaporkan', 'Dalam Proses', 'Selesai', 'Dibatalkan') NOT NULL DEFAULT 'Dilaporkan',
  \`completion_date\` DATE DEFAULT NULL,
  \`technician_notes\` TEXT DEFAULT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_maint_unit\` (\`unit_id\`),
  INDEX \`idx_maint_status\` (\`status\`),
  CONSTRAINT \`fk_maint_unit\` FOREIGN KEY (\`unit_id\`) REFERENCES \`equipment_units\` (\`id\`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 14. Table structure for table \`app_settings\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`app_settings\` (
  \`id\` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`business_name\` VARCHAR(100) NOT NULL DEFAULT 'TALKRENT',
  \`brand_tagline\` VARCHAR(150) NOT NULL DEFAULT 'Your Communication Partner.',
  \`phone_whatsapp\` VARCHAR(25) NOT NULL DEFAULT '087861608958',
  \`email\` VARCHAR(100) NOT NULL DEFAULT 'rental@talkrent.id',
  \`address\` TEXT NOT NULL,
  \`default_daily_rate\` DECIMAL(12,2) NOT NULL DEFAULT 25000.00,
  \`late_fee_per_hour\` DECIMAL(12,2) NOT NULL DEFAULT 5000.00,
  \`late_fee_per_day\` DECIMAL(12,2) NOT NULL DEFAULT 35000.00,
  \`default_deposit_rate\` DECIMAL(12,2) NOT NULL DEFAULT 50000.00,
  \`bank_name\` VARCHAR(100) NOT NULL DEFAULT 'Bank Central Asia (BCA)',
  \`bank_account_number\` VARCHAR(50) NOT NULL DEFAULT '0540-881-921',
  \`bank_account_name\` VARCHAR(100) NOT NULL DEFAULT 'TALKRENT TASIKMALAYA',
  \`qris_image_url\` TEXT DEFAULT NULL,
  \`terms_and_conditions\` TEXT DEFAULT NULL,
  \`updated_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 15. Table structure for table \`audit_logs\`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`audit_logs\` (
  \`id\` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  \`user_id\` INT UNSIGNED NOT NULL DEFAULT 1,
  \`action\` VARCHAR(80) NOT NULL,
  \`entity_type\` VARCHAR(60) NOT NULL,
  \`entity_id\` INT UNSIGNED NOT NULL DEFAULT 0,
  \`description\` TEXT NOT NULL,
  \`ip_address\` VARCHAR(45) NOT NULL DEFAULT '127.0.0.1',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  INDEX \`idx_audit_action\` (\`action\`),
  INDEX \`idx_audit_created\` (\`created_at\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- SEED DATA
-- --------------------------------------------------------

INSERT INTO \`users\` (\`id\`, \`username\`, \`password_hash\`, \`full_name\`, \`email\`, \`role\`) VALUES
(1, 'admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin Utama TALKRENT', 'admin@talkrent.id', 'admin')
ON DUPLICATE KEY UPDATE \`username\` = \`username\`;

INSERT INTO \`app_settings\` (\`id\`, \`business_name\`, \`brand_tagline\`, \`phone_whatsapp\`, \`email\`, \`address\`, \`default_daily_rate\`, \`late_fee_per_hour\`, \`late_fee_per_day\`, \`default_deposit_rate\`, \`bank_name\`, \`bank_account_number\`, \`bank_account_name\`, \`terms_and_conditions\`) VALUES
(1, 'TALKRENT', 'Your Communication Partner.', '087861608958', 'rental@talkrent.id', 'Jl. Raya Singaparna KM 9 No. 45, Kabupaten Tasikmalaya, Jawa Barat 46411', 25000.00, 5000.00, 35000.00, 50000.00, 'Bank Central Asia (BCA)', '0540-881-921', 'TALKRENT TASIKMALAYA', '1. Penyewa wajib menyerahkan identitas asli (KTP/SIM) sebagai jaminan.\\n2. Wajib menjaga kebersihan dan kelengkapan unit (baterai, antena, clip, charger, headset).\\n3. Keterlambatan pengembalian tanpa konfirmasi dikenakan denda Rp 5.000/jam atau Rp 35.000/hari per unit.\\n4. Segala bentuk kerusakan fisik atau kehilangan menjadi tanggung jawab penuh penyewa sesuai tabel ganti rugi resmi TALKRENT.')
ON DUPLICATE KEY UPDATE \`business_name\` = \`business_name\`;

INSERT INTO \`equipment_models\` (\`id\`, \`brand\`, \`model_name\`, \`frequency_range\`, \`channel_count\`, \`power_output\`, \`battery_type\`, \`daily_rate\`, \`description\`) VALUES
(1, 'WLN', 'WLN KD-C1 Ultra Compact', 'UHF 400-470 MHz', 16, '2 Watt', 'Li-ion 1500 mAh', 25000.00, 'HT ringkas, ringan, jangkauan 1-2 km. Cocok untuk wedding organizer, event indoor, seminar, dan cafe.'),
(2, 'WLN', 'WLN KD-C100 High Power', 'UHF 400-470 MHz', 16, '5 Watt', 'Li-ion 2800 mAh', 35000.00, 'HT power tinggi, jangkauan 3-5 km. Bodi kokoh tahan percikan air, cocok untuk konser, gathering outdoor, dan pengamanan.'),
(3, 'WLN', 'WLN KD-C51 Dual PTT', 'UHF 400-470 MHz', 16, '3 Watt', 'Li-ion 2000 mAh', 30000.00, 'Dilengkapi dual PTT dan antena gain tinggi. Suara jernih dengan noise cancelling terintegrasi.')
ON DUPLICATE KEY UPDATE \`model_name\` = \`model_name\`;

COMMIT;
`;
}
