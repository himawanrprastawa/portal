# Product Requirements Document (PRD)

**Project Name:** BSM Operations & Validation Portal  
**Document Status:** Production Release v2.3 (Enterprise Operations, Finance Ledger & Field Validation Edition)  
**Date:** September 15, 2026  
**Primary Users:** Supervisor, Team Leader, Zone Manager, Manager Operasional, General Manager, Finance, Direksi / Owner, HRD, Field Worker / Driver (Lapangan), System Administrator (Master Admin)  

---

## 1. Project Overview

### 1.1 Objective
Membangun platform portal operasional perusahaan terpadu (*BSM Operations & Validation Portal*) berbasis arsitektur **Unified Monorepo**: antarmuka modern **React 18 Single Page Application (SPA)** yang terintegrasi langsung di dalam **Framework Laravel 12 / 11 (PHP 8.3+)**. Platform ini tersentralisasi untuk mengotomatisasi pengajuan dana operasional darurat (*Comcase*), otorisasi berjenjang berkas surat permohonan eksternal via tanda tangan digital (PDF 5-Tahap), pencatatan transaksi buku kas operasional (*Dual Transaction Mode: Deposit & Kredit*) & integrasi Google Docs, manajemen personalia karyawan PKWT, inventarisasi armada kendaraan & penugasan aset, serta alur validasi nota BBM lapangan khusus driver dengan verifikasi 3 foto terstandarisasi.

### 1.2 Problem Statement & Solutions
*   **Struktur Unified Monorepo Terpadu:** Mengonsolidasikan seluruh kode frontend React (`laravel/frontend-react/`), aset produksi (`laravel/public/`), dan backend API ke dalam satu direktori terpadu `laravel/`, mengeliminasi penumpukan folder usang di root server.
*   **Framework Enterprise (Laravel 12 / 11):** Menggunakan arsitektur MVC modern yang dilengkapi Eloquent ORM, dependency injection, Laravel Sanctum token authentication, dan centralized routing API yang terstandarisasi.
*   **Keamanan & Otorisasi Ketat (Strict RBAC):** Mencegah akses lintas divisi dengan sistem proteksi rute ganda (*Sidebar dynamic hiding*, *Route guards*, dan *Action-level permission checks*).
*   **Isolasi Antarmuka Khusus Lapangan / Driver:** Pengguna lapangan/driver hanya dapat mengakses modul tugas mereka (*Validasi Nota BBM* dan *Armada*). Menu eksekutif seperti *Dashboard Utama* disembunyikan sepenuhnya dari navigasi dan sesi login langsung diarahkan ke form validasi.
*   **Manajemen Buku Kas & Monitoring BBM (Finance):** Menyediakan sistem pencatatan kas dua arah (Deposit/Kas Masuk & Pengeluaran/Kas Keluar), pemantauan saldo riil aktif, penghitungan selisih uang BBM yang belum divalidasi, aksi hapus transaksi terintegrasi, serta input format titik ribuan (*thousand separator*) untuk mencegah kesalahan penulisan angka nol.
*   **Autentikasi Foto Lapangan Terstandarisasi:** Mengeliminasi manipulasi biaya BBM melalui verifikasi 3 foto sejajar berlatar transparan (Foto Struk BBM, Foto Odometer Sebelum Pengisian, dan Foto Odometer Sesudah Pengisian).
*   **Matriks Otorisasi Dinamis:** Master Admin dapat secara fleksibel mencentang atau mencabut hak akses setiap peran (role) melalui *Matriks Hak Akses & Otorisasi Fitur* tanpa perlu mengubah kode sumber.
*   **Otorisasi Digital Berkas Resmi (5-Tahap):** Menggantikan tanda tangan basah manual dengan alur tanda tangan digital 5-tahap langsung pada berkas PDF permohonan dana eksternal.
*   **Manajemen Kontrak PKWT Karyawan:** Menghindari kelalaian perpanjangan kontrak kerja dengan sistem notifikasi peringatan dini H-30 hari sebelum masa berlaku PKWT berakhir.

---

## 2. User Roles & Role-Based Access Control (RBAC)

Portal BSM mengimplementasikan 9 peran operasional ditambah 1 peran Master Administrator:

