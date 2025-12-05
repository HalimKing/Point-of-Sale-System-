<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $data = [
            ['name' => 'supper admin', 'description' => 'Full system access'],
            ['name' => 'admin', 'description' => 'Manage operations'],
            ['name' => 'cashier', 'description' => 'Perform sales activities'],
            ['name' => 'inventory', 'description' => 'Manage stock and products'],
        ];
        DB::table('roles')->insert($data);
    }
}
