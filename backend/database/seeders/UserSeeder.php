<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::create([
            'nombre' => 'Administrador',
            'apellido' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => Hash::make('12345678'),
        ]);

        $admin->assignRole('super-admin');

        $vet = User::create([
            'nombre' => 'Veterinario',
            'apellido' => 'Vet',
            'email' => 'vet@gmail.com',
            'password' => Hash::make('12345678'),
        ]);

        $vet->assignRole('veterinario');

        $trabajador = User::create([
            'nombre' => 'Trabajador',
            'apellido' => 'Trab',
            'email' => 'trabajador@gmail.com',
            'password' => Hash::make('12345678'),
        ]);

        $trabajador->assignRole('trabajador');
    }
}