| Peran (Role) | Tanggung Jawab & Hak Akses Utama | Akses Menu Sidebar |
| :--- | :--- | :--- |
| **Master Admin** | **Akses Super Administrator Penuh:** Mengelola akun pengguna aktif, mereset password, menetapkan nama akun dari master data karyawan, dan mengatur centang izin pada Matriks Hak Akses & Otorisasi Fitur. | Seluruh Menu Portal (Dashboard, Kotak Masuk, Comcase, External, Finance, Karyawan, Armada, User BBM, Matriks Otoritas) |
| **Supervisor** | **Operasional Lapangan & Pengajuan Comcase:** Mengisi formulir *Request Comcase Baru* untuk kebutuhan darurat site/project, memantau riwayat pengajuan tim di *Daftar Comcase*, dan melihat armada mobil operasional. | Dashboard Utama, Permohonan Comcase, Armada |
| **Team Leader (TL)** | **Koordinator Lapangan & Tim:** Mengajukan dan memantau status Comcase tim operasional, mengawasi ketersediaan armada, dan memonitor pengisian BBM lapangan. | Dashboard Utama, Permohonan Comcase, Armada |
| **Zone Manager** | **Manajemen Zona Operasional & Requester PDF:** Mereview & memverifikasi permohonan Comcase tingkat zona, mengunggah dokumen surat permohonan eksternal baru, menandatangani digital sebagai **TTD 1 (Requester)**, dan memantau progres persetujuan dokumen. | Dashboard Utama, Review Comcase, Permohonan External, Armada |
| **Manager (Manager Ops)** | **Otorisasi Manajerial & Checker 1:** Membuka antrian persetujuan di *Kotak Masuk*, menyetujui/menolak berkas Comcase dengan catatan verifikasi, dan membubuhkan tanda tangan digital sebagai **TTD 2 (Checker Manager)** pada berkas PDF permohonan eksternal. | Dashboard Utama, Kotak Masuk (Inbox, Data Comcase, Data External), Armada |
| **General Manager (GM)** | **Pemeriksaan Tingkat Lanjut & Checker GM:** Memantau seluruh aktivitas operasional di *Kotak Masuk*, memberikan persetujuan Comcase, dan membubuhkan tanda tangan digital sebagai **TTD 3 (Checker 1 GM)** pada berkas PDF permohonan eksternal. | Dashboard Utama, Kotak Masuk (Inbox, Data Comcase, Data External), Armada |
| **Finance** | **Keuangan, Kasir & Pencairan Dana:** Memvalidasi anggaran, membubuhkan tanda tangan digital sebagai **TTD 4 (Checker 2 Finance)**, mencairkan dana dan mengunggah bukti transfer bank untuk Comcase & permohonan eksternal yang disetujui, mencatat arus kas (*Deposit/Kas Masuk & Kas Keluar*), memantau selisih dana BBM belum tervalidasi, mengelola aksi hapus transaksi kas, serta mengekspor rekapitulasi ke Google Docs. | Dashboard Utama, Modul Finance (Pembayaran Pending, Transaksi Kas, Integrasi Google Docs), Armada |
| **Direksi / Owner** | **Approval Tertinggi & Otorisasi Final:** Memantau kinerja pengeluaran di *Kotak Masuk*, dan membubuhkan tanda tangan digital otoritas tertinggi sebagai **TTD 5 (Approval Final Direksi/Owner)** sebelum dana permohonan eksternal dapat dicairkan oleh Finance. | Dashboard Utama, Kotak Masuk (Inbox, Data Comcase, Data External), Daftar Transaksi Kas |
| **HRD** | **Personalia, Armada & Aset:** Mengelola database karyawan (ID `BST-XXXX`, alert kontrak PKWT H-30 hari, filter *Field Worker* vs *Back Office*, 7 berkas dokumen & pas foto), mengelola armada kendaraan operasional, serta melakukan *Penugasan Aset* kendaraan dan inventaris kerja kepada karyawan. | Dashboard Utama, List Karyawan (HRD), Armada Kendaraan & Penugasan Aset |
| **User (Driver / Lapangan)** | **Validasi Nota BBM Khusus Driver:** Mengakses modul validasi untuk menginput nota riil SPBU disertai unggahan 3 foto autentikasi lapangan (Foto Struk BBM, Foto Odometer Sebelum, Foto Odometer Sesudah). **Menu Dashboard Utama disembunyikan sepenuhnya** demi fokus dan isolasi operasional. | Validasi Nota BBM, Armada (Daftar Armada) |

---

## 3. Core Modules & Feature Specifications

