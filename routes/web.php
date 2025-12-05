<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ImportProductController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RolesController;
use App\Http\Controllers\SalesController;
use App\Http\Controllers\SalesDetailsController;
use App\Http\Controllers\SalesReportController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
    ]);
    // return Inertia::render('auth/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Route::get('dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');

    // imports routes
    Route::post('imports/products/upload', [ImportProductController::class, 'import'])->name('imports.products.upload');

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/api/dashboard/data', [DashboardController::class, 'getDashboardData']);
    
    
    
   
    Route::get('sales-reports', [SalesReportController::class, 'index']);
    Route::get('categories/fetch-categories', [CategoryController::class, 'fetchCategories']);
    Route::get('suppliers/fetch-suppliers', [SupplierController::class, 'fetchAllSuppliers']);
    Route::get('categories/data/fetch/all-categories', [CategoryController::class, 'fetchAllCategories']);
    Route::get('suppliers/data/fetch/all-suppliers', [SupplierController::class, 'fetchSuppliersData']);
    Route::get('products/data/fetch/all-products', [ProductController::class, 'fetchProductsData']);
    Route::get('suppliers/{id}/status', [SupplierController::class, 'updateStatus']);
    Route::get('sales/products/fetch-all-products', [SalesController::class, 'fetchAllProducts']);
    Route::post('sales/save/transaction', [SalesController::class, 'saveTransactions']);
    Route::get('api/sales/all-users', [UserController::class, 'allUsers']);
    Route::get('api/roles/all-roles', [RolesController::class, 'allRoles']);
    Route::get('api/users/{id}/status', [UserController::class, 'updateStatus']);
    Route::get('sales', [SalesController::class, 'index']);
    Route::resource('categories', CategoryController::class);
    Route::resource('suppliers', SupplierController::class);
    Route::resource('products',ProductController::class);
    Route::post('users/{id}/reset-password', [UserController::class, 'resetPassword']);
    Route::resource('users', UserController::class);

    // bulk delete
    Route::post('/bulk-delete/categories', [CategoryController::class, 'bulkDelete']);
    

    Route::get('api/sales/sales-details', [SalesDetailsController::class, 'salesDetails']);
    Route::get('api/sales/transactions', [SalesDetailsController::class, 'transactions']);
    Route::get('api/sales/transactions/{id}/sale-items', [SalesDetailsController::class, 'saleItems']);
    Route::get('api/sales/transactions/{id}/details', [SalesDetailsController::class, 'transactionDetails']);

    Route::get('settings/index', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('settings/update', [SettingsController::class, 'update']);
});

require __DIR__.'/settings.php';
