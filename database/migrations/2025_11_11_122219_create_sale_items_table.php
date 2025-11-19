<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('sale_items', function (Blueprint $table) {
            $table->id();
            $table->string('product_name');
            $table->decimal('selling_price', 10, 2);
            $table->decimal('amount_paid', 10, 2);
            $table->decimal('change_amount', 10, 2);
            $table->integer('quantity_left');
            $table->integer('quantity_sold');
            $table->decimal('amount', 10, 2);
            $table->decimal('profit', 10, 2);
            $table->date('expiry_date');
            $table->uuid('sale_id');
            $table->foreign('sale_id')->references('id')->on('sales')->onDelete('cascade');
            
            $table->timestamps();
            
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('sale_items');
    }
};
