<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
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
            EstablecimientoSeeder::class,
            PotreroSeeder::class,
            LoteSeeder::class,
            AnimalSeeder::class,
            PesajeSeeder::class,
            EventoSanitarioSeeder::class,
            ServicioReproductivoSeeder::class,
            GestacionSeeder::class,
            PartoSeeder::class,
            NacimientoSeeder::class,
            TipoPersonaSeeder::class,
            PersonaSeeder::class,
            OrdenCompraSeeder::class,
            CuarentenaSeeder::class,
            IngresoSeeder::class,
        ]);
    }
}
