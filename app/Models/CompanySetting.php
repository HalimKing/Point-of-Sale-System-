<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CompanySetting extends Model
{
    //
    protected $fillable = [
        'company_name',
        'email',
        'phone',
        'address',
        'country',
        'return_policy',
        'thank_you_message',
        'website',
        'logo',
    ];
}
