import React, { useState } from 'react';
import { Database, Server, Code2, Copy, Check, X, FileCode, Download, BookOpen, Layers, HardDrive } from 'lucide-react';

interface PhpDatabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SQL_SCHEMA = `-- =======================================================
-- DATABASE & TABEL ABSENSI HAMKA UNTUK PHPMYADMIN (MYSQL)
-- Nama Database : absensi_hamka
-- =======================================================

-- 1. Buat Database Baru
CREATE DATABASE IF NOT EXISTS \`absensi_hamka\` 
DEFAULT CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE \`absensi_hamka\`;

-- --------------------------------------------------------
-- 2. TABEL: users (Menyimpan data akun pengguna)
-- Fitur: Nama, No Telepon, Password Hash, Waktu Dibuat
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`name\` VARCHAR(100) NOT NULL,
  \`phone\` VARCHAR(20) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. TABEL: absensi (Menyimpan data catatan kehadiran harian)
-- Fitur: Nama, Departemen, Tanggal, Nama Kegiatan, Keterangan, Bukti Foto Kamera
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`absensi\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`user_id\` INT(11) NULL,
  \`name\` VARCHAR(100) NOT NULL,
  \`department\` ENUM(
    'Departemen organisasi',
    'departemen penelitian dan pengembangan',
    'departemen eksternal',
    'departemen komunikasi dan informasi'
  ) NOT NULL,
  \`date\` DATE NOT NULL,
  \`activity_name\` VARCHAR(150) NOT NULL,
  \`status\` ENUM('Hadir', 'Sakit', 'Izin') NOT NULL DEFAULT 'Hadir',
  \`photo_filename\` VARCHAR(255) NOT NULL,
  \`photo_path\` VARCHAR(255) NOT NULL,
  \`latitude\` DECIMAL(10, 8) NULL,
  \`longitude\` DECIMAL(11, 8) NULL,
  \`location_name\` VARCHAR(255) NULL,
  \`device_info\` VARCHAR(100) DEFAULT 'Kamera Langsung Web',
  \`created_at\` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  KEY \`idx_date\` (\`date\`),
  KEY \`idx_department\` (\`department\`),
  CONSTRAINT \`fk_absensi_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. DATA CONTOH AWAL (SEED DATA)
-- Password default: 'password123' (hash bcrypt)
-- --------------------------------------------------------
INSERT INTO \`users\` (\`id\`, \`name\`, \`phone\`, \`password\`, \`created_at\`) VALUES
(1, 'Ahmad Naufal', '081234567890', '$2y$10$eO068D9l7Y8g0o85nK7b1.Nvy9m3F9gG4q6e9q1b1qK6n6rFmZ7Ue', NOW()),
(2, 'Fatimah Zahra', '085712345678', '$2y$10$eO068D9l7Y8g0o85nK7b1.Nvy9m3F9gG4q6e9q1b1qK6n6rFmZ7Ue', NOW());

INSERT INTO \`absensi\` (\`user_id\`, \`name\`, \`department\`, \`date\`, \`activity_name\`, \`status\`, \`photo_filename\`, \`photo_path\`, \`created_at\`) VALUES
(1, 'Ahmad Naufal', 'Departemen organisasi', CURDATE(), 'Rapat Koordinasi Departemen', 'Hadir', 'bukti-kehadiran-sample1.jpg', 'uploads/bukti-kehadiran-sample1.jpg', NOW()),
(1, 'Ahmad Naufal', 'Departemen organisasi', DATE_SUB(CURDATE(), INTERVAL 2 DAY), 'Kajian Rutin & Evaluasi Mingguan', 'Hadir', 'bukti-kehadiran-sample2.jpg', 'uploads/bukti-kehadiran-sample2.jpg', NOW());
`;

export const PHP_CONFIG = `<?php
// =======================================================
// berkas: config.php - KONEKSI DATABASE PHPMYADMIN (MYSQL)
// =======================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host     = "localhost";
$db_user  = "root";          // Pengguna default phpMyAdmin
$db_pass  = "";              // Password default di XAMPP / Laragon (kosong)
$db_name  = "absensi_hamka"; // Nama database di phpMyAdmin

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Gagal terhubung ke database phpMyAdmin: " . $e->getMessage()
    ]);
    exit();
}
?>`;

