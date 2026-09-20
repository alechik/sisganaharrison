<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     *
     * Solo catálogos, infraestructura y gestión de personal.
     * El resto de registros se carga de forma operativa.
     */
    public function run(): void
    {
        $this->call([
            PermissionSeeder::class,
            RoleSeeder::class,
            UserSeeder::class,
            RazaSeeder::class,
            CategoriaAnimalSeeder::class,
            VacunaSeeder::class,
            EstadoProductivoSeeder::class,
            TipoEventoSanitarioSeeder::class,
            TipoMovimientoSeeder::class,
            TipoAlertaSeeder::class,
            TipoPersonaSeeder::class,
            EstablecimientoSeeder::class,
            PotreroSeeder::class,
            LoteSeeder::class,
        ]);
    }
}
