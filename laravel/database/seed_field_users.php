<?php

require __DIR__ . '/../vendor/autoload.php';
$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Support\Facades\Hash;

$usersToSeed = [
    [
        'username' => 'driver',
        'password' => Hash::make('driver123'),
        'role' => 'User',
        'employee_name' => 'Joko Santoso (Driver Lapangan)',
    ],
    [
        'username' => 'lapangan',
        'password' => Hash::make('lapangan123'),
        'role' => 'User',
        'employee_name' => 'Budi (Staff Lapangan)',
    ],
    [
        'username' => 'tl',
        'password' => Hash::make('tl123'),
        'role' => 'Team Leader',
        'employee_name' => 'Ahmad Fauzi (Team Leader)',
    ]
];

foreach ($usersToSeed as $u) {
    $existing = User::where('username', $u['username'])->first();
    if ($existing) {
        $existing->update([
            'password' => $u['password'],
            'role' => $u['role'],
            'employee_name' => $u['employee_name']
        ]);
        echo "Updated user: {$u['username']} ({$u['role']})\n";
    } else {
        User::create($u);
        echo "Created user: {$u['username']} ({$u['role']})\n";
    }
}

// Check or assign driver to a vehicle
$vehicle = Vehicle::where('driver_name', 'LIKE', '%Joko%')
    ->orWhere('driver_name', 'LIKE', '%Driver%')
    ->first();

if (!$vehicle) {
    $firstVehicle = Vehicle::first();
    if ($firstVehicle) {
        $firstVehicle->update(['driver_name' => 'Joko Santoso (Driver Lapangan)']);
        echo "Assigned vehicle {$firstVehicle->plate_number} to Joko Santoso (Driver Lapangan)\n";
    }
} else {
    echo "Vehicle {$vehicle->plate_number} already assigned to {$vehicle->driver_name}\n";
}

echo "Seeding completed successfully.\n";

