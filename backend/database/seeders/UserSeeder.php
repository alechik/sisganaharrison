<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('12345678');

        $admin = User::create([
            'nombre' => 'Administrador',
            'apellido' => 'Admin',
            'email' => 'admin@gmail.com',
            'password' => $password,
        ]);
        $admin->assignRole('administrador');

        $gerencia = User::create([
            'nombre' => 'Gerencia',
            'apellido' => 'Gcia',
            'email' => 'gerencia@gmail.com',
            'password' => $password,
        ]);
        $gerencia->assignRole('gerencia');

        $trabajador = User::create([
            'nombre' => 'Trabajador',
            'apellido' => 'Trab',
            'email' => 'trabajador@gmail.com',
            'password' => $password,
        ]);
        $trabajador->assignRole('trabajador');

        $vet = User::create([
            'nombre' => 'Veterinario',
            'apellido' => 'Vet',
            'email' => 'vet@gmail.com',
            'password' => $password,
        ]);
        $vet->assignRole('veterinario');
    }
}