### 3.1 Executive Dashboard
*   **Statistik KPI Interaktif:** Kartu ringkasan data operasional dengan status elevasi interaktif (*Hover elevate & Click-to-navigate*), meliputi total Comcase aktif, permohonan eksternal pending, kas teralokasi, dan unit armada siap jalan.
*   **Alur Otorisasi PDF Zona (5-Tahap):** Widget pemantau antrean dokumen PDF real-time yang menampilkan jumlah berkas yang sedang menunggu TTD Manager, TTD GM, TTD Owner, dan siap dicairkan oleh Finance.
*   **Tabel Ringkasan Adaptif:** Menampilkan tab tabel data yang secara otomatis menyesuaikan role pengguna (menampilkan data Comcase untuk divisi operasional/keuangan, atau data Karyawan & Armada untuk HRD).
*   **Isolasi Hak Tampil:** Dashboard Utama hanya aktif untuk level Manajerial, HRD, Finance, dan Supervisor. Untuk role Lapangan/Driver, modul ini tidak dirender dan otomatis dialihkan ke Validasi Nota BBM.

### 3.2 Modul Kotak Masuk (Inbox) & Approval Terpadu
*   **Antrian Persetujuan Terpusat:** Halaman khusus bagi level manajerial (Manager, GM, Direksi) untuk memproses persetujuan berkas Comcase dan penandatanganan berkas permohonan eksternal dalam satu tampilan efisien.
*   **Rekapitulasi Data Comcase & External:** Submenu terpadu untuk membuka data lengkap pengajuan Comcase (`manager-comcase-all`) dan dokumen permohonan eksternal (`manager-external-all`) dengan proteksi otorisasi matriks independen.

### 3.3 Modul Operasional & Pengajuan Comcase
*   **Formulir Pengajuan Dana Cepat:** Penginputan nomor berkas otomatis, nama project, Site ID, Team Leader, deskripsi keperluan darurat, nomor rekening tujuan, dan nominal pengajuan.
*   **Alur Status Berjenjang:**
    $$\text{Draft/Request} \longrightarrow \text{Review Zone} \longrightarrow \text{Approval Manager} \longrightarrow \text{Pembayaran Finance} \longrightarrow \text{Selesai (Paid)}$$
*   **Penolakan dengan Catatan Revisi:** Jika pengajuan ditolak oleh Zone Manager atau Manager, berkas dikembalikan ke pemohon dengan alasan penolakan yang jelas untuk dapat direvisi ulang.
*   **Pelunasan Kasir Finance:** Kasir Finance memverifikasi pengajuan yang telah disetujui, mencairkan dana, dan mengunggah bukti transfer perbankan sebagai lampiran sah.

### 3.4 Modul Dokumen Permohonan External & Tanda Tangan PDF (5-Tahap)
*   **Unggah Dokumen PDF Resmi:** Fitur bagi Zone Manager untuk mengunggah surat permohonan izin/dana eksternal dalam format PDF.
*   **Canvas Digital Signature & Preview:** Penampil PDF terintegrasi yang memungkinkan para penandatangan membubuhkan tanda tangan digital secara berurutan:
    1.  **TTD 1 - Requester:** Zone Manager
    2.  **TTD 2 - Checker:** Manager Operasional
    3.  **TTD 3 - Checker 1:** General Manager
    4.  **TTD 4 - Checker 2:** Finance
    5.  **TTD 5 - Approval Final:** Direksi / Owner
*   **Pencairan Final:** Dokumen yang telah lengkap 5 tanda tangan akan langsung masuk ke tab pencairan Finance untuk proses pembayaran.

### 3.5 Modul Manajemen Arus Kas & Keuangan (Finance)
*   **Dual Transaction Mode (Kas Masuk vs Kas Keluar):**
    *   **Kas Masuk (Deposit / Top-up):** Pencatatan penambahan saldo kas operasional dari Direksi/Kantor Pusat/Owner (`type: 'in'`), secara otomatis berstatus tervalidasi dan menambah saldo kas aktif.
    *   **Kas Keluar (Pengeluaran Operasional):** Pencatatan biaya riil (`type: 'out'`) terbagi dalam 6 kategori: *BBM (Khusus Validasi Driver), Tol, Lalamove, Tools, Makan Inap, dan Lainnya*.
