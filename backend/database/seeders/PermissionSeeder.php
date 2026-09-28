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

        // Socios de negocio
        'socios.view',
        'socios.create',
        'socios.update',
        'socios.delete',
        'socios.restore',
        'socios.activate',

        // Tipos de persona
        'tipos_persona.view',
        'tipos_persona.create',
        'tipos_persona.update',
        'tipos_persona.delete',

        // Compras
        'compras.view',
        'compras.create',
        'compras.update',
        'compras.authorize',

        // Ventas
        'ventas.view',
        'ventas.create',
        'ventas.update',
        'ventas.authorize',

        // Salidas
        'salidas.view',
        'salidas.create',

        // Traspasos
        'traspasos.view',
        'traspasos.create',
        'traspasos.update',

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

        // Vacunas (histórico; Sanidad usa medicamentos)
        'vacunas.view',
        'vacunas.create',
        'vacunas.update',
        'vacunas.delete',
        'vacunas.restore',
        'vacunas.activate',

        // Presentaciones
        'presentaciones.view',
        'presentaciones.create',
        'presentaciones.update',
        'presentaciones.delete',
        'presentaciones.restore',

        // Medicamentos
        'medicamentos.view',
        'medicamentos.create',
        'medicamentos.update',
        'medicamentos.delete',
        'medicamentos.restore',
        'medicamentos.activate',

        // Estados productivos
        'estados_productivos.view',
        'estados_productivos.create',
        'estados_productivos.update',
        'estados_productivos.delete',
        'estados_productivos.restore',
        'estados_productivos.activate',

        // Tipos de eventos sanitarios
        'tipos_eventos_sanitarios.view',
        'tipos_eventos_sanitarios.create',
        'tipos_eventos_sanitarios.update',
        'tipos_eventos_sanitarios.delete',
        'tipos_eventos_sanitarios.restore',
        'tipos_eventos_sanitarios.activate',

        // Tipos de movimientos
        'tipos_movimientos.view',
        'tipos_movimientos.create',
        'tipos_movimientos.update',
        'tipos_movimientos.delete',
        'tipos_movimientos.restore',
        'tipos_movimientos.activate',

        // Tipos de alertas
        'tipos_alertas.view',
        'tipos_alertas.create',
        'tipos_alertas.update',
        'tipos_alertas.delete',
        'tipos_alertas.restore',
        'tipos_alertas.activate',

        // Tipos de salidas
        'tipos_salidas.view',
        'tipos_salidas.create',
        'tipos_salidas.update',
        'tipos_salidas.delete',
        'tipos_salidas.restore',

        // Establecimientos
        'establecimientos.view',
        'establecimientos.create',
        'establecimientos.update',
        'establecimientos.delete',
        'establecimientos.restore',
        'establecimientos.activate',

        // Potreros
        'potreros.view',
        'potreros.create',
        'potreros.update',
        'potreros.delete',
        'potreros.restore',
        'potreros.activate',

        // Lotes
        'lotes.view',
        'lotes.create',
        'lotes.update',
        'lotes.delete',
        'lotes.restore',
        'lotes.activate',

        // Animales
        'animales.view',
        'animales.create',
        'animales.update',
        'animales.delete',
        'animales.restore',
        'animales.activate',
        'animales.export',

        // Pesajes
        'pesajes.view',
        'pesajes.create',

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
