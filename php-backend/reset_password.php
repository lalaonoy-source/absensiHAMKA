<?php
// =======================================================
// berkas: reset_password.php - UBAH PASSWORD DENGAN NO TELEPON
// Parameter POST JSON: phone, new_password
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
?>
