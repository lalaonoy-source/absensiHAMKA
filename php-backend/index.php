<?php
// ====================================================================================================
// APLIKASI ABSENSI HAMKA - ALL IN ONE SINGLE FILE (SATU FILE LENGKAP)
// ====================================================================================================
// Berkas ini menggabungkan seluruh komponen:
// 1. AUTO-SETUP DATABASE & TABEL PHPMYADMIN (MySQL)
// 2. BACKEND API PHP (Login, Register, Lupa Password No. Telepon, Simpan Presensi & Foto, Riwayat)
// 3. FRONTEND UI & KAMERA WEBRTC LANGSUNG & GPS OTOMATIS
// ====================================================================================================
// CARA PAKAI DI XAMPP / LARAGON:
// 1. Simpan file ini sebagai: C:\xampp\htdocs\absensi-hamka\index.php
// 2. Buka browser: http://localhost/absensi-hamka/
// ====================================================================================================

// --- KONFIGURASI DATABASE ---
$db_host = "localhost";
$db_user = "root";          // User default XAMPP
$db_pass = "";              // Password default XAMPP (kosong)
$db_name = "absensi_hamka"; // Nama database

// --- 1. OTOMATIS MEMBUAT DATABASE & TABEL JIKA BELUM ADA ---
try {
    $pdo_init = new PDO("mysql:host=$db_host;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    $pdo_init->exec("CREATE DATABASE IF NOT EXISTS `$db_name` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);

    // Tabel Users
    $pdo->exec("CREATE TABLE IF NOT EXISTS `users` (
        `id` INT(11) NOT NULL AUTO_INCREMENT,
        `name` VARCHAR(100) NOT NULL,
        `phone` VARCHAR(20) NOT NULL UNIQUE,
        `password` VARCHAR(255) NOT NULL,
        `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Tabel Absensi
    $pdo->exec("CREATE TABLE IF NOT EXISTS `absensi` (
        `id` INT(11) NOT NULL AUTO_INCREMENT,
        `user_id` INT(11) NULL,
        `name` VARCHAR(100) NOT NULL,
        `department` VARCHAR(100) NOT NULL,
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
        KEY `idx_date` (`date`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");

    // Seed Akun Default jika masih kosong
    $checkUsers = $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn();
    if ($checkUsers == 0) {
        $samplePass = password_hash("password123", PASSWORD_BCRYPT);
        $stmtSeed = $pdo->prepare("INSERT INTO users (name, phone, password, created_at) VALUES (?, ?, ?, NOW())");
        $stmtSeed->execute(["Ahmad Naufal", "081234567890", $samplePass]);
        $stmtSeed->execute(["Fatimah Zahra", "085712345678", $samplePass]);
    }
} catch (PDOException $e) {
    die("Koneksi Database Gagal: " . $e->getMessage() . "<br>Pastikan Apache & MySQL di XAMPP sudah berjalan.");
}

// --- 2. BACKEND API ROUTER (DIPANGGIL VIA FETCH DI FILE YANG SAMA) ---
$action = $_GET['action'] ?? '';

if ($action) {
    header('Content-Type: application/json');
    $input = json_decode(file_get_contents('php://input'), true);

    // API: LOGIN
    if ($action === 'login') {
        $username = trim($input['name'] ?? '');
        $password = trim($input['password'] ?? '');

        if (!$username || !$password) {
            echo json_encode(["success" => false, "message" => "Nama/No. Telepon dan password harus diisi."]);
            exit;
        }

        $stmt = $pdo->prepare("SELECT id, name, phone, password FROM users WHERE name = ? OR phone = ? LIMIT 1");
        $stmt->execute([$username, $username]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($password, $user['password'])) {
            echo json_encode(["success" => false, "message" => "Nama/No. Telepon atau password salah."]);
            exit;
        }

        echo json_encode([
            "success" => true,
            "message" => "Login berhasil.",
            "user" => ["id" => $user['id'], "name" => $user['name'], "phone" => $user['phone']]
        ]);
        exit;
    }

    // API: REGISTER (DAFTAR)
    if ($action === 'register') {
        $name     = trim($input['name'] ?? '');
        $phone    = trim($input['phone'] ?? '');
        $password = trim($input['password'] ?? '');

        if (!$name || !$phone || !$password) {
            echo json_encode(["success" => false, "message" => "Semua kolom pendaftaran wajib diisi."]);
            exit;
        }

        $check = $pdo->prepare("SELECT id FROM users WHERE phone = ? LIMIT 1");
        $check->execute([$phone]);
        if ($check->fetch()) {
            echo json_encode(["success" => false, "message" => "Nomor telepon sudah terdaftar di sistem."]);
            exit;
        }

        $hashed = password_hash($password, PASSWORD_BCRYPT);
        $insert = $pdo->prepare("INSERT INTO users (name, phone, password, created_at) VALUES (?, ?, ?, NOW())");
        if ($insert->execute([$name, $phone, $hashed])) {
            echo json_encode([
                "success" => true,
                "message" => "Akun berhasil didaftarkan!",
                "user" => ["id" => $pdo->lastInsertId(), "name" => $name, "phone" => $phone]
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Gagal mendaftar."]);
        }
        exit;
    }

    // API: FORGOT PASSWORD (RESET VIA NO TELEPON)
    if ($action === 'forgot_password') {
        $phone       = trim($input['phone'] ?? '');
        $newPassword = trim($input['new_password'] ?? '');

        if (!$phone || !$newPassword) {
            echo json_encode(["success" => false, "message" => "Nomor telepon dan password baru wajib diisi."]);
            exit;
        }

        if (strlen($newPassword) < 6) {
            echo json_encode(["success" => false, "message" => "Password baru minimal 6 karakter."]);
            exit;
        }

        $stmt = $pdo->prepare("SELECT id, name FROM users WHERE phone = ? LIMIT 1");
        $stmt->execute([$phone]);
        $user = $stmt->fetch();

        if (!$user) {
            echo json_encode(["success" => false, "message" => "Nomor telepon tidak ditemukan dalam database HAMKA."]);
            exit;
        }

        $hashed = password_hash($newPassword, PASSWORD_BCRYPT);
        $update = $pdo->prepare("UPDATE users SET password = ? WHERE id = ?");
        if ($update->execute([$hashed, $user['id']])) {
            echo json_encode(["success" => true, "message" => "Password untuk akun " . $user['name'] . " berhasil diperbarui! Silakan masuk."]);
        } else {
            echo json_encode(["success" => false, "message" => "Gagal memperbarui password."]);
        }
        exit;
    }

    // API: ABSEN (SIMPAN KEHADIRAN, FOTO KAMERA & GPS)
    if ($action === 'submit_absen') {
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

        if (!$name || !$department || !$activityName || !$photoBase64) {
            echo json_encode(["success" => false, "message" => "Semua data formulir dan foto kamera wajib diisi."]);
            exit;
        }

        // Simpan foto kamera ke direktori uploads
        $uploadDir = __DIR__ . '/uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        if (preg_match('/^data:image\/(\\w+);base64,/', $photoBase64, $type)) {
            $photoBase64 = substr($photoBase64, strpos($photoBase64, ',') + 1);
            $type = strtolower($type[1]);
            if (!in_array($type, ['jpg', 'jpeg', 'png'])) $type = 'jpg';
        } else {
            $type = 'jpg';
        }

        $photoDecoded = base64_decode($photoBase64);
        $filename = 'bukti-kehadiran-' . date('Ymd-His') . '-' . uniqid() . '.' . $type;
        file_put_contents($uploadDir . $filename, $photoDecoded);
        $relativePath = 'uploads/' . $filename;

        // Simpan ke MySQL phpMyAdmin
        $stmt = $pdo->prepare("INSERT INTO absensi 
            (user_id, name, department, date, activity_name, status, photo_filename, photo_path, latitude, longitude, location_name, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");

        if ($stmt->execute([$userId, $name, $department, $date, $activityName, $status, $filename, $relativePath, $latitude, $longitude, $locationName])) {
            echo json_encode([
                "success" => true,
                "message" => "Absensi berhasil dicatat!",
                "record" => [
                    "id" => $pdo->lastInsertId(),
                    "name" => $name,
                    "department" => $department,
                    "date" => $date,
                    "activity_name" => $activityName,
                    "status" => $status,
                    "photo_filename" => $filename,
                    "latitude" => $latitude,
                    "longitude" => $longitude,
                    "location_name" => $locationName
                ]
            ]);
        } else {
            echo json_encode(["success" => false, "message" => "Gagal menyimpan absensi."]);
        }
        exit;
    }

    // API: RIWAYAT ABSENSI
    if ($action === 'get_history') {
        $stmt = $pdo->query("SELECT * FROM absensi ORDER BY date DESC, created_at DESC");
        $data = $stmt->fetchAll();
        echo json_encode(["success" => true, "data" => $data]);
        exit;
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Absensi HAMKA — Portal Kehadiran Digital</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', system-ui, sans-serif; background-color: #f8fafc; color: #0f172a; }
  </style>
</head>
<body class="min-h-screen flex flex-col">

  <!-- HEADER BRAND -->
  <header class="w-full bg-white border-b border-slate-200 sticky top-0 z-30">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3 cursor-pointer" onclick="goToStep(1)">
        <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="48" fill="#FFFFFF" stroke="#0F2B48" stroke-width="2.5" />
          <circle cx="50" cy="50" r="39" fill="#0F2B48" />
          <circle cx="50" cy="50" r="35" fill="#FFFFFF" />
          <circle cx="50" cy="50" r="19" fill="#FFFBEB" stroke="#F59E0B" stroke-width="1.2" />
          <path d="M50 34C48.5 37 46 38.5 48.5 41C50 42.5 50 43.5 50 44C50 43.5 50 42.5 51.5 41C54 38.5 51.5 37 50 34Z" fill="#EF4444" />
          <path d="M50 52C45 49 39 49 36 50V58C39 57 45 57 50 60V52Z" fill="#0F2B48" />
          <path d="M50 52C55 49 61 49 64 50V58C61 57 55 57 50 60V52Z" fill="#0F2B48" />
          <rect x="33" y="66" width="34" height="10" rx="3" fill="#0F2B48" />
          <text x="50" y="73.5" text-anchor="middle" fill="#FFFFFF" font-size="6.8" font-weight="bold" font-family="sans-serif">HAMKA</text>
        </svg>
        <div>
          <h1 class="text-base font-bold text-[#0f274a] leading-tight">Absensi HAMKA</h1>
          <span class="text-[10px] uppercase font-semibold text-slate-500 tracking-wider">PORTAL KEHADIRAN DIGITAL</span>
        </div>
      </div>

      <div class="flex items-center gap-2 sm:gap-3">
        <button onclick="openHistoryModal()" class="text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition">
          Riwayat Absensi
        </button>
        <span id="user-badge" class="hidden text-xs bg-slate-50 border border-slate-200 px-3 py-1 rounded-full font-bold text-slate-800"></span>
        <button id="btn-logout" onclick="logoutUser()" class="hidden text-xs text-rose-600 hover:underline font-semibold">Keluar</button>
      </div>
    </div>
  </header>

  <!-- STEPPER 4 ALUR -->
  <div class="w-full bg-white border-b border-slate-200 py-3">
    <div class="max-w-4xl mx-auto px-4 flex items-center justify-between text-xs font-semibold">
      <div id="step-nav-1" class="flex items-center gap-1.5 text-[#0f274a] cursor-pointer" onclick="goToStep(1)">
        <span class="w-5 h-5 rounded-full bg-[#0f274a] text-white flex items-center justify-center text-[10px]">01</span>
        <span>Selamat datang</span>
      </div>
      <div class="flex-1 h-[1px] bg-slate-200 mx-3"></div>
      <div id="step-nav-2" class="flex items-center gap-1.5 text-slate-400 cursor-pointer" onclick="goToStep(2)">
        <span class="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">02</span>
        <span>Masuk</span>
      </div>
      <div class="flex-1 h-[1px] bg-slate-200 mx-3"></div>
      <div id="step-nav-3" class="flex items-center gap-1.5 text-slate-400 cursor-pointer" onclick="goToStep(3)">
        <span class="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">03</span>
        <span>Isi absensi</span>
      </div>
      <div class="flex-1 h-[1px] bg-slate-200 mx-3"></div>
      <div id="step-nav-4" class="flex items-center gap-1.5 text-slate-400">
        <span class="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">04</span>
        <span>Selesai</span>
      </div>
    </div>
  </div>

  <!-- CONTAINER UTAMA -->
  <main class="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">

    <!-- LAYAR 1: SELAMAT DATANG -->
    <section id="view-welcome" class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
      <div class="md:col-span-7 space-y-5">
        <span class="inline-block px-3 py-1 bg-slate-100 border border-slate-200 text-[#0f274a] rounded-full text-xs font-bold uppercase tracking-wider">
          SELAMAT DATANG DI HAMKA
        </span>
        <h2 class="text-3xl sm:text-5xl font-extrabold text-[#0f274a] leading-tight">
          Setiap kehadiran, <br/>bagian dari kontribusi.
        </h2>
        <p class="text-sm text-slate-600 leading-relaxed max-w-lg">
          Catat kehadiran kegiatan Anda dengan mudah dan tertib. Masuk, lengkapi formulir, dan ambil foto kamera langsung beserta kunci lokasi GPS otomatis.
        </p>
        <button onclick="startAttendanceFlow()" class="bg-[#0f274a] hover:bg-[#163a69] text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-md transition">
          Mulai absensi &rarr;
        </button>
      </div>

      <div class="md:col-span-5 flex justify-center">
        <div class="bg-[#0f274a] rounded-2xl p-8 text-center text-white w-full max-w-sm shadow-xl">
          <div class="bg-white rounded-xl py-8 px-6 text-[#0f274a] shadow mb-4 flex flex-col items-center">
            <h3 class="text-xl font-bold tracking-wider">HAMKA</h3>
            <p class="text-[10px] uppercase font-bold text-slate-400 mt-1">Portal Kehadiran Digital</p>
          </div>
          <p class="text-xs text-slate-300">Kehadiran tercatat. Kontribusi Anda berarti.</p>
        </div>
      </div>
    </section>

    <!-- LAYAR 2: AUTENTIKASI -->
    <section id="view-auth" class="hidden max-w-md mx-auto bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
      <div class="flex border-b border-slate-200 pb-2 mb-4 text-xs font-bold gap-4">
        <button id="tab-login" onclick="switchAuthTab('login')" class="text-[#0f274a] border-b-2 border-[#0f274a] pb-1">Masuk</button>
        <button id="tab-register" onclick="switchAuthTab('register')" class="text-slate-400 pb-1">Daftar</button>
        <button id="tab-forgot" onclick="switchAuthTab('forgot')" class="text-slate-400 pb-1">Lupa Password</button>
      </div>

      <div id="auth-alert" class="hidden p-3 rounded-lg text-xs mb-4"></div>

      <!-- FORM LOGIN -->
      <form id="form-login" onsubmit="handleLoginSubmit(event)" class="space-y-4">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Nama atau Nomor Telepon</label>
          <input type="text" id="login-name" required value="Ahmad Naufal" class="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Password</label>
          <input type="password" id="login-pass" required value="password123" class="w-full text-xs px-3 py-2 border rounded-lg focus:outline-none" />
        </div>
        <button type="submit" class="w-full bg-[#0f274a] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#163a69]">Masuk ke Akun</button>
      </form>

      <!-- FORM REGISTER (DAFTAR) -->
      <form id="form-register" onsubmit="handleRegisterSubmit(event)" class="hidden space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Lengkap</label>
          <input type="text" id="reg-name" required class="w-full text-xs px-3 py-2 border rounded-lg" placeholder="Contoh: Fatimah Zahra" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon</label>
          <input type="tel" id="reg-phone" required class="w-full text-xs px-3 py-2 border rounded-lg" placeholder="081234567890" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Password</label>
          <input type="password" id="reg-pass" required class="w-full text-xs px-3 py-2 border rounded-lg" placeholder="Minimal 6 karakter" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Konfirmasi Password</label>
          <input type="password" id="reg-confirm" required class="w-full text-xs px-3 py-2 border rounded-lg" placeholder="Ketik ulang password" />
        </div>
        <button type="submit" class="w-full bg-[#0f274a] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#163a69]">Daftar Akun Baru</button>

        <div class="text-center pt-2">
          <button type="button" onclick="switchAuthTab('forgot')" class="text-xs text-amber-700 hover:underline">
            Lupa password? Reset atau buat ulang di sini
          </button>
        </div>
      </form>

      <!-- FORM LUPA PASSWORD -->
      <form id="form-forgot" onsubmit="handleForgotSubmit(event)" class="hidden space-y-3">
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Nomor Telepon Terdaftar</label>
          <input type="tel" id="forgot-phone" required class="w-full text-xs px-3 py-2 border rounded-lg" placeholder="Contoh: 081234567890" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Password Baru</label>
          <input type="password" id="forgot-newpass" required class="w-full text-xs px-3 py-2 border rounded-lg" placeholder="Minimal 6 karakter" />
        </div>
        <div>
          <label class="block text-xs font-semibold text-slate-700 mb-1">Konfirmasi Password Baru</label>
          <input type="password" id="forgot-confirmpass" required class="w-full text-xs px-3 py-2 border rounded-lg" placeholder="Ketik ulang password baru" />
        </div>
        <button type="submit" class="w-full bg-amber-600 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-amber-700">Simpan Password Baru</button>
      </form>
    </section>

    <!-- LAYAR 3: FORMULIR ABSENSI & KAMERA LANGSUNG + GPS -->
    <section id="view-form" class="hidden grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      <div class="md:col-span-8 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-md">
        <h3 class="text-xl font-bold text-[#0f274a] mb-1">Formulir absensi</h3>
        <p class="text-xs text-slate-500 mb-5">Lengkapi data kehadiran dan foto langsung menggunakan kamera serta kunci GPS perangkat.</p>

        <form id="attendance-form" onsubmit="handleAttendanceSubmit(event)" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nama *</label>
              <input type="text" id="att-name" required class="w-full text-xs px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Departemen *</label>
              <select id="att-dept" class="w-full text-xs px-3 py-2 border rounded-lg">
                <option value="Departemen organisasi">Departemen organisasi</option>
                <option value="departemen penelitian dan pengembangan">Departemen penelitian dan pengembangan</option>
                <option value="departemen eksternal">Departemen eksternal</option>
                <option value="departemen komunikasi dan informasi">Departemen komunikasi dan informasi</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Tanggal *</label>
              <input type="date" id="att-date" required class="w-full text-xs px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-slate-700 mb-1">Nama Kegiatan *</label>
              <input type="text" id="att-activity" required value="Rapat Koordinasi Departemen" class="w-full text-xs px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Keterangan Kehadiran *</label>
            <div class="grid grid-cols-3 gap-2">
              <label class="flex items-center justify-center gap-1.5 p-2 bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer has-[:checked]:bg-[#0f274a] has-[:checked]:text-white">
                <input type="radio" name="status" value="Hadir" checked class="hidden" /> Hadir
              </label>
              <label class="flex items-center justify-center gap-1.5 p-2 bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer has-[:checked]:bg-[#0f274a] has-[:checked]:text-white">
                <input type="radio" name="status" value="Sakit" class="hidden" /> Sakit
              </label>
              <label class="flex items-center justify-center gap-1.5 p-2 bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer has-[:checked]:bg-[#0f274a] has-[:checked]:text-white">
                <input type="radio" name="status" value="Izin" class="hidden" /> Izin
              </label>
            </div>
          </div>

          <!-- KARTU AKTIVASI GPS WAJIB -->
          <div id="gps-card" class="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900">
            <div class="flex items-center justify-between mb-1.5">
              <span class="font-bold flex items-center gap-1">📍 Lokasi GPS Perangkat</span>
              <span id="gps-status-pill" class="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">Wajib Diaktifkan</span>
            </div>
            <p id="gps-text" class="text-[11px] text-slate-600 mb-2">Harap nyalakan GPS perangkat Anda untuk mengunci nama lokasi secara akurat.</p>
            <button type="button" onclick="activateDeviceGps()" class="bg-[#0f274a] text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#163a69]">
              Nyalakan & Kunci GPS Akurat
            </button>
          </div>

          <!-- KAMERA LANGSUNG WEBRTC -->
          <div>
            <label class="block text-xs font-semibold text-slate-700 mb-1">Bukti Foto Kamera Langsung *</label>
            <div class="relative bg-slate-950 rounded-xl overflow-hidden min-h-[240px] flex items-center justify-center text-white">
              <video id="webcam-video" autoplay playsinline muted class="w-full h-60 object-cover"></video>
              <img id="captured-img" class="hidden w-full h-60 object-cover" alt="Captured" />
              
              <div id="camera-overlay" class="absolute bottom-2 inset-x-2 flex items-center justify-between p-2 bg-black/60 backdrop-blur rounded-lg">
                <button type="button" id="btn-snap" onclick="takeSnapshot()" class="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-bold">
                  Ambil Foto Kehadiran
                </button>
                <button type="button" id="btn-retake" onclick="retakePhoto()" class="hidden bg-white text-slate-900 px-3 py-1 rounded text-xs font-bold">
                  Ambil Ulang
                </button>
                <span class="text-[10px] text-slate-300 font-mono">Kamera Terverifikasi</span>
              </div>
            </div>
          </div>

          <button type="submit" class="w-full bg-[#0f274a] text-white py-3 rounded-lg text-xs font-bold hover:bg-[#163a69] transition">
            Kirim absensi
          </button>
        </form>
      </div>

      <!-- SIDEBAR INFO -->
      <div class="md:col-span-4 space-y-4">
        <div class="bg-[#0f274a] text-white rounded-2xl p-6 shadow-md text-xs space-y-3">
          <h4 class="font-bold uppercase tracking-wider text-blue-200">Sebelum mengirim</h4>
          <p><strong class="text-white">Aktifkan GPS Perangkat:</strong> Nyalakan fitur Lokasi/GPS pada HP/Laptop Anda agar nama lokasi tercatat akurat.</p>
          <p><strong class="text-white">Foto Kamera Langsung:</strong> Sistem otomatis menolak upload file dari galeri untuk mencegah manipulasi presensi.</p>
        </div>
      </div>
    </section>

    <!-- LAYAR 4: SUKSES -->
    <section id="view-success" class="hidden max-w-lg mx-auto bg-white border border-slate-200 rounded-2xl p-8 shadow-xl text-center">
      <div class="w-16 h-16 rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
        ✓
      </div>
      <span class="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">ABSENSI BERHASIL DIKIRIM</span>
      <h3 class="text-2xl font-extrabold text-slate-900 mt-1 mb-2">Anda sudah absensi</h3>
      <p class="text-xs text-slate-500 mb-5">Kehadiran Anda telah dicatat ke database phpMyAdmin.</p>

      <div id="success-summary" class="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2 mb-6"></div>

      <button onclick="goToStep(1)" class="w-full bg-[#0f274a] text-white py-2.5 rounded-lg text-xs font-bold hover:bg-[#163a69]">
        Selesai
      </button>
    </section>

  </main>

  <!-- MODAL RIWAYAT ABSENSI -->
  <div id="modal-history" class="hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
      <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h4 class="font-bold text-slate-900 text-sm">Riwayat Absensi Kehadiran HAMKA</h4>
        <button onclick="closeHistoryModal()" class="text-slate-400 hover:text-slate-700 font-bold">✕</button>
      </div>
      <div class="p-6 overflow-y-auto flex-1">
        <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 border-b text-[10px] uppercase font-bold text-slate-600">
            <tr>
              <th class="p-2">Nama</th>
              <th class="p-2">Departemen</th>
              <th class="p-2">Tanggal</th>
              <th class="p-2">Kegiatan</th>
              <th class="p-2">Lokasi</th>
              <th class="p-2">Status</th>
            </tr>
          </thead>
          <tbody id="history-tbody" class="divide-y divide-slate-100"></tbody>
        </table>
      </div>
    </div>
  </div>

  <footer class="w-full bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
    © 2026 HAMKA. Seluruh hak cipta dilindungi.
  </footer>

  <script>
    let currentUser = null;
    let currentPhotoBase64 = null;
    let currentGps = null;
    let mediaStream = null;

    document.getElementById('att-date').value = new Date().toISOString().slice(0, 10);

    function goToStep(step) {
      document.getElementById('view-welcome').classList.add('hidden');
      document.getElementById('view-auth').classList.add('hidden');
      document.getElementById('view-form').classList.add('hidden');
      document.getElementById('view-success').classList.add('hidden');

      if (step === 1) document.getElementById('view-welcome').classList.remove('hidden');
      if (step === 2) document.getElementById('view-auth').classList.remove('hidden');
      if (step === 3) {
        document.getElementById('view-form').classList.remove('hidden');
        startCamera();
        activateDeviceGps();
      }
      if (step === 4) document.getElementById('view-success').classList.remove('hidden');
    }

    function startAttendanceFlow() {
      if (currentUser) {
        goToStep(3);
      } else {
        goToStep(2);
      }
    }

    function switchAuthTab(tab) {
      document.getElementById('form-login').classList.add('hidden');
      document.getElementById('form-register').classList.add('hidden');
      document.getElementById('form-forgot').classList.add('hidden');
      document.getElementById('auth-alert').classList.add('hidden');

      if (tab === 'login') document.getElementById('form-login').classList.remove('hidden');
      if (tab === 'register') document.getElementById('form-register').classList.remove('hidden');
      if (tab === 'forgot') document.getElementById('form-forgot').classList.remove('hidden');
    }

    async function handleLoginSubmit(e) {
      e.preventDefault();
      const res = await fetch('?action=login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('login-name').value,
          password: document.getElementById('login-pass').value
        })
      });
      const data = await res.json();
      if (data.success) {
        setUserSession(data.user);
        goToStep(3);
      } else {
        showAlert(data.message, 'error');
      }
    }

    async function handleRegisterSubmit(e) {
      e.preventDefault();
      const pass = document.getElementById('reg-pass').value;
      const confirm = document.getElementById('reg-confirm').value;
      if (pass !== confirm) return showAlert('Konfirmasi password tidak sesuai!', 'error');

      const res = await fetch('?action=register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: document.getElementById('reg-name').value,
          phone: document.getElementById('reg-phone').value,
          password: pass
        })
      });
      const data = await res.json();
      if (data.success) {
        setUserSession(data.user);
        goToStep(3);
      } else {
        showAlert(data.message, 'error');
      }
    }

    async function handleForgotSubmit(e) {
      e.preventDefault();
      const newpass = document.getElementById('forgot-newpass').value;
      const confirmpass = document.getElementById('forgot-confirmpass').value;
      if (newpass !== confirmpass) return showAlert('Konfirmasi password baru tidak cocok!', 'error');

      const res = await fetch('?action=forgot_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: document.getElementById('forgot-phone').value,
          new_password: newpass
        })
      });
      const data = await res.json();
      showAlert(data.message, data.success ? 'success' : 'error');
      if (data.success) {
        setTimeout(() => switchAuthTab('login'), 1500);
      }
    }

    function setUserSession(user) {
      currentUser = user;
      document.getElementById('att-name').value = user.name;
      document.getElementById('user-badge').textContent = user.name;
      document.getElementById('user-badge').classList.remove('hidden');
      document.getElementById('btn-logout').classList.remove('hidden');
    }

    function logoutUser() {
      currentUser = null;
      document.getElementById('user-badge').classList.add('hidden');
      document.getElementById('btn-logout').classList.add('hidden');
      goToStep(1);
    }

    function showAlert(msg, type) {
      const box = document.getElementById('auth-alert');
      box.textContent = msg;
      box.className = `p-3 rounded-lg text-xs mb-4 ${type === 'success' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`;
      box.classList.remove('hidden');
    }

    function activateDeviceGps() {
      document.getElementById('gps-status-pill').textContent = 'Mencari Satelit GPS...';
      document.getElementById('gps-status-pill').className = 'text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-bold';

      if (!navigator.geolocation) {
        document.getElementById('gps-text').textContent = 'Perangkat Anda tidak mendukung fitur GPS.';
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const acc = Math.round(pos.coords.accuracy || 10);

          let locName = `Koordinat: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=19`);
            const json = await res.json();
            if (json && json.display_name) locName = json.display_name.split(',').slice(0, 4).join(', ');
          } catch(e) {}

          currentGps = { latitude: lat, longitude: lng, location_name: locName };
          document.getElementById('gps-status-pill').textContent = 'GPS Aktif & Akurat';
          document.getElementById('gps-status-pill').className = 'text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold';
          document.getElementById('gps-text').innerHTML = `<strong>${locName}</strong><br/><span class="font-mono text-slate-500">Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)} (Akurasi: ±${acc}m)</span>`;
        },
        (err) => {
          document.getElementById('gps-status-pill').textContent = 'GPS Belum Nyala';
          document.getElementById('gps-status-pill').className = 'text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded font-bold';
          document.getElementById('gps-text').textContent = 'Mohon nyalakan fitur GPS pada perangkat HP/Laptop Anda dan izinkan browser mendeteksi lokasi.';
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
        mediaStream = stream;
        document.getElementById('webcam-video').srcObject = stream;
        document.getElementById('webcam-video').classList.remove('hidden');
        document.getElementById('captured-img').classList.add('hidden');
        document.getElementById('btn-snap').classList.remove('hidden');
        document.getElementById('btn-retake').classList.add('hidden');
      } catch (e) {
        alert('Gagal membuka kamera langsung. Pastikan Anda mengizinkan akses kamera.');
      }
    }

    function takeSnapshot() {
      const video = document.getElementById('webcam-video');
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      ctx.fillStyle = 'rgba(15, 39, 74, 0.8)';
      ctx.fillRect(8, canvas.height - 42, canvas.width - 16, 34);
      ctx.fillStyle = '#ffffff';
      ctx.font = '11px sans-serif';
      const now = new Date();
      ctx.fillText(`HAMKA ABSENSI • ${now.toLocaleDateString()} ${now.toLocaleTimeString()}`, 16, canvas.height - 25);
      if (currentGps) {
        ctx.fillStyle = '#38bdf8';
        ctx.fillText(`📍 ${currentGps.location_name.slice(0, 48)}`, 16, canvas.height - 12);
      }

      currentPhotoBase64 = canvas.toDataURL('image/jpeg', 0.85);
      document.getElementById('captured-img').src = currentPhotoBase64;
      document.getElementById('captured-img').classList.remove('hidden');
      document.getElementById('webcam-video').classList.add('hidden');
      document.getElementById('btn-snap').classList.add('hidden');
      document.getElementById('btn-retake').classList.remove('hidden');
    }

    function retakePhoto() {
      currentPhotoBase64 = null;
      startCamera();
    }

    async function handleAttendanceSubmit(e) {
      e.preventDefault();
      if (!currentPhotoBase64) return alert('Wajib mengambil foto kamera langsung terlebih dahulu!');

      const statusVal = document.querySelector('input[name="status"]:checked').value;
      const payload = {
        user_id: currentUser ? currentUser.id : null,
        name: document.getElementById('att-name').value,
        department: document.getElementById('att-dept').value,
        date: document.getElementById('att-date').value,
        activity_name: document.getElementById('att-activity').value,
        status: statusVal,
        photo_base64: currentPhotoBase64,
        latitude: currentGps ? currentGps.latitude : null,
        longitude: currentGps ? currentGps.longitude : null,
        location_name: currentGps ? currentGps.location_name : 'Lokasi Terdeteksi'
      };

      const res = await fetch('?action=submit_absen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById('success-summary').innerHTML = `
          <div><strong>Nama:</strong> ${payload.name}</div>
          <div><strong>Departemen:</strong> ${payload.department}</div>
          <div><strong>Tanggal:</strong> ${payload.date}</div>
          <div><strong>Kegiatan:</strong> ${payload.activity_name}</div>
          <div><strong>Keterangan:</strong> <span class="font-bold text-emerald-600">${payload.status}</span></div>
          <div><strong>Lokasi Presensi:</strong> 📍 ${payload.location_name}</div>
        `;
        goToStep(4);
      } else {
        alert(data.message);
      }
    }

    async function openHistoryModal() {
      document.getElementById('modal-history').classList.remove('hidden');
      const res = await fetch('?action=get_history');
      const json = await res.json();
      const tbody = document.getElementById('history-tbody');
      tbody.innerHTML = '';
      if (json.data && json.data.length > 0) {
        json.data.forEach(r => {
          tbody.innerHTML += `
            <tr class="hover:bg-slate-50">
              <td class="p-2 font-bold">${r.name}</td>
              <td class="p-2">${r.department}</td>
              <td class="p-2">${r.date}</td>
              <td class="p-2">${r.activity_name}</td>
              <td class="p-2 text-slate-600">${r.location_name || '-'}</td>
              <td class="p-2 font-bold ${r.status === 'Hadir' ? 'text-emerald-600' : 'text-amber-600'}">${r.status}</td>
            </tr>
          `;
        });
      } else {
        tbody.innerHTML = '<tr><td colspan="6" class="p-4 text-center text-slate-400">Belum ada catatan absensi.</td></tr>';
      }
    }

    function closeHistoryModal() {
      document.getElementById('modal-history').classList.add('hidden');
    }
  </script>
</body>
</html>
