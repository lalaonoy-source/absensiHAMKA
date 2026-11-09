<?php
// =======================================================
// berkas: absen.php - SIMPAN DATA PRESENSI & FOTO DARI KAMERA
// Parameter POST JSON: user_id, name, department, date, activity_name, status, photo_base64
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
?>
