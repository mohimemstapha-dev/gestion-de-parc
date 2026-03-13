<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\AuthController;

use App\Http\Controllers\VisiteurController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\AttractionController;
use App\Http\Controllers\BilletController;

Route::get('/dashboard', [DashboardController::class, 'index']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    Route::apiResource('users', UserController::class);
    Route::apiResource('visiteurs', VisiteurController::class);
    Route::apiResource('tickets', TicketController::class);
    Route::apiResource('attractions', AttractionController::class);
    Route::apiResource('billets', BilletController::class);
});