*   **Real-time Financial Ledger Dashboard (4 Kartu Ringkasan KPI):**
    1.  *Total Kas Masuk (Deposit)*: Akumulasi seluruh dana masuk/top-up.
    2.  *Total Kas Keluar*: Akumulasi seluruh biaya pengeluaran operasional.
    3.  *Saldo Kas Operasional Aktif*: Sisa kas riil siap pakai (`Kas Masuk` - `Kas Keluar`).
    4.  *Selisih Uang BBM Belum Divalidasi*: Total nominal dana pengeluaran BBM yang sudah dicairkan namun belum divalidasi 3 foto lapangan oleh driver.
*   **Format Titik Ribuan (Thousand Separator):** Form input nominal dilengkapi format titik otomatis (contoh: `Rp 10.000.000`) secara real-time saat pengguna mengetik angka untuk mengeliminasi kesalahan kelebihan/kekurangan angka nol.
*   **Otomatisasi Relasi Armada & Driver:** Saat memilih plat nomor kendaraan pada form pengeluaran BBM, nama PIC / Driver otomatis terisi sesuai driver yang terdaftar pada armada tersebut. Sebaliknya, saat memilih nama driver, plat kendaraan yang ditugaskan otomatis terpilih.
*   **Aksi Kelola Transaksi Kas:**
    *   *Detail Modal*: Menampilkan rincian transaksi, nama penyetor/PIC, plat kendaraan, dan status validasi nota.
    *   *Hapus Transaksi (Delete)*: Fitur penghapusan transaksi dengan modal konfirmasi aman, yang secara otomatis merefresh data dan memperbarui saldo kas riil.
*   **Daftar Transaksi Multi-Filter:** Filter rentang tanggal fleksibel (*Hari Ini, 7 Hari Terakhir, Bulan Ini, Kustom*), filter tipe arus kas (*Semua, Kas Masuk, Kas Keluar*), filter kategori, status validasi nota, dan nama PIC.
*   **Sinkronisasi Google Docs API:** Ekspor dan kompilasi otomatis seluruh data transaksi yang telah tervalidasi ke dokumen Google Docs resmi perusahaan via Service Account / OAuth 2.0.

### 3.6 Modul Validasi Nota BBM Lapangan (User / Driver)
*   **Otomatisasi Profil & Armada Terdaftar:** Saat user/driver login membuka halaman Validasi BBM, sistem secara otomatis mendeteksi armada kendaraan yang ditugaskan kepada driver tersebut.
*   **Isolasi Akses & Default Tab:** Pengguna dengan role `User` / `driver` / `lapangan` secara otomatis diarahkan ke tab *Validasi Nota BBM*, dan menu *Dashboard Utama* tidak ditampilkan pada navigasi.
*   **Antrean Tugas Validasi BBM dari Finance:** Menampilkan kartu antrean tugas nota pengeluaran BBM yang ditugaskan khusus kepada driver tersebut (berstatus *Belum Divalidasi*). Driver cukup mengklik *Validasi Sekarang* untuk melengkapi formulir verifikasi.
*   **Tampilan Unggah 3 Foto Sejajar & Transparan:**
    Formulir unggah foto dirancang rapi sejajar tanpa background pekat (*transparan*) dengan label terstandarisasi:
    1.  **Foto Struk BBM** (nota fisik SPBU mencantumkan nominal rupiah dan liter).
    2.  **Foto Odometer Sebelum Pengisian** (angka speedometer KM sebelum diisi).
    3.  **Foto Odometer Sesudah Pengisian** (angka speedometer KM setelah diisi).
*   **Kalkulasi Jarak Tempuh Otomatis:** Sistem menghitung selisih jarak tempuh:
    $$\Delta \text{KM} = \text{Odometer Sesudah} - \text{Odometer Sebelum}$$
*   **Pencocokan Riil & Perubahan Status:** Penginputan angka odometer riil, jenis BBM (Pertalite, Pertamax, Dexlite, Solar), dan catatan perjalanan. Setelah diverifikasi dan disimpan, status transaksi secara otomatis berubah menjadi *Sudah Divalidasi*.
*   **Akun Demo Terdaftar:**
    *   `driver` / `driver123` (Joko Santoso - Driver Lapangan)
    *   `lapangan` / `lapangan123` (Budi - Staff Lapangan)
    *   `tl` / `tl123` (Ahmad Fauzi - Team Leader)

