<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CompanySettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        DB::table('company_settings')->insert([
            'company_name' => 'Acme Retail Store',
            'email' => 'contact@acmeretail.com',
            'phone' => '+1 (555) 123-4567',
            'address' => '123 Main Street, Ghana',
            'country' => 'United States',
            'return_policy' => 'Returns accepted within 7 days with receipt',
            'thank_you_message' => 'Thank you for your purchase! Have a nice day!',
            'website' => 'https://example.com',
            'logo' => 'https://example.com/logo.png',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }
}
