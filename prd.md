# Product Requirement Document (PRD)
## Sistem Informasi Pembuatan & Manajemen Kartu Pelajar Digital

---

## 1. Ringkasan Produk (Product Overview)
Sistem Informasi Kartu Pelajar adalah platform berbasis web yang dirancang untuk memfasilitasi pembuatan, pengelolaan, dan pencetakan kartu identitas siswa secara otomatis. Siswa dapat mendaftar mandiri dan langsung mendapatkan kartu pelajar digital dengan integrasi QR Code dinamis berbasis NISN. Di sisi pengelola, admin memiliki kendali penuh terhadap manajemen data siswa, konfigurasi template/tata letak kartu, hingga konten landing page.

---

## 2. Target Pengguna & Persona

| Role | Deskripsi | Kebutuhan Utama |
| :--- | :--- | :--- |
| **Siswa / Calon Siswa** | Pengguna yang mendaftarkan data diri dan memerlukan kartu pelajar digital. | Mengisi formulir pendaftaran, mengelola profil, melihat preview kartu, dan mengunduh/mencetak kartu. |
| **Administrator Sekolah** | Tim TU / Pengelola Sistem Sekolah. | Memverifikasi & mengelola data siswa, mengatur template/layout kartu, serta mengontrol konten landing page. |

---

## 3. Fitur Utama & Kebutuhan Fungsional

### 3.1. Frontend & Landing Page
* **Hero & Konten Edukasi:**
  * Penjelasan tentang Kartu Pelajar Digital dan fungsinya.
  * Manfaat/keunggulan kartu pelajar digital (akses instan, QR Code terintegrasi, cetak mandiri).
* **Navigasi & CTA (Call to Action):**
  * Tombol **Daftar Sekarang** dan **Login** di Hero Section.
  * Menu navigasi di header kanan atas: `Beranda`, `Tentang`, `Keunggulan`, tombol `Login`, dan tombol `Daftar`.

---

### 3.2. Modul Autentikasi & Registrasi Siswa
* **Form Pendaftaran Mandiri Siswa:**
  * Unggah Foto Profil (Format: JPG/PNG, maks. 2MB).
  * Nama Lengkap.
  * NIK (16 digit angka).
  * NISN (10 digit angka).
  * Tempat Lahir & Tanggal Lahir (Datepicker).
  * Agama (Dropdown opsi standar).
  * Konsentrasi Keahlian / Jurusan (Dropdown).
  * Alamat Lengkap.
  * Email (Validasi format email unik).
  * Password & Konfirmasi Password (Enkripsi hashing).
* **Login Siswa:**
  * Input Email dan Password.
  * Fitur *Remember Me* dan *Forgot Password* (opsional).

---

### 3.3. Dashboard Siswa
1. **Menu Profil Siswa (CRUD Profil):**
   * **Read:** Menampilkan informasi biodata yang telah didaftarkan.
   * **Update:** Memperbarui data diri atau mengganti pas foto jika ada kesalahan input.
2. **Menu Kartu Pelajar & Cetak:**
   * **Dynamic Card Rendering:** Sistem otomatis menempelkan data siswa ke atas template kartu aktif yang telah diunggah admin.
   * **Elemen yang Ditampilkan pada Kartu:**
     * Pas Foto Siswa.
     * QR Code dinamis (dihasilkan otomatis dari string NISN).
     * Nama Siswa.
     * NIK.
     * NISN.
     * Tempat, Tanggal Lahir.
     * Agama.
     * Konsentrasi Keahlian.
     * Alamat.
   * **Fungsi Export/Cetak:**
     * Tombol **Cetak Kartu / Download PDF** (ukuran standar ID Card CR80: 85.60 mm × 53.98 mm atau resolusi cetak 300 DPI).

---

### 3.4. Dashboard Admin
1. **Manajemen Data Siswa (CRUD Master Data):**
   * Melihat daftar seluruh siswa terdaftar lengkap dengan fitur pencarian, filter jurusan, dan pagination.
   * Tambah data siswa secara manual atau via Import Excel/CSV.
   * Edit biodata siswa dan reset password siswa.
   * Hapus data siswa.
   * Fitur cetak kartu massal (*Batch Card Print*).
2. **Pengaturan Desain & Template Kartu:**
   * **Upload Template Kartu:** Unggah gambar background kartu (sisi depan dan/atau belakang).
   * **Orientasi Kartu:** Pilihan *Landscape* (horizontal) atau *Portrait* (vertikal).
   * **Ukuran Kartu:** Konfigurasi dimensi kartu (standar ID Card atau ukuran kustom).
   * **Visual Coordinates / Overlay Settings:** Penyesuaian koordinat X & Y untuk posisi Pas Foto, QR Code, dan baris-baris teks biodata agar pas di atas desain template.
3. **Pengaturan Konten Landing Page (CMS Mini):**
   * Mengubah teks judul (*Hero Title*), deskripsi pembuka, dan logo sekolah.
   * Mengelola poin-poin keunggulan kartu pelajar.
   * Mengatur informasi kontak dan footer sekolah.
4. **Pengaturan Master Data & Sistem:**
   * Manajemen daftar master Konsentrasi Keahlian / Jurusan.
   * Manajemen akun Admin (tambah/edit/hapus role admin).

---

## 4. Struktur Data & Entitas Utama

### `users`
* `id` (PK)
* `email` (Unique)
* `password` (Hashed)
* `role` (enum: `admin`, `siswa`)
* `created_at`, `updated_at`

### `student_profiles`
* `id` (PK)
* `user_id` (FK to `users.id`)
* `nisn` (Unique)
* `nik` (Unique)
* `full_name`
* `photo_path`
* `birth_place`
* `birth_date`
* `religion`
* `major_id` (FK to `majors.id`)
* `address`
* `created_at`, `updated_at`

### `card_templates`
* `id` (PK)
* `template_name`
* `background_image_path`
* `orientation` (enum: `landscape`, `portrait`)
* `width_mm`, `height_mm`
* `layout_coordinates` (JSON: memuat posisi X, Y, font-size dari foto, QR code, dan masing-masing teks)
* `is_active` (boolean)

---

## 5. Kebutuhan Non-Fungsional

* **Security:** Enkripsi password menggunakan `bcrypt`/`Argon2`. Validasi sisi server untuk tipe dan ukuran unggahan gambar guna mencegah celah eksekusi file berbahaya.
* **Performance:** Kompresi otomatis pas foto siswa saat diunggah untuk menghemat bandwidth dan mempercepat proses rendering kartu.
* **Compatibility & Responsiveness:** Desain web responsif diakses melalui Desktop, Tablet, maupun Smartphone. Output cetak PDF presisi 1:1 saat dicetak pada kartu PVC/kertas ID Card.
* **Reliability:** Library QR Code generator yang cepat dan minim latensi pemrosesan.

---

## 6. Alur Pengguna (User Flow)
[Pengunjung Web]
│
▼
[Landing Page] ───────► [Formulir Registrasi]
│ (Submit Data & Foto)
▼
[Login Siswa]
│
▼
[Dashboard Siswa]
├──► Edit Data Diri (Profil)
└──► Preview & Download/Cetak Kartu Siswa (Ada QR Code NISN)