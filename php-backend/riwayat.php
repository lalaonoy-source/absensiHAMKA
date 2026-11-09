<?php
// =======================================================
// berkas: riwayat.php - LIHAT CATATAN KEHADIRAN HARIAN
// Parameter GET: user_id (opsional), date (opsional), status (opsional)
// =======================================================
require_once 'config.php';
header('Content-Type: application/json');

$userId     = $_GET['user_id'] ?? null;
$status     = $_GET['status'] ?? null;
$department = $_GET['department'] ?? null;
$date       = $_GET['date'] ?? null;

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
if (!empty($date)) {
    $query .= " AND date = ?";
    $params[] = $date;
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
?>
