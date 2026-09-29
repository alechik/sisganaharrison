<?php

namespace App\Services\Dashboard;

use App\Models\Animal;
use App\Models\Cuarentena;
use App\Models\Establecimiento;
use App\Models\EventoSanitario;
use App\Models\Gestacion;
use App\Models\Ingreso;
use App\Models\Lote;
use App\Models\Nacimiento;
use App\Models\OrdenCompra;
use App\Models\Parto;
use App\Models\Pesaje;
use App\Models\Potrero;
use App\Models\Salida;
use App\Models\ServicioReproductivo;
use App\Models\Traspaso;
use App\Models\Venta;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function summary(): array
    {
        $desdeMeses = now()->subMonths(5)->startOfMonth();
        $desde30 = now()->subDays(30)->startOfDay();
        $partoProntoHasta = now()->addDays(14)->toDateString();

        $hato = Animal::query()->whereNotIn('animales.estado', [
            Animal::ESTADO_MUERTO,
            Animal::ESTADO_VENDIDO,
        ]);

        $porSexo = (clone $hato)
            ->select('animales.sexo', DB::raw('COUNT(*) as total'))
            ->groupBy('animales.sexo')
            ->pluck('total', 'sexo');

        $porEstado = Animal::query()
            ->select('estado', DB::raw('COUNT(*) as total'))
            ->groupBy('estado')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'label' => (string) $row->estado,
                'total' => (int) $row->total,
            ])
            ->values()
            ->all();

        $porCategoria = (clone $hato)
            ->join('categorias_animales', 'categorias_animales.id', '=', 'animales.categoria_id')
            ->select('categorias_animales.nombre as label', DB::raw('COUNT(*) as total'))
            ->groupBy('categorias_animales.id', 'categorias_animales.nombre')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'label' => (string) $row->label,
                'total' => (int) $row->total,
            ])
            ->all();

        $porEstadoProductivo = (clone $hato)
            ->leftJoin('estados_productivos', 'estados_productivos.id', '=', 'animales.estado_productivo_id')
            ->select(
                DB::raw("COALESCE(estados_productivos.nombre, 'Sin estado') as label"),
                DB::raw('COUNT(*) as total')
            )
            ->groupBy(DB::raw("COALESCE(estados_productivos.nombre, 'Sin estado')"))
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'label' => (string) $row->label,
                'total' => (int) $row->total,
            ])
            ->all();

        $lotesOcupacion = $this->ocupacionLotes();
        $capacidadTotal = (int) $lotesOcupacion->sum('capacidad');
        $ocupacionTotal = (int) $lotesOcupacion->sum('ocupacion');
        $lotesSobrecupo = $lotesOcupacion->filter(fn ($lote) => $lote['ocupacion'] > $lote['capacidad'] && $lote['capacidad'] > 0)->count();

        $pesoMensual = Pesaje::query()
            ->join('detalle_pesajes', 'detalle_pesajes.pesaje_id', '=', 'pesajes.id')
            ->where('pesajes.fecha_pesaje', '>=', $desdeMeses)
            ->selectRaw("to_char(date_trunc('month', pesajes.fecha_pesaje), 'YYYY-MM') as mes")
            ->selectRaw('ROUND(AVG(detalle_pesajes.peso)::numeric, 2) as promedio_kg')
            ->selectRaw('COUNT(*) as registros')
            ->groupByRaw("date_trunc('month', pesajes.fecha_pesaje)")
            ->orderByRaw("date_trunc('month', pesajes.fecha_pesaje)")
            ->get()
            ->map(fn ($row) => [
                'mes' => (string) $row->mes,
                'promedio_kg' => (float) $row->promedio_kg,
                'registros' => (int) $row->registros,
            ])
            ->all();

        $eventosPorTipo = EventoSanitario::query()
            ->join('tipos_eventos_sanitarios', 'tipos_eventos_sanitarios.id', '=', 'eventos_sanitarios.tipo_evento_id')
            ->where('eventos_sanitarios.fecha', '>=', $desdeMeses)
            ->select('tipos_eventos_sanitarios.nombre as label', DB::raw('COUNT(*) as total'))
            ->groupBy('tipos_eventos_sanitarios.id', 'tipos_eventos_sanitarios.nombre')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'label' => (string) $row->label,
                'total' => (int) $row->total,
            ])
            ->all();

        $gestacionesPartoPronto = Gestacion::query()
            ->where('estado', Gestacion::ESTADO_ACTIVA)
            ->whereNotNull('fecha_probable_parto')
            ->whereDate('fecha_probable_parto', '<=', $partoProntoHasta)
            ->count();

        return [
            'kpis' => [
                'hato_actual' => (clone $hato)->count(),
                'animales_activos' => Animal::query()->activos()->count(),
                'animales_enfermos' => Animal::query()->where('estado', Animal::ESTADO_ENFERMO)->count(),
                'establecimientos' => Establecimiento::query()->activos()->count(),
                'potreros' => Potrero::query()->activos()->count(),
                'lotes' => Lote::query()->activos()->count(),
                'ocupacion_lotes_pct' => $capacidadTotal > 0
                    ? round(($ocupacionTotal / $capacidadTotal) * 100, 1)
                    : null,
                'gestaciones_activas' => Gestacion::query()->where('estado', Gestacion::ESTADO_ACTIVA)->count(),
                'ventas_pendientes' => Venta::query()->where('estado', Venta::ESTADO_PENDIENTE)->count(),
                'ordenes_pendientes' => OrdenCompra::query()->where('estado', OrdenCompra::ESTADO_PENDIENTE)->count(),
            ],
            'nucleo' => [
                'sexo' => [
                    ['label' => 'Machos', 'total' => (int) ($porSexo['M'] ?? 0)],
                    ['label' => 'Hembras', 'total' => (int) ($porSexo['H'] ?? 0)],
                ],
                'categorias' => $porCategoria,
                'estados_productivos' => $porEstadoProductivo,
                'estados_operativos' => $porEstado,
            ],
            'infraestructura' => [
                'capacidad_total' => $capacidadTotal,
                'ocupacion_total' => $ocupacionTotal,
                'lotes_sobrecupo' => $lotesSobrecupo,
                'lotes' => $lotesOcupacion->take(8)->values()->all(),
            ],
            'produccion' => [
                'peso_promedio_mensual' => $pesoMensual,
                'pesajes_30d' => Pesaje::query()->where('fecha_pesaje', '>=', $desde30)->count(),
            ],
            'sanidad_reproduccion' => [
                'eventos_30d' => EventoSanitario::query()->where('fecha', '>=', $desde30)->count(),
                'eventos_por_tipo' => $eventosPorTipo,
                'servicios_pendientes' => ServicioReproductivo::query()
                    ->where('resultado', 'PENDIENTE')
                    ->count(),
                'gestaciones_activas' => Gestacion::query()->where('estado', Gestacion::ESTADO_ACTIVA)->count(),
                'gestaciones_parto_proximo' => $gestacionesPartoPronto,
                'partos_pendientes' => Parto::query()->where('estado', Parto::ESTADO_PENDIENTE)->count(),
                'nacimientos_30d_vivos' => Nacimiento::query()
                    ->where('estado_nacimiento', Nacimiento::ESTADO_VIVO)
                    ->whereHas('parto', fn ($q) => $q->where('fecha_parto', '>=', $desde30))
                    ->count(),
                'nacimientos_30d_muertos' => Nacimiento::query()
                    ->where('estado_nacimiento', Nacimiento::ESTADO_MUERTO)
                    ->whereHas('parto', fn ($q) => $q->where('fecha_parto', '>=', $desde30))
                    ->count(),
            ],
            'movimientos' => [
                'ordenes_pendientes' => OrdenCompra::query()->where('estado', OrdenCompra::ESTADO_PENDIENTE)->count(),
                'cuarentenas_en_proceso' => Cuarentena::query()->where('estado', Cuarentena::ESTADO_PROCESADO)->count(),
                'ingresos_30d' => Ingreso::query()->where('fecha_ingreso', '>=', $desde30)->count(),
                'ventas_pendientes' => Venta::query()->where('estado', Venta::ESTADO_PENDIENTE)->count(),
                'salidas_30d' => Salida::query()->where('fecha_salida', '>=', $desde30)->count(),
                'traspasos_30d' => Traspaso::query()->where('fecha_traspaso', '>=', $desde30)->count(),
            ],
            'pendientes' => $this->pendientes($gestacionesPartoPronto, $lotesSobrecupo),
            'actividad_reciente' => $this->actividadReciente(),
        ];
    }

    /**
     * @return \Illuminate\Support\Collection<int, array{codigo: string, nombre: string, capacidad: int, ocupacion: int, pct: float|null}>
     */
    private function ocupacionLotes()
    {
        $muerto = Animal::ESTADO_MUERTO;
        $vendido = Animal::ESTADO_VENDIDO;

        return Lote::query()
            ->activos()
            ->select('lotes.id', 'lotes.codigo', 'lotes.nombre', 'lotes.capacidad_animales')
            ->selectRaw(
                "(SELECT COUNT(*) FROM animales
                  WHERE animales.lote_id = lotes.id
                    AND animales.deleted_at IS NULL
                    AND animales.estado NOT IN (?, ?)) as ocupacion",
                [$muerto, $vendido]
            )
            ->orderByDesc('ocupacion')
            ->get()
            ->map(function ($lote) {
                $capacidad = (int) $lote->capacidad_animales;
                $ocupacion = (int) $lote->ocupacion;

                return [
                    'codigo' => (string) $lote->codigo,
                    'nombre' => (string) $lote->nombre,
                    'capacidad' => $capacidad,
                    'ocupacion' => $ocupacion,
                    'pct' => $capacidad > 0 ? round(($ocupacion / $capacidad) * 100, 1) : null,
                ];
            });
    }

    /**
     * @return list<array{tipo: string, titulo: string, total: int, nivel: string}>
     */
    private function pendientes(int $gestacionesPartoPronto, int $lotesSobrecupo): array
    {
        $items = [
            [
                'tipo' => 'ventas',
                'titulo' => 'Ventas por autorizar',
                'total' => Venta::query()->where('estado', Venta::ESTADO_PENDIENTE)->count(),
                'nivel' => 'warning',
            ],
            [
                'tipo' => 'compras',
                'titulo' => 'Órdenes de compra pendientes',
                'total' => OrdenCompra::query()->where('estado', OrdenCompra::ESTADO_PENDIENTE)->count(),
                'nivel' => 'warning',
            ],
            [
                'tipo' => 'cuarentenas',
                'titulo' => 'Cuarentenas en proceso',
                'total' => Cuarentena::query()->where('estado', Cuarentena::ESTADO_PROCESADO)->count(),
                'nivel' => 'info',
            ],
            [
                'tipo' => 'reproduccion',
                'titulo' => 'Servicios reproductivos pendientes',
                'total' => ServicioReproductivo::query()->where('resultado', 'PENDIENTE')->count(),
                'nivel' => 'info',
            ],
            [
                'tipo' => 'reproduccion',
                'titulo' => 'Partos pendientes de finalizar',
                'total' => Parto::query()->where('estado', Parto::ESTADO_PENDIENTE)->count(),
                'nivel' => 'warning',
            ],
            [
                'tipo' => 'reproduccion',
                'titulo' => 'Gestaciones con parto probable ≤ 14 días',
                'total' => $gestacionesPartoPronto,
                'nivel' => 'warning',
            ],
            [
                'tipo' => 'sanidad',
                'titulo' => 'Animales en estado ENFERMO',
                'total' => Animal::query()->where('estado', Animal::ESTADO_ENFERMO)->count(),
                'nivel' => 'error',
            ],
            [
                'tipo' => 'lotes',
                'titulo' => 'Lotes sobre capacidad',
                'total' => $lotesSobrecupo,
                'nivel' => 'error',
            ],
        ];

        return array_values(array_filter($items, fn ($item) => $item['total'] > 0));
    }

    /**
     * @return list<array{tipo: string, referencia: string, fecha: string}>
     */
    private function actividadReciente(): array
    {
        $items = [];

        foreach (
            [
                ['ingreso', Ingreso::query()->latest('fecha_ingreso')->limit(4)->get(['codigo', 'fecha_ingreso']), 'codigo', 'fecha_ingreso'],
                ['venta', Venta::query()->latest('fecha_venta')->limit(4)->get(['cod_venta', 'fecha_venta']), 'cod_venta', 'fecha_venta'],
                ['salida', Salida::query()->latest('fecha_salida')->limit(4)->get(['codigo', 'fecha_salida']), 'codigo', 'fecha_salida'],
                ['traspaso', Traspaso::query()->latest('fecha_traspaso')->limit(4)->get(['id', 'fecha_traspaso']), 'id', 'fecha_traspaso'],
                ['pesaje', Pesaje::query()->latest('fecha_pesaje')->limit(4)->get(['codigo_pesaje', 'fecha_pesaje']), 'codigo_pesaje', 'fecha_pesaje'],
                ['sanitario', EventoSanitario::query()->latest('fecha')->limit(4)->get(['id', 'fecha']), 'id', 'fecha'],
            ] as [$tipo, $rows, $ref, $fecha]
        ) {
            foreach ($rows as $row) {
                $valorFecha = $row->{$fecha};
                $items[] = [
                    'tipo' => $tipo,
                    'referencia' => $tipo === 'traspaso' || $tipo === 'sanitario'
                        ? '#'.$row->{$ref}
                        : (string) $row->{$ref},
                    'fecha' => $valorFecha instanceof Carbon
                        ? $valorFecha->format('Y-m-d')
                        : (string) $valorFecha,
                ];
            }
        }

        usort($items, fn ($a, $b) => strcmp($b['fecha'], $a['fecha']));

        return array_slice($items, 0, 8);
    }
}
