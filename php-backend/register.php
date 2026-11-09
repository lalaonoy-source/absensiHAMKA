<?php
// =======================================================
// berkas: register.php - PENDAFTARAN AKUN HAMKA
// Parameter POST JSON: name, phone, password
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
        "user" => [
            "id" => $userId,
            "name" => $name,
            "phone" => $phone
        ]
    ]);
} else {
    echo json_encode(["success" => false, "message" => "Terjadi kesalahan saat pendaftaran."]);
}
?>