export const PHP_REGISTER = `<?php
// =======================================================
// berkas: register.php - PENDAFTARAN AKUN HAMKA
// Parameter: name, phone, password
// =======================================================
require_once 'config.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$name     = trim($input['name'] ?? '');
$phone    = trim($input['phone'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($name) || empty($phone) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Nama, Nomor Telepon, dan Password wajib diisi."]);
    exit();
}

// Cek apakah nomor telepon sudah terdaftar
$stmt = $pdo->prepare("SELECT id FROM users WHERE phone = ? LIMIT 1");
$stmt->execute([$phone]);
if ($stmt->fetch()) {
    echo json_encode(["success" => false, "message" => "Nomor telepon sudah terdaftar di sistem."]);
    exit();
}

// Hash password menggunakan bcrypt
$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

$insert = $pdo->prepare("INSERT INTO users (name, phone, password, created_at) VALUES (?, ?, ?, NOW())");
if ($insert->execute([$name, $phone, $hashedPassword])) {
    $userId = $pdo->lastInsertId();
    echo json_encode([
        "success" => true,
        "message" => "Registrasi berhasil!",
        "user" => ["id" => $userId, "name" => $name, "phone" => $phone]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Terjadi kesalahan saat pendaftaran."]);
}
?>`;

export const PHP_LOGIN = `<?php
// =======================================================
// berkas: login.php - AUTENTIKASI MASUK AKUN
// Parameter: name (nama atau nomor telepon), password
// =======================================================
require_once 'config.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$username = trim($input['name'] ?? '');
$password = trim($input['password'] ?? '');

if (empty($username) || empty($password)) {
    echo json_encode(["success" => false, "message" => "Nama dan password wajib diisi."]);
    exit();
}

// Cari pengguna berdasarkan Nama ATAU Nomor Telepon
$stmt = $pdo->prepare("SELECT id, name, phone, password FROM users WHERE name = ? OR phone = ? LIMIT 1");
$stmt->execute([$username, $username]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password'])) {
    echo json_encode(["success" => false, "message" => "Nama/No. Telepon atau password salah."]);
    exit();
}

echo json_encode([
    "success" => true,
    "message" => "Login berhasil.",
    "user" => [
        "id" => $user['id'],
        "name" => $user['name'],
        "phone" => $user['phone']
    ]
]);
?>`;

export const PHP_RESET_PASSWORD = `<?php
// =======================================================
// berkas: reset_password.php - UBAH PASSWORD DENGAN NO TELEPON
// Parameter: phone, new_password
// =======================================================
require_once 'config.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$phone       = trim($input['phone'] ?? '');
$newPassword = trim($input['new_password'] ?? '');

if (empty($phone) || empty($newPassword)) {
    echo json_encode(["success" => false, "message" => "Nomor telepon dan password baru wajib diisi."]);
    exit();
}

if (strlen($newPassword) < 6) {
    echo json_encode(["success" => false, "message" => "Password baru minimal 6 karakter."]);
    exit();
}

// Cek apakah akun dengan no telepon tersebut ada
$stmt = $pdo->prepare("SELECT id, name FROM users WHERE phone = ? LIMIT 1");
$stmt->execute([$phone]);
$user = $stmt->fetch();

if (!$user) {
    echo json_encode([
        "success" => false,
        "message" => "Nomor telepon tidak ditemukan dalam database HAMKA."
    ]);
    exit();
}

// Hash password baru dan update ke tabel users
$hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);
$update = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");

if ($update->execute([$hashedPassword, $user['id']])) {
    echo json_encode([
        "success" => true,
        "message" => "Password untuk akun " . $user['name'] . " berhasil diperbarui. Silakan login."
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Gagal memperbarui password."]);
}
?>`;

