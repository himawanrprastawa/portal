<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Comcase;

$data = [
    [
        'id' => 'CC-20260901-001',
        'date' => '2026-09-01',
        'project' => 'Project Fiber Optic Telkomsel',
        'team_leader' => 'Cristian',
        'activity' => 'Perbaikan Kabel FO Putus Tertimpa Pohon',
        'site_id' => 'JKT-042',
        'amount' => 1500000,
        'account_number' => '5271234567',
        'bank_name' => 'BCA',
        'recipient_name' => 'Cristian',
        'doc_berita_acara' => 'ba_cc001.pdf',
        'doc_kwitansi' => 'kw_cc001.pdf',
        'doc_foto' => 'foto_cc001.jpg',
        'status' => 'Menunggu Review Zone Manager',
        'submitted_by' => 'cristian',
        'submitted_at' => date('Y-m-d H:i:s', strtotime('-2 days')),
    ],
    [
        'id' => 'CC-20260902-002',
        'date' => '2026-09-02',
        'project' => 'Maintenance BTS Indosat Ooredoo',
        'team_leader' => 'Ahmad Fauzi',
        'activity' => 'Penggantian Modul Rectifier Rusak Tersambar Petir',
        'site_id' => 'BDG-108',
        'amount' => 3200000,
        'account_number' => '137001928374',
        'bank_name' => 'Mandiri',
        'recipient_name' => 'Ahmad Fauzi',
        'doc_berita_acara' => 'ba_cc002.pdf',
        'doc_kwitansi' => 'kw_cc002.pdf',
        'doc_foto' => 'foto_cc002.jpg',
        'status' => 'Menunggu Approval Manager Operasional',
        'submitted_by' => 'cristian',
        'submitted_at' => date('Y-m-d H:i:s', strtotime('-1 day')),
        'zone_manager_by' => 'Boya',
        'zone_manager_status' => 'Disetujui',
        'zone_manager_notes' => 'Urgent site down. Segera approve.',
    ],
    [
        'id' => 'CC-20260902-003',
        'date' => '2026-09-02',
        'project' => 'Relokasi Tiang Fiber XL Axiata',
        'team_leader' => 'Budi Santoso',
        'activity' => 'Penyewaan Crane Pemindahan Tiang Tol',
        'site_id' => 'SBY-021',
        'amount' => 4800000,
        'account_number' => '0123987456',
        'bank_name' => 'BNI',
        'recipient_name' => 'Budi Santoso',
        'doc_berita_acara' => 'ba_cc003.pdf',
        'doc_kwitansi' => 'kw_cc003.pdf',
        'doc_foto' => 'foto_cc003.jpg',
        'status' => 'Disetujui Manager',
        'submitted_by' => 'cristian',
        'submitted_at' => date('Y-m-d H:i:s', strtotime('-1 day')),
        'zone_manager_by' => 'Boya',
        'zone_manager_status' => 'Disetujui',
        'manager_approval_by' => 'Pandu',
        'manager_approval_status' => 'Disetujui',
        'manager_approval_notes' => 'Disetujui, harap Finance proses pencairan dana.',
    ],
    [
        'id' => 'CC-20260828-004',
        'date' => '2026-08-28',
        'project' => 'Instalasi Repeater Smartfren',
        'team_leader' => 'Cristian',
        'activity' => 'Biaya Genset Darurat Pemadaman Listrik PLN',
        'site_id' => 'TGR-015',
        'amount' => 1200000,
        'account_number' => '5271234567',
        'bank_name' => 'BCA',
        'recipient_name' => 'Cristian',
        'doc_berita_acara' => 'ba_cc004.pdf',
        'doc_kwitansi' => 'kw_cc004.pdf',
        'doc_foto' => 'foto_cc004.jpg',
        'status' => 'Sudah Dibayar',
        'submitted_by' => 'cristian',
        'submitted_at' => date('Y-m-d H:i:s', strtotime('-6 days')),
        'zone_manager_by' => 'Boya',
        'zone_manager_status' => 'Disetujui',
        'manager_approval_by' => 'Pandu',
        'manager_approval_status' => 'Disetujui',
        'finance_payment_by' => 'Himawan',
        'finance_payment_at' => date('Y-m-d H:i:s', strtotime('-5 days')),
        'finance_payment_proof' => 'bukti_transfer_cc004.jpg',
    ]
];

foreach ($data as $item) {
    Comcase::updateOrCreate(['id' => $item['id']], $item);
}

echo "Comcases seeded successfully. Total: " . Comcase::count() . "\n";