### 3.7 Modul Data Karyawan & Personalia (HRD)
*   **Pemberian Nomor Induk Otomatis:** Format identifikasi terstandarisasi `BST-XXXX`.
*   **Pemantauan Kontrak PKWT:** Pemilihan periode kontrak (3, 6, 9, atau 12 bulan) dilengkapi sistem **Alert H-30 Hari** otomatis jika sisa masa kontrak kerja kurang dari atau sama dengan 30 hari.
*   **Filter Personalia:** Pemisahan kategori staf antara *Field Worker* (teknisi lapangan) dan *Back Office* (kantor).
*   **Status Karyawan Interaktif:** Indikator visual status *Aktif*, *Cuti*, dan *Resign* yang terhubung langsung sebagai tombol filter tabel.
*   **Dokumentasi & Berkas (7 Berkas):** Unggah Foto KTP, Kartu Keluarga (KK), CV Karyawan, Sertifikat TKPK 1, Sertifikat First Aid (P3K), Sertifikat Basic Electric, dan Pas Foto Profil Lingkaran.

### 3.8 Modul Armada Kendaraan & Penugasan Aset (HRD)
*   **Manajemen Armada Mobil:** Data plat nomor polisi, merek unit, vendor (milik sendiri atau sewa/rental), nama driver, dan link WhatsApp langsung.
*   **Barcode Kendaraan:** Penampil barcode digital kendaraan operasional untuk verifikasi saat pengisian BBM.
*   **Checklist Kelaikan:** Pemeriksaan kelengkapan fisik unit (Ban Serep, Dongkrak, Kunci Roda, Kotak P3K, Berkas BAST digital).
*   **Modul Penugasan Aset Relasional:** Penyerahan dan penugasan unit armada atau inventaris perangkat kantor kepada karyawan terdaftar dengan pencatatan tanggal serah terima dan riwayat penggunaan.

### 3.9 Master Control Panel & Matriks Hak Akses Dinamis
*   **Manajemen Akun Pengguna:** Pembuatan akun login baru dengan username dan nama lengkap yang terikat dengan data karyawan terdaftar, pemilihan role, ubah password, dan hapus akun.
*   **Matriks Hak Akses & Otorisasi Fitur:** Tabel visual matriks perizinan (Role vs Fitur) yang memungkinkan Master Admin mencentang hak akses secara spesifik:
    *   *Modul Kotak Masuk (inbox_view, inbox_comcase, inbox_external)*
    *   *Modul Comcase (comcase_create, comcase_view, comcase_approve)*
    *   *Modul Permohonan External & TTD (zone_request_create, view, sign 1 s/d 5)*
    *   *Modul Keuangan (expense_view, expense_create, comcase_pay)*
    *   *Modul Karyawan (hrd_employee_view, create, edit, delete)*
    *   *Modul Armada & Validasi (vehicle_view, create, assign, bbm_validation)*
*   **Penerapan Instan:** Perubahan matriks disimpan ke database/konfigurasi sistem dan langsung mempengaruhi menu bilah sisi serta proteksi rute secara real-time.

---

## 4. Technical Architecture & Technology Stack

```
[ Web Browser Client ]
        │
        ▼
[ Laravel Root Gateway: index.php ] ─── (Auto Redirect) ───► [ laravel/public/ (Document Root) ]
                                                                      │
        ┌─────────────────────────────────────────────────────────────┴─────────────────────────────────────────────────────────────┐
        ▼                                                                                                                           ▼
[ React 18 SPA (Compiled Assets) ]                                                                                  [ Laravel API Gateway (index.php) ]
(index.html, assets/*.js, assets/*.css)                                                                                              │
        │                                                                                                                           ▼
        └────────────────────────────── (RESTful JSON + Bearer Sanctum Token) ────────────────────────────────────► [ Api Controllers & Eloquent Models ]
                                                                                                                                     │
                                                                                                                                     ▼
                                                                                                                        [ MySQL: bsm_operations_db ]
                                                                                                                                     │
                                                                                                                                     ▼
                                                                                                                             [ Google Docs API ]
```

