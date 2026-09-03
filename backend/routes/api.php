<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\StudentProfileController;
use App\Http\Controllers\Admin\MajorController;
use App\Http\Controllers\Admin\StudentManagementController;
use App\Http\Controllers\Admin\CardTemplateController;
use App\Http\Controllers\Admin\LandingContentController;

Route::get('/public/landing-content', [LandingContentController::class, 'publicShow']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Siswa Routes
    Route::prefix('siswa')->group(function () {
        Route::get('/profile', [StudentProfileController::class, 'show']);
        Route::post('/profile', [StudentProfileController::class, 'update']);
        Route::get('/card', [StudentProfileController::class, 'cardPreview']);
    });

    // Admin Routes
    Route::prefix('admin')->group(function () {
        Route::apiResource('majors', MajorController::class);
        Route::get('students/{student}/card', [StudentManagementController::class, 'cardPreview']);
        Route::apiResource('students', StudentManagementController::class);
        Route::apiResource('templates', CardTemplateController::class);
        Route::apiResource('landing-contents', LandingContentController::class);
    });
});

Route::get('/image', function (Illuminate\Http\Request $request) {
    if (!$request->has('path')) return response(null, 400);
    $path = $request->query('path');
    if (Illuminate\Support\Facades\Storage::disk('public')->exists($path)) {
        return response()->file(storage_path('app/public/' . $path));
    }
    return response(null, 404);
});
