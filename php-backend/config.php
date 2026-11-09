<?php
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
$db_user  = "root";          // Pengguna default phpMyAdmin di XAMPP / Laragon
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
?>
