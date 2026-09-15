<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ComcaseController;
use App\Http\Controllers\Api\ZoneRequestController;
use App\Http\Controllers\Api\EmployeeController;
use App\Http\Controllers\Api\VehicleController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\SettingController;
use App\Http\Controllers\Api\UploadController;

/*
|--------------------------------------------------------------------------
| API Routes for BSM Operations Portal
|--------------------------------------------------------------------------
*/

// --- 1. Authentication & User Management ---
Route::post('/auth/login', [AuthController::class, 'login']);
Route::get('/auth/users', [AuthController::class, 'index']);
Route::post('/auth/users', [AuthController::class, 'create']);
Route::post('/auth/users/update-role', [AuthController::class, 'updateRole']);
Route::post('/auth/users/delete', [AuthController::class, 'delete']);
Route::post('/auth/users/change-password', [AuthController::class, 'changePassword']);

// Compatibility dispatcher for legacy auth.php
Route::match(['get', 'post'], '/auth.php', function (Request $request, AuthController $controller) {
    $action = $request->query('action', '');
    if ($request->isMethod('get')) {
        return $controller->index();
    }
    return match ($action) {
        'login' => $controller->login($request),
        'create' => $controller->create($request),
        'update_role' => $controller->updateRole($request),
        'delete' => $controller->delete($request),
        'change_password' => $controller->changePassword($request),
        default => $controller->index(),
    };
});

// --- 2. Comcase Management ---
Route::get('/comcases', [ComcaseController::class, 'index']);
Route::post('/comcases', [ComcaseController::class, 'create']);
Route::post('/comcases/review-zone', [ComcaseController::class, 'reviewZone']);
Route::post('/comcases/update-status', [ComcaseController::class, 'updateStatus']);
Route::post('/comcases/payment', [ComcaseController::class, 'payment']);
Route::post('/comcases/delete', [ComcaseController::class, 'delete']);

// Compatibility dispatcher for legacy comcases.php
Route::match(['get', 'post', 'put', 'delete'], '/comcases.php', function (Request $request, ComcaseController $controller) {
    $action = $request->query('action', '');
    if ($request->isMethod('get')) {
        return $controller->index($request);
    }
    if ($request->isMethod('delete') || $action === 'delete') {
        return $controller->delete($request);
    }
    if ($request->isMethod('put') || $action === 'update') {
        return $controller->update($request);
    }
    return match ($action) {
        'review_zone' => $controller->reviewZone($request),
        'update_status', 'approve' => $controller->updateStatus($request),
        'payment' => $controller->payment($request),
        'delete' => $controller->delete($request),
        default => $controller->create($request),
    };
});

// --- 3. Zone Requests (5-Tahap PDF Signature) ---
Route::get('/zone-requests', [ZoneRequestController::class, 'index']);
Route::post('/zone-requests', [ZoneRequestController::class, 'create']);
Route::post('/zone-requests/sign', [ZoneRequestController::class, 'sign']);
Route::post('/zone-requests/reject', [ZoneRequestController::class, 'reject']);
Route::post('/zone-requests/delete', [ZoneRequestController::class, 'delete']);

// Compatibility dispatcher for legacy zone_requests.php
Route::match(['get', 'post', 'delete'], '/zone_requests.php', function (Request $request, ZoneRequestController $controller) {
    $action = $request->query('action', '');
    if ($request->isMethod('get')) {
        return $controller->index();
    }
    if ($request->isMethod('delete') || $action === 'delete') {
        return $controller->delete($request);
    }
    return match ($action) {
        'sign' => $controller->sign($request),
        'reject' => $controller->reject($request),
        'payment' => $controller->payment($request),
        'delete' => $controller->delete($request),
        default => $controller->create($request),
    };
});

// --- 4. Employee & Personalia Management ---
Route::get('/employees', [EmployeeController::class, 'index']);
Route::post('/employees', [EmployeeController::class, 'create']);
Route::post('/employees/update', [EmployeeController::class, 'update']);
Route::post('/employees/delete', [EmployeeController::class, 'delete']);

// Compatibility dispatcher for legacy employees.php
Route::match(['get', 'post'], '/employees.php', function (Request $request, EmployeeController $controller) {
    $action = $request->query('action', '');
    if ($request->isMethod('get')) {
        return $controller->index();
    }
    return match ($action) {
        'create' => $controller->create($request),
        'update' => $controller->update($request),
        'delete' => $controller->delete($request),
        default => $controller->index(),
    };
});

// --- 5. Vehicles & Armada Management ---
Route::get('/vehicles', [VehicleController::class, 'index']);
Route::get('/vehicles/logs', [VehicleController::class, 'getLogs']);
Route::post('/vehicles/logs', [VehicleController::class, 'addLog']);
Route::post('/vehicles', [VehicleController::class, 'create']);
Route::post('/vehicles/update', [VehicleController::class, 'update']);
Route::post('/vehicles/assign', [VehicleController::class, 'assign']);
Route::post('/vehicles/upload-bbm', [VehicleController::class, 'uploadBbm']);
Route::post('/vehicles/delete', [VehicleController::class, 'delete']);

// Compatibility dispatcher for legacy vehicles.php
Route::match(['get', 'post'], '/vehicles.php', function (Request $request, VehicleController $controller) {
    $action = $request->query('action', '');
    if ($action === 'logs') {
        return $request->isMethod('post') ? $controller->addLog($request) : $controller->getLogs($request);
    }
    if ($request->isMethod('get')) {
        return $controller->index($request);
    }
    return match ($action) {
        'create' => $controller->create($request),
        'update' => $controller->update($request),
        'assign' => $controller->assign($request),
        'upload_bbm' => $controller->uploadBbm($request),
        'delete' => $controller->delete($request),
        default => $controller->index($request),
    };
});

// --- 6. Expenses & Kas Operasional ---
Route::get('/expenses', [ExpenseController::class, 'index']);
Route::post('/expenses', [ExpenseController::class, 'create']);
Route::post('/expenses/validate-bbm', [ExpenseController::class, 'validateBbm']);
Route::post('/expenses/update', [ExpenseController::class, 'update']);
Route::post('/expenses/delete', [ExpenseController::class, 'delete']);

// Compatibility dispatcher for legacy expenses.php
Route::match(['get', 'post'], '/expenses.php', function (Request $request, ExpenseController $controller) {
    $action = $request->query('action', '');
    if ($request->isMethod('get')) {
        return $controller->index($request);
    }
    return match ($action) {
        'create' => $controller->create($request),
        'validate', 'validate_bbm' => $controller->validateBbm($request),
        'update' => $controller->update($request),
        'delete' => $controller->delete($request),
        default => $controller->create($request),
    };
});

// --- 7. Settings & Matriks Hak Akses ---
Route::get('/settings', [SettingController::class, 'index']);
Route::post('/settings', [SettingController::class, 'save']);

// Compatibility dispatcher for legacy settings.php
Route::match(['get', 'post'], '/settings.php', function (Request $request, SettingController $controller) {
    return $request->isMethod('post') ? $controller->save($request) : $controller->index($request);
});

// --- 8. File Upload ---
Route::post('/upload', [UploadController::class, 'upload']);
Route::post('/upload.php', [UploadController::class, 'upload']);