export const PHP_ABSEN = `<?php
// =======================================================
// berkas: absen.php - SIMPAN DATA PRESENSI & FOTO DARI KAMERA
// Parameter: user_id, name, department, date, activity_name, status, photo_base64
// =======================================================
require_once 'config.php';
header('Content-Type: application/json');

$input = json_decode(file_get_contents('php://input'), true);

$userId       = !empty($input['user_id']) ? (int)$input['user_id'] : null;
$name         = trim($input['name'] ?? '');
$department   = trim($input['department'] ?? '');
$date         = trim($input['date'] ?? date('Y-m-d'));
$activityName = trim($input['activity_name'] ?? '');
$status       = trim($input['status'] ?? 'Hadir');
$photoBase64  = $input['photo_base64'] ?? '';

$latitude     = isset($input['latitude']) ? (float)$input['latitude'] : null;
$longitude    = isset($input['longitude']) ? (float)$input['longitude'] : null;
$locationName = trim($input['location_name'] ?? '');

if (empty($name) || empty($department) || empty($activityName) || empty($photoBase64)) {
    echo json_encode(["success" => false, "message" => "Semua bidang dan foto bukti wajib diisi."]);
    exit();
}

// 1. Simpan Foto Kamera dari Base64 ke folder /uploads/
$uploadDir = __DIR__ . '/uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Hapus prefix data:image/...;base64,
if (preg_match('/^data:image\/(\\w+);base64,/', $photoBase64, $type)) {
    $photoBase64 = substr($photoBase64, strpos($photoBase64, ',') + 1);
    $type = strtolower($type[1]);
    if (!in_array($type, ['jpg', 'jpeg', 'png'])) {
        $type = 'jpg';
    }
} else {
    $type = 'jpg';
}

$photoDecoded = base64_decode($photoBase64);
if ($photoDecoded === false) {
    echo json_encode(["success" => false, "message" => "Gagal memproses gambar kamera."]);
    exit();
}

$filename = 'bukti-kehadiran-' . date('Ymd-His') . '-' . uniqid() . '.' . $type;
$targetFilePath = $uploadDir . $filename;
file_put_contents($targetFilePath, $photoDecoded);

$relativePath = 'uploads/' . $filename;

// 2. Simpan record kehadiran ke tabel 'absensi' phpMyAdmin (termasuk lokasi GPS)
$stmt = $pdo->prepare("INSERT INTO absensi 
    (user_id, name, department, date, activity_name, status, photo_filename, photo_path, latitude, longitude, location_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");

if ($stmt->execute([$userId, $name, $department, $date, $activityName, $status, $filename, $relativePath, $latitude, $longitude, $locationName])) {
    $insertedId = $pdo->lastInsertId();
    echo json_encode([
        "success" => true,
        "message" => "Absensi berhasil dicatat!",
        "record" => [
            "id" => $insertedId,
            "name" => $name,
            "department" => $department,
            "date" => $date,
            "activity_name" => $activityName,
            "status" => $status,
            "photo_filename" => $filename,
            "photo_path" => $relativePath,
            "latitude" => $latitude,
            "longitude" => $longitude,
            "location_name" => $locationName
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Gagal menyimpan absensi ke database."]);
}
?>`;

export const PHP_RIWAYAT = `<?php
// =======================================================
// berkas: riwayat.php - LIHAT CATATAN KEHADIRAN HARIAN
// Parameter opsional: user_id, date, department, status
// =======================================================
require_once 'config.php';
header('Content-Type: application/json');

$userId     = $_GET['user_id'] ?? null;
$status     = $_GET['status'] ?? null;
$department = $_GET['department'] ?? null;

$query = "SELECT * FROM absensi WHERE 1=1";
$params = [];

if (!empty($userId)) {
    $query .= " AND user_id = ?";
    $params[] = (int)$userId;
}
if (!empty($status) && $status !== 'all') {
    $query .= " AND status = ?";
    $params[] = $status;
}
if (!empty($department) && $department !== 'all') {
    $query .= " AND department = ?";
    $params[] = $department;
}

$query .= " ORDER BY date DESC, created_at DESC";

$stmt = $pdo->prepare($query);
$stmt->execute($params);
$data = $stmt->fetchAll();

echo json_encode([
    "success" => true,
    "total" => count($data),
    "data" => $data
]);
?>`;

