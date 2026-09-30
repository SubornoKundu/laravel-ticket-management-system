<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 3 admin accounts — logged into the admin panel (ticket management + admin management).
        $admins = [
            ['name' => 'Admin One', 'email' => 'admin1@example.com', 'password' => 'admin123'],
            ['name' => 'Admin Two', 'email' => 'admin2@example.com', 'password' => 'admin123'],
            ['name' => 'Admin Three', 'email' => 'admin3@example.com', 'password' => 'admin123'],
        ];

        foreach ($admins as $admin) {
            User::firstOrCreate(
                ['email' => $admin['email']],
                [
                    'name' => $admin['name'],
                    'password' => Hash::make($admin['password']),
                    'email_verified_at' => now(),
                    'role' => 'admin',
                ],
            );
        }

        // 2 regular test users — the "normal user" panel.
        $users = [
            ['name' => 'Test User One', 'email' => 'user1@example.com', 'password' => 'user123'],
            ['name' => 'Test User Two', 'email' => 'user2@example.com', 'password' => 'user123'],
        ];

        foreach ($users as $user) {
            User::firstOrCreate(
                ['email' => $user['email']],
                [
                    'name' => $user['name'],
                    'password' => Hash::make($user['password']),
                    'email_verified_at' => now(),
                    'role' => 'user',
                ],
            );
        }
    }
}
