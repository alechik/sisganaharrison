<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;

class PermissionSeeder extends Seeder
{
    public const GUARD = 'web';

    /**
     * Catálogo completo de permisos RBAC del sistema.
     *
     * @var list<string>
     */
    public const PERMISSIONS = [
        // Usuarios
        'usuarios.view',
        'usuarios.create',
        'usuarios.update',
        'usuarios.delete',
        'usuarios.restore',
        'usuarios.activate',

        // Razas
        'razas.view',
        'razas.create',
        'razas.update',
        'razas.delete',
        'razas.restore',
        'razas.activate',

        // Categorías de animales
        'categorias_animales.view',
        'categorias_animales.create',
        'categorias_animales.update',
        'categorias_animales.delete',
        'categorias_animales.restore',
        'categorias_animales.activate',

        // Lotes
        'lotes.view',
        'lotes.create',
        'lotes.update',
        'lotes.delete',
        'lotes.manage',

        // Animales
        'animales.view',
        'animales.create',
        'animales.update',
        'animales.delete',
        'animales.restore',
        'animales.export',

        // Historial sanitario
        'sanitario.view',
        'sanitario.create',
        'sanitario.update',
        'sanitario.delete',

        // Movimientos
        'movimientos.view',
        'movimientos.create',
        'movimientos.update',
        'movimientos.delete',
        'movimientos.approve',

        // Reproducción
        'reproduccion.view',
        'reproduccion.create',
        'reproduccion.update',
        'reproduccion.delete',

        // Indicadores
        'indicadores.view',
        'indicadores.manage',

        // Alertas
        'alertas.view',
        'alertas.manage',
        'alertas.resolve',

        // Reportes
        'reportes.view',
        'reportes.export',
        'reportes.manage',

        // Auditoría
        'auditoria.view',
    ];

    public function run(): void
    {
        foreach (self::PERMISSIONS as $permission) {
            Permission::firstOrCreate([
                'name' => $permission,
                'guard_name' => self::GUARD,
            ]);
        }
    }
}
