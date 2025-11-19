<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Sales extends Model
{
    //
    protected $keyType = 'string'; // Because UUID is a string
    public $incrementing = false;  // Disable auto-increment

    protected $fillable = [
        'customer_name',
        'subtotal',
        'user_id',
        'amount_paid',
        'change_amount',
        'payment_method',
        'discount_percentage',
        'discount_amount',
        'grand_total',
        'status',
    ];

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            // Automatically generate UUID if not already set
            if (empty($model->{$model->getKeyName()})) {
                $model->{$model->getKeyName()} = (string) Str::uuid();
            }
        });
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function saleItems()
    {
        return $this->hasMany(SaleItem::class);
    }
}
