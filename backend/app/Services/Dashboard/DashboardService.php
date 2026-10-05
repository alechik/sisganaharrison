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
use App\Models\TipoSalida;
use App\Models\Traspaso;
use App\Models\Venta;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    /**
     * @return array<string, mixed>
     */
    public function summary(?Carbon $desde = null, ?Carbon $hasta = null): array
    {
        $desde = ($desde ?? now()->copy()->startOfYear())->copy()->startOfDay();
        $hasta = ($hasta ?? now())->copy()->endOfDay();
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
            'periodo' => [
                'desde' => $desde->toDateString(),
                'hasta' => $hasta->toDateString(),
            ],
            'estrategicos' => $this->estrategicos($desde, $hasta, (clone $hato)->count()),
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

    /**
     * Indicadores del período. Las tasas usan el hato actual (no muerto ni vendido),
     * porque no hay inventario histórico por fecha.
     *
     * @return array<string, mixed>
     */
    private function estrategicos(Carbon $desde, Carbon $hasta, int $hatoActual): array
    {
        $hembras = Animal::query()
            ->whereNotIn('estado', [Animal::ESTADO_MUERTO, Animal::ESTADO_VENDIDO])
            ->where('sexo', 'H')
            ->count();

        $nacidosVivos = $this->contarNacimientos($desde, $hasta, Nacimiento::ESTADO_VIVO);
        $nacidosMuertos = $this->contarNacimientos($desde, $hasta, Nacimiento::ESTADO_MUERTO);
        $muertes = $this->contarSalidas($desde, $hasta, TipoSalida::NOMBRE_MUERTE);
        $ventas = $this->contarSalidas($desde, $hasta, TipoSalida::NOMBRE_VENTA);
        $perdidos = $this->contarSalidas($desde, $hasta, TipoSalida::NOMBRE_PERDIDO);
        $robos = $this->contarSalidas($desde, $hasta, TipoSalida::NOMBRE_ROBO);
        $ingresos = (int) DB::table('detalle_ingresos')
            ->join('ingresos', 'ingresos.id', '=', 'detalle_ingresos.ingreso_id')
            ->whereDate('ingresos.fecha_ingreso', '>=', $desde->toDateString())
            ->whereDate('ingresos.fecha_ingreso', '<=', $hasta->toDateString())
            ->count();

        $eventos = EventoSanitario::query()
            ->whereDate('fecha', '>=', $desde->toDateString())
            ->whereDate('fecha', '<=', $hasta->toDateString());
        $animalesAtendidos = (int) (DB::table('detalle_eventos_sanitarios')
            ->join('eventos_sanitarios', 'eventos_sanitarios.id', '=', 'detalle_eventos_sanitarios.evento_sanitario_id')
            ->whereDate('eventos_sanitarios.fecha', '>=', $desde->toDateString())
            ->whereDate('eventos_sanitarios.fecha', '<=', $hasta->toDateString())
            ->selectRaw('COUNT(DISTINCT detalle_eventos_sanitarios.animal_id) as total')
            ->value('total') ?? 0);

        $vacunacion = $this->vacunacion($desde, $hasta);

        $peso = DB::table('detalle_pesajes')
            ->join('pesajes', 'pesajes.id', '=', 'detalle_pesajes.pesaje_id')
            ->whereDate('pesajes.fecha_pesaje', '>=', $desde->toDateString())
            ->whereDate('pesajes.fecha_pesaje', '<=', $hasta->toDateString());

        return [
            'hato' => [
                'hato_actual' => $hatoActual,
                'ingresos' => $ingresos,
                'nacimientos_vivos' => $nacidosVivos,
                'muertes' => $muertes,
                'ventas' => $ventas,
                'otras_bajas' => $perdidos + $robos,
                'variacion_neta' => $ingresos + $nacidosVivos - $muertes - $ventas - $perdidos - $robos,
                'formula' => 'Variación neta = animales ingresados + nacidos vivos − muertes − ventas − perdido − robo, en el período. No reconstruye el stock de cada mes.',
                'serie' => $this->serieCrecimiento($desde, $hasta),
            ],
            'mortalidad' => [
                'cantidad' => $muertes,
                'tasa' => $this->tasa($muertes, $hatoActual + $muertes),
                'formula' => 'Muertes del período (salidas tipo Muerte, una línea por animal) / (hato actual + esas muertes) × 100. No incluye crías muertas al nacer.',
            ],
            'natalidad' => [
                'nacidos_vivos' => $nacidosVivos,
                'nacidos_muertos' => $nacidosMuertos,
                'tasa' => $this->tasa($nacidosVivos, $hembras),
                'formula' => 'Nacidos vivos del período (un registro de nacimiento) / hembras del hato actual × 100. No es tasa histórica de exposición.',
            ],
            'descarte' => [
                'disponible' => false,
                'cantidad' => null,
                'tasa' => null,
                'motivo' => 'No existe estado ni tipo de salida Descarte. No se calcula una tasa.',
            ],
            'sanidad' => [
                'eventos' => (clone $eventos)->count(),
                'animales_atendidos' => $animalesAtendidos,
                'cobertura' => $this->tasa($animalesAtendidos, $hatoActual),
                'formula_cobertura' => 'Animales distintos con al menos un evento sanitario en el período / hato actual × 100. No es cobertura de vacunación.',
                'vacunacion' => $vacunacion,
            ],
            'reproduccion' => [
                'gestaciones_activas' => Gestacion::query()->where('estado', Gestacion::ESTADO_ACTIVA)->count(),
                'gestaciones_confirmadas' => Gestacion::query()
                    ->whereDate('fecha_confirmacion', '>=', $desde->toDateString())
                    ->whereDate('fecha_confirmacion', '<=', $hasta->toDateString())
                    ->count(),
                'gestaciones_parto_proximo' => Gestacion::query()
                    ->where('estado', Gestacion::ESTADO_ACTIVA)
                    ->whereNotNull('fecha_probable_parto')
                    ->whereDate('fecha_probable_parto', '<=', now()->addDays(14)->toDateString())
                    ->whereDate('fecha_probable_parto', '>=', now()->toDateString())
                    ->count(),
                'partos' => Parto::query()
                    ->whereDate('fecha_parto', '>=', $desde->toDateString())
                    ->whereDate('fecha_parto', '<=', $hasta->toDateString())
                    ->count(),
                'nota_parto_proximo' => 'Gestaciones activas con parto probable en los próximos 14 días. No depende del período.',
            ],
            'productividad' => [
                'peso_promedio_kg' => $this->decimal($peso->avg('detalle_pesajes.peso')),
                'registros_pesaje' => (clone $peso)->count(),
                'ganancia_promedio_kg' => $this->gananciaPeso($desde, $hasta),
                'formula_ganancia' => 'Promedio, por animal con al menos dos pesajes en el período, de (último peso − primer peso).',
            ],
        ];
    }

    private function tasa(int $numerador, int $denominador): ?float
    {
        if ($denominador <= 0) {
            return null;
        }

        return round(($numerador / $denominador) * 100, 1);
    }

    private function decimal(mixed $value): ?float
    {
        return $value === null ? null : round((float) $value, 2);
    }

    private function contarNacimientos(Carbon $desde, Carbon $hasta, string $estado): int
    {
        return Nacimiento::query()
            ->where('estado_nacimiento', $estado)
            ->whereHas('parto', function ($query) use ($desde, $hasta) {
                $query->whereDate('fecha_parto', '>=', $desde->toDateString())
                    ->whereDate('fecha_parto', '<=', $hasta->toDateString());
            })
            ->count();
    }

    private function contarSalidas(Carbon $desde, Carbon $hasta, string $nombre): int
    {
        return (int) DB::table('detalle_salidas')
            ->join('salidas', 'salidas.id', '=', 'detalle_salidas.salida_id')
            ->join('tipos_salidas', 'tipos_salidas.id', '=', 'salidas.tipo_salida_id')
            ->whereNull('tipos_salidas.deleted_at')
            ->where('tipos_salidas.nombre', $nombre)
            ->whereDate('salidas.fecha_salida', '>=', $desde->toDateString())
            ->whereDate('salidas.fecha_salida', '<=', $hasta->toDateString())
            ->count();
    }

    /**
     * @return array{disponible: bool, eventos: int, animales: int, tasa: float|null, nota: string}
     */
    private function vacunacion(Carbon $desde, Carbon $hasta): array
    {
        $tipoIds = DB::table('tipos_eventos_sanitarios')
            ->whereNull('deleted_at')
            ->where('nombre', 'ilike', '%vacun%')
            ->pluck('id');

        if ($tipoIds->isEmpty()) {
            return [
                'disponible' => false,
                'eventos' => 0,
                'animales' => 0,
                'tasa' => null,
                'nota' => 'Ningún tipo de evento sanitario se identifica como vacunación. No se calcula cobertura de vacuna.',
            ];
        }

        $eventos = EventoSanitario::query()
            ->whereIn('tipo_evento_id', $tipoIds)
            ->whereDate('fecha', '>=', $desde->toDateString())
            ->whereDate('fecha', '<=', $hasta->toDateString())
            ->count();
        $animales = (int) (DB::table('detalle_eventos_sanitarios')
            ->join('eventos_sanitarios', 'eventos_sanitarios.id', '=', 'detalle_eventos_sanitarios.evento_sanitario_id')
            ->whereIn('eventos_sanitarios.tipo_evento_id', $tipoIds)
            ->whereDate('eventos_sanitarios.fecha', '>=', $desde->toDateString())
            ->whereDate('eventos_sanitarios.fecha', '<=', $hasta->toDateString())
            ->selectRaw('COUNT(DISTINCT detalle_eventos_sanitarios.animal_id) as total')
            ->value('total') ?? 0);
        $hato = Animal::query()->whereNotIn('estado', [Animal::ESTADO_MUERTO, Animal::ESTADO_VENDIDO])->count();

        return [
            'disponible' => true,
            'eventos' => $eventos,
            'animales' => $animales,
            'tasa' => $this->tasa($animales, $hato),
            'nota' => 'Animales distintos en eventos cuyo tipo contiene «vacun» / hato actual × 100.',
        ];
    }

    private function gananciaPeso(Carbon $desde, Carbon $hasta): ?float
    {
        $valor = DB::selectOne(
            'SELECT ROUND(AVG(ultimo - primero)::numeric, 2) AS ganancia
             FROM (
                SELECT
                    (array_agg(detalle_pesajes.peso ORDER BY pesajes.fecha_pesaje ASC, detalle_pesajes.id ASC))[1] AS primero,
                    (array_agg(detalle_pesajes.peso ORDER BY pesajes.fecha_pesaje DESC, detalle_pesajes.id DESC))[1] AS ultimo
                FROM detalle_pesajes
                INNER JOIN pesajes ON pesajes.id = detalle_pesajes.pesaje_id
                WHERE pesajes.fecha_pesaje >= ? AND pesajes.fecha_pesaje <= ?
                GROUP BY detalle_pesajes.animal_id
                HAVING COUNT(*) >= 2
             ) AS pesos',
            [$desde->toDateString(), $hasta->toDateString()]
        );

        return $valor?->ganancia === null ? null : (float) $valor->ganancia;
    }

    /**
     * @return list<array{mes: string, ingresos: int, nacimientos: int, muertes: int, ventas: int, otras_bajas: int}>
     */
    private function serieCrecimiento(Carbon $desde, Carbon $hasta): array
    {
        $ingresos = $this->seriePorMes(
            'detalle_ingresos',
            'ingresos',
            'ingreso_id',
            'fecha_ingreso',
            $desde,
            $hasta
        );
        $nacimientos = $this->serieNacimientos($desde, $hasta);
        $muertes = $this->serieSalidas($desde, $hasta, TipoSalida::NOMBRE_MUERTE);
        $ventas = $this->serieSalidas($desde, $hasta, TipoSalida::NOMBRE_VENTA);
        $otras = [];
        foreach ([$this->serieSalidas($desde, $hasta, TipoSalida::NOMBRE_PERDIDO), $this->serieSalidas($desde, $hasta, TipoSalida::NOMBRE_ROBO)] as $mapa) {
            foreach ($mapa as $mes => $total) {
                $otras[$mes] = ($otras[$mes] ?? 0) + $total;
            }
        }

        $serie = [];
        $cursor = $desde->copy()->startOfMonth();
        $fin = $hasta->copy()->startOfMonth();
        $limite = 0;
        while ($cursor <= $fin && $limite < 60) {
            $mes = $cursor->format('Y-m');
            $serie[] = [
                'mes' => $mes,
                'ingresos' => $ingresos[$mes] ?? 0,
                'nacimientos' => $nacimientos[$mes] ?? 0,
                'muertes' => $muertes[$mes] ?? 0,
                'ventas' => $ventas[$mes] ?? 0,
                'otras_bajas' => $otras[$mes] ?? 0,
            ];
            $cursor->addMonth();
            $limite++;
        }

        return $serie;
    }

    /**
     * @return array<string, int>
     */
    private function seriePorMes(string $detalle, string $cabecera, string $fk, string $fecha, Carbon $desde, Carbon $hasta): array
    {
        return DB::table($detalle)
            ->join($cabecera, $cabecera.'.id', '=', $detalle.'.'.$fk)
            ->whereDate($cabecera.'.'.$fecha, '>=', $desde->toDateString())
            ->whereDate($cabecera.'.'.$fecha, '<=', $hasta->toDateString())
            ->selectRaw("to_char({$cabecera}.{$fecha}, 'YYYY-MM') as mes, COUNT(*) as total")
            ->groupByRaw("to_char({$cabecera}.{$fecha}, 'YYYY-MM')")
            ->pluck('total', 'mes')
            ->map(fn ($total) => (int) $total)
            ->all();
    }

    /**
     * @return array<string, int>
     */
    private function serieNacimientos(Carbon $desde, Carbon $hasta): array
    {
        return DB::table('nacimientos')
            ->join('partos', 'partos.id', '=', 'nacimientos.parto_id')
            ->where('nacimientos.estado_nacimiento', Nacimiento::ESTADO_VIVO)
            ->whereDate('partos.fecha_parto', '>=', $desde->toDateString())
            ->whereDate('partos.fecha_parto', '<=', $hasta->toDateString())
            ->selectRaw("to_char(partos.fecha_parto, 'YYYY-MM') as mes, COUNT(*) as total")
            ->groupByRaw("to_char(partos.fecha_parto, 'YYYY-MM')")
            ->pluck('total', 'mes')
            ->map(fn ($total) => (int) $total)
            ->all();
    }

    /**
     * @return array<string, int>
     */
    private function serieSalidas(Carbon $desde, Carbon $hasta, string $nombre): array
    {
        return DB::table('detalle_salidas')
            ->join('salidas', 'salidas.id', '=', 'detalle_salidas.salida_id')
            ->join('tipos_salidas', 'tipos_salidas.id', '=', 'salidas.tipo_salida_id')
            ->whereNull('tipos_salidas.deleted_at')
            ->where('tipos_salidas.nombre', $nombre)
            ->whereDate('salidas.fecha_salida', '>=', $desde->toDateString())
            ->whereDate('salidas.fecha_salida', '<=', $hasta->toDateString())
            ->selectRaw("to_char(salidas.fecha_salida, 'YYYY-MM') as mes, COUNT(*) as total")
            ->groupByRaw("to_char(salidas.fecha_salida, 'YYYY-MM')")
            ->pluck('total', 'mes')
            ->map(fn ($total) => (int) $total)
            ->all();
    }
}
