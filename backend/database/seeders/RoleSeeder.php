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

        $superAdmin = Role::firstOrCreate(['name' => 'super-admin', 'guard_name' => $guard]);
        $administrador = Role::firstOrCreate(['name' => 'administrador', 'guard_name' => $guard]);
        $veterinario = Role::firstOrCreate(['name' => 'veterinario', 'guard_name' => $guard]);
        $trabajador = Role::firstOrCreate(['name' => 'trabajador', 'guard_name' => $guard]);

        $allPermissions = Permission::where('guard_name', $guard)->pluck('name')->toArray();

        $superAdmin->syncPermissions($allPermissions);

        $administrador->syncPermissions([
            'usuarios.view',
            'usuarios.create',
            'usuarios.update',
            'usuarios.delete',
            'usuarios.restore',
            'usuarios.activate',
            'razas.view',
            'razas.create',
            'razas.update',
            'razas.delete',
            'razas.restore',
            'razas.activate',
            'lotes.view',
            'lotes.create',
            'lotes.update',
            'lotes.delete',
            'lotes.manage',
            'animales.view',
            'animales.create',
            'animales.update',
            'animales.delete',
            'animales.restore',
            'animales.export',
            'sanitario.view',
            'sanitario.create',
            'sanitario.update',
            'sanitario.delete',
            'movimientos.view',
            'movimientos.create',
            'movimientos.update',
            'movimientos.delete',
            'movimientos.approve',
            'reproduccion.view',
            'reproduccion.create',
            'reproduccion.update',
            'reproduccion.delete',
            'indicadores.view',
            'indicadores.manage',
            'alertas.view',
            'alertas.manage',
            'alertas.resolve',
            'reportes.view',
            'reportes.export',
            'reportes.manage',
            'auditoria.view',
        ]);

        $veterinario->syncPermissions([
            'razas.view',
            'lotes.view',
            'animales.view',
            'animales.create',
            'animales.update',
            'animales.export',
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

        $trabajador->syncPermissions([
            'razas.view',
            'lotes.view',
            'animales.view',
            'animales.create',
            'sanitario.view',
            'movimientos.view',
            'movimientos.create',
            'reproduccion.view',
            'indicadores.view',
            'alertas.view',
            'alertas.resolve',
            'reportes.view',
        ]);
    }
}
