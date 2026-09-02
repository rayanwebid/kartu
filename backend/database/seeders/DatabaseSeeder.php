<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Major;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Admin
        User::create([
            'name' => 'Administrator',
            'email' => 'admin@admin.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
        ]);

        // Sample Majors
        Major::create(['name' => 'Rekayasa Perangkat Lunak']);
        Major::create(['name' => 'Teknik Komputer & Jaringan']);
        Major::create(['name' => 'Multimedia']);
    }
}
