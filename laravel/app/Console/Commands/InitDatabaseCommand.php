<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Schema;

class InitDatabaseCommand extends Command
{
    protected $signature = 'portal:init-db';
    protected $description = 'Initialize and migrate database tables and initial seed data for BSM Portal';

    public function handle(): int
    {
        $this->info('Starting database initialization for BSM Portal...');

        try {
            DB::connection()->getPdo();
            $this->info('Database connection established successfully.');
        } catch (\Throwable $e) {
            $this->error('Could not connect to database: ' . $e->getMessage());
            return 1;
        }

        $driver = DB::connection()->getDriverName();

        // 1. Table: users
        if (!Schema::hasTable('users')) {
            $this->info('Creating table: users');
            DB::statement("
                CREATE TABLE `users` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `username` VARCHAR(50) NOT NULL UNIQUE,
                    `password` VARCHAR(255) NOT NULL,
                    `role` VARCHAR(50) NOT NULL DEFAULT 'User',
                    `employee_name` VARCHAR(100) NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        }

        // 2. Table: vehicles
        if (!Schema::hasTable('vehicles')) {
            $this->info('Creating table: vehicles');
            DB::statement("
                CREATE TABLE `vehicles` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `barcode` VARCHAR(50) NOT NULL UNIQUE,
                    `barcode_bbm` VARCHAR(255) NULL,
                    `plate_number` VARCHAR(20) NOT NULL UNIQUE,
                    `model` VARCHAR(100) NOT NULL,
                    `vendor` VARCHAR(100) NOT NULL,
                    `driver_name` VARCHAR(100) NULL,
                    `driver_whatsapp` VARCHAR(30) NULL,
                    `team_type` VARCHAR(20) NOT NULL DEFAULT 'Internal',
                    `tool_spare_tire` TINYINT(1) NOT NULL DEFAULT 1,
                    `tool_jack` TINYINT(1) NOT NULL DEFAULT 1,
                    `tool_wrench` TINYINT(1) NOT NULL DEFAULT 1,
                    `tool_first_aid` TINYINT(1) NOT NULL DEFAULT 1,
                    `doc_berita_acara` VARCHAR(255) NULL,
                    `status` VARCHAR(20) NOT NULL DEFAULT 'Tersedia',
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        }

        // 3. Table: employees
        if (!Schema::hasTable('employees')) {
            $this->info('Creating table: employees');
            DB::statement("
                CREATE TABLE `employees` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `nip` VARCHAR(20) NOT NULL UNIQUE,
                    `name` VARCHAR(100) NOT NULL,
                    `birth_place` VARCHAR(100) NULL,
                    `birth_date` DATE NULL,
                    `role` VARCHAR(100) NOT NULL,
                    `employee_type` VARCHAR(30) NOT NULL DEFAULT 'Field Worker',
                    `nik` VARCHAR(10) NOT NULL UNIQUE,
                    `status` VARCHAR(20) NOT NULL DEFAULT 'Aktif',
                    `address` TEXT NULL,
                    `bank_account` VARCHAR(100) NULL,
                    `base_salary` DECIMAL(15,2) NOT NULL DEFAULT 0.00,
                    `pkwt_date` DATE NOT NULL,
                    `pkwt_duration_months` INT NOT NULL DEFAULT 12,
                    `pkwt_end_date` DATE NOT NULL,
                    `emergency_spouse` VARCHAR(100) NULL,
                    `emergency_father` VARCHAR(100) NULL,
                    `emergency_mother` VARCHAR(100) NULL,
                    `bpjs_tk` VARCHAR(50) NULL,
                    `bpjs_ks` VARCHAR(50) NULL,
                    `doc_ktp` VARCHAR(255) NULL,
                    `doc_kk` VARCHAR(255) NULL,
                    `doc_cv` VARCHAR(255) NULL,
                    `doc_tkpk1` VARCHAR(255) NULL,
                    `doc_first_aid` VARCHAR(255) NULL,
                    `doc_basic_electric` VARCHAR(255) NULL,
                    `doc_photo` VARCHAR(255) NULL,
                    `vehicle_id` INT NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    CONSTRAINT `fk_emp_veh` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles` (`id`) ON DELETE SET NULL
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        }

        // 4. Table: expenses
        if (!Schema::hasTable('expenses')) {
            $this->info('Creating table: expenses');
            DB::statement("
                CREATE TABLE `expenses` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `code` VARCHAR(50) NOT NULL UNIQUE,
                    `date` DATE NOT NULL,
                    `type` VARCHAR(10) NOT NULL DEFAULT 'out',
                    `category` VARCHAR(50) NOT NULL,
                    `amount` DECIMAL(15,2) NOT NULL,
                    `recipient_name` VARCHAR(100) NOT NULL,
                    `pic_name` VARCHAR(100) NULL,
                    `plate_number` VARCHAR(30) NULL,
                    `description` TEXT NULL,
                    `status` VARCHAR(30) NOT NULL DEFAULT 'Belum Divalidasi',
                    `validation_date` DATE NULL,
                    `validation_amount` DECIMAL(15,2) NULL,
                    `validation_photo_before` LONGTEXT NULL,
                    `validation_photo_after` LONGTEXT NULL,
                    `validation_photo_struk` LONGTEXT NULL,
                    `validation_notes` TEXT NULL,
                    `validated_by` VARCHAR(50) NULL,
                    `validated_at` DATETIME NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        }

        // 5. Table: comcases
        if (!Schema::hasTable('comcases')) {
            $this->info('Creating table: comcases');
            DB::statement("
                CREATE TABLE `comcases` (
                    `id` VARCHAR(50) PRIMARY KEY,
                    `date` DATE NOT NULL,
                    `project` VARCHAR(200) NOT NULL,
                    `team_leader` VARCHAR(100) NOT NULL,
                    `activity` TEXT NOT NULL,
                    `site_id` VARCHAR(50) NOT NULL,
                    `amount` DECIMAL(15,2) NOT NULL,
                    `account_number` VARCHAR(50) NOT NULL,
                    `bank_name` VARCHAR(50) NOT NULL,
                    `recipient_name` VARCHAR(100) NOT NULL,
                    `doc_berita_acara` VARCHAR(255) NULL,
                    `doc_kwitansi` VARCHAR(255) NULL,
                    `doc_foto` VARCHAR(255) NULL,
                    `doc_patwal` VARCHAR(255) NULL,
                    `status` VARCHAR(50) NOT NULL DEFAULT 'Menunggu Approval Manager',
                    `submitted_by` VARCHAR(50) NOT NULL,
                    `submitted_at` DATETIME NOT NULL,
                    `manager_approval_by` VARCHAR(50) NULL,
                    `manager_approval_at` DATETIME NULL,
                    `manager_approval_status` VARCHAR(30) NULL,
                    `manager_approval_notes` TEXT NULL,
                    `finance_payment_by` VARCHAR(50) NULL,
                    `finance_payment_at` DATETIME NULL,
                    `finance_payment_proof` VARCHAR(255) NULL,
                    `revision_count` INT NOT NULL DEFAULT 0,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        }

        // 6. Table: zone_requests
        if (!Schema::hasTable('zone_requests')) {
            $this->info('Creating table: zone_requests');
            DB::statement("
                CREATE TABLE `zone_requests` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `request_number` VARCHAR(50) NOT NULL UNIQUE,
                    `zone_name` VARCHAR(100) NOT NULL,
                    `requester_name` VARCHAR(100) NOT NULL,
                    `title` VARCHAR(255) NOT NULL,
                    `category` VARCHAR(100) NOT NULL DEFAULT 'Permohonan Operasional',
                    `estimated_cost` DECIMAL(15,2) NULL DEFAULT 0.00,
                    `description` TEXT NULL,
                    `pdf_filename` VARCHAR(255) NULL,
                    `pdf_url` LONGTEXT NULL,
                    `status` VARCHAR(50) NOT NULL DEFAULT 'Menunggu TTD Manager',
                    `manager_name` VARCHAR(100) NULL,
                    `manager_signed_at` DATETIME NULL,
                    `manager_signature` LONGTEXT NULL,
                    `manager_notes` TEXT NULL,
                    `gm_name` VARCHAR(100) NULL,
                    `gm_signed_at` DATETIME NULL,
                    `gm_signature` LONGTEXT NULL,
                    `gm_notes` TEXT NULL,
                    `owner_name` VARCHAR(100) NULL,
                    `owner_signed_at` DATETIME NULL,
                    `owner_signature` LONGTEXT NULL,
                    `owner_notes` TEXT NULL,
                    `rejection_reason` TEXT NULL,
                    `finance_paid_by` VARCHAR(100) NULL,
                    `finance_paid_at` DATETIME NULL,
                    `finance_receipt` VARCHAR(255) NULL,
                    `finance_notes` TEXT NULL,
                    `finance_amount` DECIMAL(15,2) NULL,
                    `requester_signed_at` DATETIME NULL,
                    `requester_signature` LONGTEXT NULL,
                    `requester_notes` TEXT NULL,
                    `finance_checker_name` VARCHAR(100) NULL,
                    `finance_checker_signed_at` DATETIME NULL,
                    `finance_checker_signature` LONGTEXT NULL,
                    `finance_checker_notes` TEXT NULL,
                    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        }

        // 7. Table: settings
        if (!Schema::hasTable('settings')) {
            $this->info('Creating table: settings');
            DB::statement("
                CREATE TABLE `settings` (
                    `id` INT AUTO_INCREMENT PRIMARY KEY,
                    `setting_key` VARCHAR(50) NOT NULL UNIQUE,
                    `setting_value` TEXT NULL,
                    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            ");
        }

        // 8. Seed Default Users
        $defaultUsers = [
            ['username' => 'master', 'password' => 'master123', 'role' => 'Master', 'employee_name' => 'Master Admin'],
            ['username' => 'pandu', 'password' => 'manager123', 'role' => 'Manager', 'employee_name' => 'Pandu (Manager Ops)'],
            ['username' => 'boya', 'password' => 'zone123', 'role' => 'Zone Manager', 'employee_name' => 'Boya (Zone Manager)'],
            ['username' => 'cristian', 'password' => 'spv123', 'role' => 'Supervisor', 'employee_name' => 'Cristian (Supervisor)'],
            ['username' => 'himawan', 'password' => 'finance123', 'role' => 'Finance', 'employee_name' => 'Himawan (Finance)'],
            ['username' => 'septika', 'password' => 'hrd123', 'role' => 'HRD', 'employee_name' => 'Septika (HRD)'],
            ['username' => 'gm', 'password' => 'gm123', 'role' => 'General Manager', 'employee_name' => 'General Manager Operasional'],
            ['username' => 'direksi', 'password' => 'direksi123', 'role' => 'Direksi', 'employee_name' => 'Direksi Utama / Owner'],
            ['username' => 'tl', 'password' => 'tl123', 'role' => 'Team Leader', 'employee_name' => 'Ahmad Fauzi (Team Leader)'],
            ['username' => 'driver', 'password' => 'driver123', 'role' => 'User', 'employee_name' => 'Joko Santoso (Driver Lapangan)'],
            ['username' => 'lapangan', 'password' => 'lapangan123', 'role' => 'User', 'employee_name' => 'Budi (Staff Lapangan)'],
        ];

        foreach ($defaultUsers as $u) {
            $existing = DB::table('users')->where('username', $u['username'])->first();
            if (!$existing) {
                DB::table('users')->insert([
                    'username' => $u['username'],
                    'password' => Hash::make($u['password']),
                    'role' => $u['role'],
                    'employee_name' => $u['employee_name'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $this->info("Created user: {$u['username']} ({$u['role']})");
            }
        }

        // 9. Seed Sample Vehicles if empty
        if (DB::table('vehicles')->count() === 0) {
            DB::table('vehicles')->insert([
                [
                    'barcode' => 'BSM-MOB-001',
                    'barcode_bbm' => 'barcode_bbm_avanza_b1234abc.png',
                    'plate_number' => 'B 1234 ABC',
                    'model' => 'Toyota Avanza 1.3 G M/T',
                    'vendor' => 'PT BSM Logistik',
                    'driver_name' => 'Joko Santoso (Driver Lapangan)',
                    'driver_whatsapp' => '081234567890',
                    'team_type' => 'Internal',
                    'tool_spare_tire' => 1,
                    'tool_jack' => 1,
                    'tool_wrench' => 1,
                    'tool_first_aid' => 1,
                    'status' => 'Dipakai',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
                [
                    'barcode' => 'BSM-MOB-002',
                    'barcode_bbm' => 'barcode_bbm_hilux_b5678xyz.png',
                    'plate_number' => 'B 5678 XYZ',
                    'model' => 'Toyota Hilux Single Cabin 4x4',
                    'vendor' => 'Rental Mitra Prima',
                    'driver_name' => 'Budi Santoso',
                    'driver_whatsapp' => '081322334455',
                    'team_type' => 'Internal',
                    'tool_spare_tire' => 1,
                    'tool_jack' => 1,
                    'tool_wrench' => 1,
                    'tool_first_aid' => 1,
                    'status' => 'Tersedia',
                    'created_at' => now(),
                    'updated_at' => now(),
                ],
            ]);
            $this->info('Seeded sample vehicles.');
        }

        // 10. Seed Sample Settings if empty
        if (DB::table('settings')->count() === 0) {
            DB::table('settings')->insert([
                ['setting_key' => 'idle_timeout_seconds', 'setting_value' => '900'],
                ['setting_key' => 'app_name', 'setting_value' => 'BSM Operations & Validation Portal'],
            ]);
            $this->info('Seeded default settings.');
        }

        $this->info('Database initialization completed successfully!');
        return 0;
    }
}

