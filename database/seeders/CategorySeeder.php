<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        //
        $data = [
            // drugs categories
            ['name' => 'Analgesics', 'description' => 'Pain relievers'],
            ['name' => 'Antibiotics', 'description' => 'Infection fighters'],
            ['name' => 'Antiseptics', 'description' => 'Wound care'],
            ['name' => 'Vitamins', 'description' => 'Nutritional supplements'],
            ['name' => 'Cough and Cold', 'description' => 'Respiratory relief'],
            ['name' => 'Allergy Medications', 'description' => 'Allergy relief'],
            ['name' => 'Digestive Aids', 'description' => 'Gastrointestinal health'],
            ['name' => 'Skin Care', 'description' => 'Dermatological products'],
            ['name' => 'Eye Care', 'description' => 'Ophthalmic solutions'],
            ['name' => 'First Aid', 'description' => 'Emergency care supplies'],
            // non-drugs categories
            ['name' => 'Medical Supplies', 'description' => 'General medical supplies'],
            ['name' => 'Personal Care', 'description' => 'Hygiene and personal care products'],
            ['name' => 'Health Devices', 'description' => 'Medical devices and equipment'],
        ];

        foreach ($data as $category) {
            \App\Models\Category::create($category);
        }
    }
}
