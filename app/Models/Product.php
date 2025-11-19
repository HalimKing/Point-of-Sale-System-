<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    //
    // protected $table = 'products';
    protected $fillable = [
        'name',
        'category_id', 
        'supplier_id', 
        'quantity', 
        'selling_price',
        'cost_price', 
        'total_quantity', 
        'profit', 
        'total_profit',
        'image',
        'expiry_date',
    ];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }
}