*   **Front-End Architecture:** Single Page Application (SPA) berbasis **React 18** dibangun dan dioptimasi menggunakan **Vite 5**. Berkas sumber berlokasi di `laravel/frontend-react/` dan hasil kompilasi produksi langsung didistribusikan ke `laravel/public/`.
*   **UI/UX Framework:** Bootstrap 5.3, Plus Jakarta Sans & JetBrains Mono typography, Lucide React Icons, Canvas Signature Pad, Responsive Mobile-friendly Drawer.
*   **Anti-Cache Optimization:** Meta tag HTTP Cache-Control (`no-cache, no-store, must-revalidate`) pada `index.html` dan hash versioning pada bundle JS/CSS untuk memastikan browser klien selalu memuat versi frontend terkini.
*   **State & Authentication:** React Context API (`AuthContext`), LocalStorage session persistence, Defensive Null-Safe Accessors.
*   **Back-End Architecture:** **Framework Laravel 12 / 11 (PHP 8.3+)** terpusat di folder `laravel/`:
    *   *Controllers:* `AuthController`, `ComcaseController`, `ZoneRequestController`, `EmployeeController`, `VehicleController`, `ExpenseController`, `SettingController`, `UploadController`.
    *   *Routing:* `routes/api.php` dengan 45 endpoint RESTful dan fallback dispatcher untuk kompatibilitas penuh.
    *   *Web Routing:* `routes/web.php` menyajikan SPA secara otomatis untuk seluruh rute navigasi.
    *   *Security & Auth:* Laravel Sanctum API token, PHP Password Hash, dan CORS configuration (`config/cors.php`).
*   **Database:** MySQL 8.x / MariaDB 10.x (`bsm_operations_db`) dengan 9 tabel terintegrasi penuh:
    1.  `users` (Akun otentikasi & role)
    2.  `employees` (Profil karyawan & PKWT)
    3.  `vehicles` (Armada mobil operasional)
    4.  `vehicle_logs` (Riwayat penugasan kendaraan)
    5.  `comcases` (Kasus darurat lapangan)
    6.  `zone_requests` (Surat permohonan 5-tahap TTD digital)
    7.  `expenses` (Pencatatan kas operasional & validasi BBM)
    8.  `settings` (Konfigurasi matriks & alur workflow)
    9.  `personal_access_tokens` (Token sesi Sanctum)
*   **Storage & Uploads:** Direktori `laravel/public/uploads/` untuk penyimpanan nota SPBU, foto profil, dan dokumen BAST / PDF permohonan.
*   **Integrasi Eksternal:** Google Workspace REST API (Google Docs API & Google Drive API) via Service Account / OAuth 2.0.

---

## 5. Directory Structure & Deployment Flow

```
c:\laragon\www\bsm_portal\
│
├── index.php                              # Root entrypoint: auto-redirect ke laravel/public/
├── PRD_BSM_Operations_Validation_Portal.md# Dokumen spesifikasi teknis (v2.3)
│
└── laravel\                               # REPOSITORI UTAMA TERPADU (LARAVEL 12)
    ├── app\
    │   ├── Http\Controllers\Api\          # 8 RESTful API Controllers
    │   └── Models\                        # 8 Eloquent Models
    ├── config\                            # cors.php, database.php, app.php
    ├── database\
    │   ├── migrations\                    # Migrasi skema & token Sanctum
    │   ├── seed_field_users.php           # Script seeder akun demo lapangan (Driver, Lapangan, TL)
    │   └── bsm_database.sql               # Berkas skema & seed SQL cadangan
    ├── frontend-react\                    # KODE SUMBER FRONTEND REACT (VITE)
    │   ├── src\
    │   │   ├── components\                # Sidebar, Navbar, Modal, Widgets
    │   │   ├── context\                   # AuthContext (RBAC & Matriks Otorisasi)
    │   │   ├── pages\                     # Dashboard, Inbox, Comcase, Settings, UserBBM, dll.
    │   │   └── services\api.js            # Universal Dynamic API client
    │   ├── package.json                   # Dependensi React 18, Lucide, Bootstrap
    │   └── vite.config.js                 # Output build diarahkan langsung ke ../public
    ├── public\                            # WEB ROOT DISTRIBUSI LARAGON / APACHE
    │   ├── assets\                        # Bundle JS & CSS terkompresi
    │   ├── img\                           # Logo & ikon portal
    │   ├── uploads\                       # File PDF BAST & Nota BBM riil
    │   ├── index.html                     # Entry point SPA (No-Cache Meta Tags)
    │   ├── index.php                      # Front Controller Laravel
    │   └── .htaccess                      # Aturan rewrite Apache
    ├── routes\
    │   ├── api.php                        # 45 endpoint API RESTful
    │   └── web.php                        # SPA fallback handler
    └── storage\                           # Log sistem & file sessions
```