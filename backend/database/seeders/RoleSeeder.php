<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $guard = PermissionSeeder::GUARD;

        $administrador = Role::firstOrCreate(['name' => 'administrador', 'guard_name' => $guard]);
        $gerencia = Role::firstOrCreate(['name' => 'gerencia', 'guard_name' => $guard]);
        $trabajador = Role::firstOrCreate(['name' => 'trabajador', 'guard_name' => $guard]);
        $veterinario = Role::firstOrCreate(['name' => 'veterinario', 'guard_name' => $guard]);

        $allPermissions = Permission::where('guard_name', $guard)->pluck('name')->all();
        $withoutUsers = array_values(array_filter(
            $allPermissions,
            fn (string $permission) => ! str_starts_with($permission, 'usuarios.')
        ));

        $administrador->syncPermissions($allPermissions);
        $gerencia->syncPermissions($withoutUsers);

        $trabajador->syncPermissions([
            'socios.view',
            'socios.create',
            'tipos_persona.view',
            'compras.view',
            'compras.create',
            'ventas.view',
            'ventas.create',
            'ventas.update',
            'razas.view',
            'categorias_animales.view',
            'vacunas.view',
            'estados_productivos.view',
            'tipos_eventos_sanitarios.view',
            'tipos_movimientos.view',
            'tipos_alertas.view',
            'establecimientos.view',
            'potreros.view',
            'lotes.view',
            'animales.view',
            'animales.create',
            'pesajes.view',
            'pesajes.create',
            'sanitario.view',
            'movimientos.view',
            'movimientos.create',
            'reproduccion.view',
            'indicadores.view',
            'alertas.view',
            'alertas.resolve',
            'reportes.view',
        ]);

        $veterinario->syncPermissions([
            'socios.view',
            'socios.create',
            'tipos_persona.view',
            'compras.view',
            'compras.create',
            'ventas.view',
            'razas.view',
            'categorias_animales.view',
            'vacunas.view',
            'estados_productivos.view',
            'tipos_eventos_sanitarios.view',
            'tipos_movimientos.view',
            'tipos_alertas.view',
            'establecimientos.view',
            'potreros.view',
            'lotes.view',
            'animales.view',
            'animales.create',
            'animales.update',
            'animales.export',
            'pesajes.view',
            'pesajes.create',
            'sanitario.view',
            'sanitario.create',
            'sanitario.update',
            'movimientos.view',
            'movimientos.create',
            'reproduccion.view',
            'reproduccion.create',
            'reproduccion.update',
            'indicadores.view',
            'alertas.view',
            'alertas.resolve',
            'reportes.view',
            'reportes.export',
        ]);
    }
}
