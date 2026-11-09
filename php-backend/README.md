# PANDUAN LENGKAP BACKEND PHP & DATABASE PHPMYADMIN (ABSENSI HAMKA)

Dokumen ini menjelaskan secara rinci bagian mana yang termasuk **Database (phpMyAdmin)** dan bagaimana cara menjalankan seluruh berkas backend PHP ini di lingkungan lokal Anda (seperti XAMPP / Laragon).

---

## 1. PENJELASAN BAGIAN SISTEM: MANA YANG DATABASE?

Dalam arsitektur aplikasi ini, sistem terbagi menjadi 3 bagian:

1. **BAGIAN DATABASE (MySQL via phpMyAdmin):**
   - **Lokasi Berkas SQL:** `php-backend/database.sql`
   - **Nama Database:** `absensi_hamka`
   - **Tabel 1 (`users`):** Menyimpan identitas akun pengguna (ID, Nama, Nomor Telepon, Hash Password Bcrypt, Tanggal Daftar).
   - **Tabel 2 (`absensi`):** Menyimpan riwayat kehadiran harian (ID, Relasi User, Nama, Departemen, Tanggal, Nama Kegiatan, Keterangan Hadir/Sakit/Izin, Nama & Path File Foto Kamera, Waktu Presensi).
   - **Pengelola:** Web interface **phpMyAdmin** (`http://localhost/phpmyadmin`).

2. **BAGIAN BACKEND (Bahasa Pemrograman PHP):**
   - Berkas skrip PHP yang memproses permintaan dari website:
     - `config.php`: Menyambungkan PHP ke database MySQL phpMyAdmin via PDO.
     - `login.php`: Memvalidasi login dengan nama/nomor telepon dan verifikasi bcrypt password.
     - `register.php`: Mendaftarkan nama, nomor telepon, dan enkripsi password.
     - `reset_password.php`: Mengubah kata sandi pengguna berdasarkan nomor telepon terdaftar.
     - `absen.php`: Menerima data presensi dan menyimpan foto selfie kamera dari base64 ke folder `/uploads/`.
     - `riwayat.php`: Menampilkan daftar kehadiran harian dengan filter tanggal/status/departemen.

3. **BAGIAN FRONTEND (Tampilan Website):**
   - Tampilan web antarmuka sesuai desain HAMKA. Mengakses kamera langsung melalui WebRTC (`navigator.mediaDevices.getUserMedia`) dan memblokir upload foto galeri.

---

## 2. CARA INSTALASI & MENJALANKAN DI XAMPP / LARAGON

### Langkah 1: Impor Database ke phpMyAdmin
1. Buka XAMPP Control Panel, lalu klik **Start** pada modul **Apache** dan **MySQL**.
2. Buka browser dan kunjungi: `http://localhost/phpmyadmin`.
3. Klik tab menu **SQL** di bagian atas phpMyAdmin.
4. Buka berkas `database.sql`, salin seluruh isinya, dan tempelkan ke dalam kotak input SQL phpMyAdmin.
5. Klik tombol **Go** (Kirim) di kanan bawah. Database `absensi_hamka` beserta tabel dan data awal akan langsung terbuat!

### Langkah 2: Pindahkan Berkas PHP ke Server Web
1. Salin folder `php-backend` ke dalam folder `htdocs` XAMPP Anda:
   - Contoh lokasi di Windows: `C:\xampp\htdocs\absensi-hamka-api\`
2. Pastikan di dalam folder tersebut terdapat folder `uploads/` dengan izin tulis (write permission).
3. Anda dapat menguji koneksi dengan membuka: `http://localhost/absensi-hamka-api/riwayat.php` di peramban Anda.

---

## 3. CONTOH AKUN UJI COBA
Database sudah dilengkapi dengan akun contoh:
- **Nama:** Ahmad Naufal
- **Nomor Telepon:** 081234567890
- **Password:** password123
