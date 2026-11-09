<?php
// =======================================================
// berkas: login.php - AUTENTIKASI MASUK AKUN
// Parameter POST JSON: name, password
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
?>
