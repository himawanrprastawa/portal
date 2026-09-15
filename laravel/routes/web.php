<?php

use Illuminate\Support\Facades\Route;

// Serve React SPA for all non-API web routes
Route::get('/{any?}', function () {
    $indexPath = public_path('index.html');
    if (file_exists($indexPath)) {
        return response()->file($indexPath);
    }
    return view('welcome');
})->where('any', '^(?!api).*$');
