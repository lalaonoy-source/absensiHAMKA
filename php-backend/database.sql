-- =======================================================
-- DATABASE & TABEL ABSENSI HAMKA UNTUK PHPMYADMIN (MYSQL)
-- Nama Database : absensi_hamka
-- =======================================================

-- 1. Buat Database Baru
CREATE DATABASE IF NOT EXISTS `absensi_hamka` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE `absensi_hamka`;

-- --------------------------------------------------------
-- 2. TABEL: users (Menyimpan data akun pengguna)
-- Fitur: Nama, No Telepon, Password Hash, Waktu Dibuat
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. TABEL: absensi (Menyimpan data catatan kehadiran harian)
-- Fitur: Nama, Departemen, Tanggal, Nama Kegiatan, Keterangan, Bukti Foto Kamera
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `absensi` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `user_id` INT(11) NULL,
  `name` VARCHAR(100) NOT NULL,
  `department` ENUM(
    'Departemen organisasi',
    'departemen penelitian dan pengembangan',
    'departemen eksternal',
    'departemen komunikasi dan informasi'
  ) NOT NULL,
  `date` DATE NOT NULL,
  `activity_name` VARCHAR(150) NOT NULL,
  `status` ENUM('Hadir', 'Sakit', 'Izin') NOT NULL DEFAULT 'Hadir',
  `photo_filename` VARCHAR(255) NOT NULL,
  `photo_path` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10, 8) NULL,
  `longitude` DECIMAL(11, 8) NULL,
  `location_name` VARCHAR(255) NULL,
  `device_info` VARCHAR(100) DEFAULT 'Kamera Langsung Web',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_date` (`date`),
  KEY `idx_department` (`department`),
  CONSTRAINT `fk_absensi_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. DATA AWAL (SEED DATA CONTOH)
-- Akun: Ahmad Naufal (081234567890) & Fatimah Zahra (085712345678)
-- Password default: 'password123'
-- --------------------------------------------------------
INSERT INTO `users` (`id`, `name`, `phone`, `password`, `created_at`) VALUES
(1, 'Ahmad Naufal', '081234567890', '$2y$10$eO068D9l7Y8g0o85nK7b1.Nvy9m3F9gG4q6e9q1b1qK6n6rFmZ7Ue', NOW()),
(2, 'Fatimah Zahra', '085712345678', '$2y$10$eO068D9l7Y8g0o85nK7b1.Nvy9m3F9gG4q6e9q1b1qK6n6rFmZ7Ue', NOW());

INSERT INTO `absensi` (`user_id`, `name`, `department`, `date`, `activity_name`, `status`, `photo_filename`, `photo_path`, `created_at`) VALUES
(1, 'Ahmad Naufal', 'Departemen organisasi', CURDATE(), 'Rapat Koordinasi Departemen', 'Hadir', 'bukti-kehadiran-sample1.jpg', 'uploads/bukti-kehadiran-sample1.jpg', NOW()),
(1, 'Ahmad Naufal', 'Departemen organisasi', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Kajian Rutin & Evaluasi Mingguan', 'Hadir', 'bukti-kehadiran-sample2.jpg', 'uploads/bukti-kehadiran-sample2.jpg', NOW());