export const PhpDatabaseModal: React.FC<PhpDatabaseModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'explanation' | 'sql' | 'config' | 'login' | 'register' | 'reset' | 'absen' | 'riwayat'>('explanation');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const getActiveCode = () => {
    switch (activeTab) {
      case 'sql':
        return { title: 'database.sql (phpMyAdmin Schema & Seed)', code: SQL_SCHEMA, lang: 'sql', filename: 'database.sql' };
      case 'config':
        return { title: 'config.php (Koneksi Database)', code: PHP_CONFIG, lang: 'php', filename: 'config.php' };
      case 'login':
        return { title: 'login.php (Autentikasi Pengguna)', code: PHP_LOGIN, lang: 'php', filename: 'login.php' };
      case 'register':
        return { title: 'register.php (Pendaftaran Akun)', code: PHP_REGISTER, lang: 'php', filename: 'register.php' };
      case 'reset':
        return { title: 'reset_password.php (Reset via No Telepon)', code: PHP_RESET_PASSWORD, lang: 'php', filename: 'reset_password.php' };
      case 'absen':
        return { title: 'absen.php (Formulir & Simpan Foto Kamera)', code: PHP_ABSEN, lang: 'php', filename: 'absen.php' };
      case 'riwayat':
        return { title: 'riwayat.php (API Riwayat Absensi)', code: PHP_RIWAYAT, lang: 'php', filename: 'riwayat.php' };
      default:
        return null;
    }
  };

  const currentCode = getActiveCode();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0f274a] text-white flex items-center justify-center shadow-sm">
              <Database className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Dokumentasi Database phpMyAdmin & Backend PHP
              </h3>
              <p className="text-xs text-slate-500">
                Penjelasan bagian database, query SQL terpisah, dan seluruh kodingan PHP
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-slate-200 bg-slate-100/60 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('explanation')}
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'explanation'
                ? 'border-[#0f274a] text-[#0f274a] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Struktur & Penjelasan Bagian</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-[#0f274a] text-[#0f274a] bg-white rounded-t-lg font-bold'
                : 'border-transparent text-blue-700 hover:text-blue-900'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-amber-500" />
            <span>database.sql (phpMyAdmin)</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'config'
                ? 'border-[#0f274a] text-[#0f274a] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>config.php</span>
          </button>

          <button
            onClick={() => setActiveTab('login')}
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'login'
                ? 'border-[#0f274a] text-[#0f274a] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>login.php</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-[#0f274a] text-[#0f274a] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>register.php</span>
          </button>

          <button
            onClick={() => setActiveTab('reset')}
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'reset'
                ? 'border-[#0f274a] text-[#0f274a] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>reset_password.php</span>
          </button>

          <button
            onClick={() => setActiveTab('absen')}
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'absen'
                ? 'border-[#0f274a] text-[#0f274a] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>absen.php</span>
          </button>

          <button
            onClick={() => setActiveTab('riwayat')}
            className={`py-2 px-3 border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === 'riwayat'
                ? 'border-[#0f274a] text-[#0f274a] bg-white rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>riwayat.php</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'explanation' ? (
            <div className="space-y-6 text-xs sm:text-sm text-slate-700">
              {/* Architecture 3-Tier Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Arsitektur Sistem: Mana Bagian Database & Mana Bagian PHP?</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  {/* Tier 1: Frontend */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="inline-block bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-2">
                        1. Tampilan (Frontend)
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs mb-1">
                        HTML5 / WebRTC Kamera
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Tampilan formulir, modul kamera website langsung (memblokir upload foto galeri), dan halaman responsif yang Anda lihat di layar.
                      </p>
                    </div>
                  </div>

                  {/* Tier 2: Backend PHP */}
                  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="inline-block bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-2">
                        2. Pemrosesan (PHP Backend)
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs mb-1">
                        Skrip PHP (Apache / XAMPP)
                      </h5>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Menerima data login, memvalidasi nomor telepon saat reset password, mengonversi foto selfie base64 ke berkas .jpg di folder <code className="bg-slate-100 px-1 rounded text-pink-600">uploads/</code>, dan mengeksekusi SQL.
                      </p>
                    </div>
                  </div>

                  {/* Tier 3: Database MySQL / phpMyAdmin */}
                  <div className="bg-white p-4 rounded-lg border-2 border-amber-400/80 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="inline-block bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded uppercase mb-2">
                        3. Database (phpMyAdmin)
                      </div>
                      <h5 className="font-bold text-slate-900 text-xs mb-1">
                        MySQL Server (phpMyAdmin)
                      </h5>
                      <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                        <strong>BAGIAN DATABASE:</strong> Database <code className="bg-amber-50 px-1 text-amber-800 font-bold">absensi_hamka</code> yang menyimpan tabel <code className="text-amber-800">users</code> dan <code className="text-amber-800">absensi</code> secara permanen.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step by Step Setup in phpMyAdmin */}
              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-5">
                <h4 className="text-sm font-bold text-[#0f274a] mb-2 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  <span>Cara Memasang Database di phpMyAdmin (Langkah demi Langkah)</span>
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 leading-relaxed">
                  <li>
                    Nyalakan <strong>Apache</strong> dan <strong>MySQL</strong> di panel kontrol XAMPP atau Laragon Anda.
                  </li>
                  <li>
                    Buka peramban (browser) dan ketik alamat: <code className="bg-white px-2 py-0.5 rounded border border-blue-200 font-mono text-blue-700 font-bold">http://localhost/phpmyadmin</code>.
                  </li>
                  <li>
                    Klik menu tab <strong>SQL</strong> di bagian atas phpMyAdmin.
                  </li>
                  <li>
                    Buka tab <strong>database.sql (phpMyAdmin)</strong> di modal ini, tekan tombol <strong>Salin Kode</strong> (atau <strong>Download</strong>), lalu tempelkan (paste) kodenya ke kotak teks SQL di phpMyAdmin.
                  </li>
                  <li>
                    Tekan tombol <strong>Go / Kirim</strong> di kanan bawah phpMyAdmin. Selesai! Database <code className="font-mono font-semibold">absensi_hamka</code> beserta tabel <code className="font-mono">users</code> dan <code className="font-mono">absensi</code> langsung siap digunakan.
                  </li>
                </ol>
              </div>

              {/* Ready-to-use notice */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Seluruh Berkas PHP & SQL Sudah Dibuatkan di Folder Projek:</p>
                  <p className="mt-0.5 text-emerald-700">
                    Semua skrip PHP terpisah dan berkas SQL database telah disimpan di direktori <code className="font-mono font-semibold bg-white/70 px-1 py-0.5 rounded">/php-backend/</code> di dalam workspace ini. Anda dapat menyalinnya langsung ke folder <code className="font-mono font-semibold bg-white/70 px-1 py-0.5 rounded">htdocs</code> XAMPP Anda.
                  </p>
                </div>
              </div>
            </div>
          ) : currentCode ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 font-mono">
                    {currentCode.filename}
                  </h4>
                  <p className="text-xs text-slate-500">{currentCode.title}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCopy(currentCode.code)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Tersalin!' : 'Salin Kode'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDownload(currentCode.filename, currentCode.code)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[#0f274a] hover:bg-[#163a69] text-white px-3 py-1.5 rounded-lg transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {currentCode.filename}</span>
                  </button>
                </div>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-[#0d1117] text-slate-100 font-mono text-xs">
                <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>{currentCode.filename}</span>
                  <span className="uppercase text-[10px] text-amber-400">{currentCode.lang}</span>
                </div>
                <pre className="p-4 overflow-x-auto max-h-[420px] text-[11px] leading-relaxed">
                  <code>{currentCode.code}</code>
                </pre>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Database: MySQL (phpMyAdmin) • Bahasa: PHP 7.4 / 8.x • Arsitektur REST API</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 text-slate-700 font-semibold hover:bg-slate-300 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
