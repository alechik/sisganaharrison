<?php

namespace App\Services\Reportes;

use App\Models\Animal;
use App\Models\DetalleEventoSanitario;
use App\Models\EventoSanitario;
use App\Models\Gestacion;
use App\Models\Nacimiento;
use App\Models\Parto;
use App\Models\Pesaje;
use App\Models\ServicioReproductivo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class ReporteService
{
    public const TIPOS = [
        'inventario',
        'sanidad',
        'reproduccion',
        'movimientos',
        'productividad',
    ];

    public const TIPOS_PERIODO = [
        'sanidad',
        'reproduccion',
        'movimientos',
        'productividad',
    ];

    /**
     * @param  array<string, mixed>  $filtros
     * @return array<string, mixed>
     */
    public function generar(string $tipo, array $filtros): array
    {
        return match ($tipo) {
            'inventario' => $this->inventario($filtros),
            'sanidad' => $this->sanidad($filtros),
            'reproduccion' => $this->reproduccion($filtros),
            'movimientos' => $this->movimientos($filtros),
            'productividad' => $this->productividad($filtros),
            default => abort(404),
        };
    }

    /**
     * @param  array<string, mixed>  $filtros
     * @return array<string, mixed>
     */
    private function inventario(array $filtros): array
    {
        $query = $this->inventarioQuery($filtros);
        $total = (clone $query)->count();

        $detalle = (clone $query)
            ->leftJoin('razas', 'razas.id', '=', 'animales.raza_id')
            ->leftJoin('categorias_animales', 'categorias_animales.id', '=', 'animales.categoria_id')
            ->leftJoin('estados_productivos', 'estados_productivos.id', '=', 'animales.estado_productivo_id')
            ->leftJoin('lotes', 'lotes.id', '=', 'animales.lote_id')
            ->select([
                'animales.codigo',
                'animales.arete',
                'animales.sexo',
                'animales.estado',
            ])
            ->selectRaw("COALESCE(razas.nombre, '—') as raza")
            ->selectRaw("COALESCE(categorias_animales.nombre, '—') as categoria")
            ->selectRaw("COALESCE(estados_productivos.nombre, '—') as estado_productivo")
            ->selectRaw("COALESCE(lotes.nombre, '—') as lote")
            ->orderBy('animales.codigo');

        return $this->envoltorio(
            'inventario',
            'Inventario del hato',
            $this->filtrosInventario($filtros),
            [
                $this->total('Animales', $total),
            ],
            [
                $this->grupo(
                    clone $query,
                    "CASE animales.sexo WHEN 'M' THEN 'Machos' WHEN 'H' THEN 'Hembras' ELSE animales.sexo END",
                    'Por sexo',
                ),
                $this->grupoJoin(
                    (clone $query)->join('categorias_animales', 'categorias_animales.id', '=', 'animales.categoria_id'),
                    'categorias_animales.nombre',
                    ['categorias_animales.id', 'categorias_animales.nombre'],
                    'Por categoría',
                ),
                $this->grupoJoin(
                    (clone $query)->leftJoin('razas', 'razas.id', '=', 'animales.raza_id'),
                    "COALESCE(razas.nombre, 'Sin raza')",
                    [DB::raw("COALESCE(razas.nombre, 'Sin raza')")],
                    'Por raza',
                ),
                $this->grupoJoin(
                    (clone $query)->leftJoin('estados_productivos', 'estados_productivos.id', '=', 'animales.estado_productivo_id'),
                    "COALESCE(estados_productivos.nombre, 'Sin estado productivo')",
                    [DB::raw("COALESCE(estados_productivos.nombre, 'Sin estado productivo')")],
                    'Por estado productivo',
                ),
                $this->grupoJoin(
                    (clone $query)->leftJoin('lotes', 'lotes.id', '=', 'animales.lote_id'),
                    "COALESCE(lotes.nombre, 'Sin lote')",
                    [DB::raw("COALESCE(lotes.nombre, 'Sin lote')")],
                    'Por lote',
                ),
            ],
            $this->paginar($detalle, $filtros, $total, ['Código', 'Arete', 'Sexo', 'Raza', 'Categoría', 'Estado productivo', 'Estado', 'Lote'], function ($row) {
                return [
                    (string) $row->codigo,
                    (string) ($row->arete ?: '—'),
                    $row->sexo === 'M' ? 'Macho' : ($row->sexo === 'H' ? 'Hembra' : (string) $row->sexo),
                    (string) $row->raza,
                    (string) $row->categoria,
                    (string) $row->estado_productivo,
                    (string) $row->estado,
                    (string) $row->lote,
                ];
            }),
        );
    }

    /**
     * @param  array<string, mixed>  $filtros
     */
    private function inventarioQuery(array $filtros): Builder
    {
        $query = Animal::query();

        if (! empty($filtros['estado'])) {
            $query->where('animales.estado', $filtros['estado']);
        } else {
            $query->whereNotIn('animales.estado', [Animal::ESTADO_MUERTO, Animal::ESTADO_VENDIDO]);
        }

        if (! empty($filtros['sexo'])) {
            $query->where('animales.sexo', $filtros['sexo']);
        }
        if (! empty($filtros['raza_id'])) {
            $query->where('animales.raza_id', $filtros['raza_id']);
        }
        if (! empty($filtros['categoria_id'])) {
            $query->where('animales.categoria_id', $filtros['categoria_id']);
        }
        if (! empty($filtros['estado_productivo_id'])) {
            $query->where('animales.estado_productivo_id', $filtros['estado_productivo_id']);
        }
        if (! empty($filtros['lote_id'])) {
            $query->where('animales.lote_id', $filtros['lote_id']);
        }

        return $query;
    }

    /**
     * @param  array<string, mixed>  $filtros
     * @return array<string, mixed>
     */
    private function sanidad(array $filtros): array
    {
        $eventos = $this->eventosSanitariosQuery($filtros);
        $detalles = $this->detallesSanitariosQuery($filtros);

        $totalEventos = (clone $eventos)->count();
        $totalAplicaciones = (clone $detalles)->count();
        $animales = (int) ((clone $detalles)->selectRaw('COUNT(DISTINCT detalle_eventos_sanitarios.animal_id) as total')->value('total') ?? 0);

        $detalle = (clone $detalles)
            ->join('animales', 'animales.id', '=', 'detalle_eventos_sanitarios.animal_id')
            ->join('tipos_eventos_sanitarios', 'tipos_eventos_sanitarios.id', '=', 'eventos_sanitarios.tipo_evento_id')
            ->leftJoin('medicamentos', 'medicamentos.id', '=', 'detalle_eventos_sanitarios.medicamento_id')
            ->select([
                'eventos_sanitarios.fecha',
                'animales.codigo',
                'tipos_eventos_sanitarios.nombre as tipo',
                'eventos_sanitarios.diagnostico',
            ])
            ->selectRaw("COALESCE(medicamentos.nombre, '—') as medicamento")
            ->orderByDesc('eventos_sanitarios.fecha')
            ->orderBy('animales.codigo');

        return $this->envoltorio(
            'sanidad',
            'Reporte sanitario',
            [$this->periodo($filtros)],
            [
                $this->total('Eventos', $totalEventos),
                $this->total('Aplicaciones', $totalAplicaciones),
                $this->total('Animales atendidos', $animales),
            ],
            [
                $this->grupoJoin(
                    (clone $eventos)->join('tipos_eventos_sanitarios', 'tipos_eventos_sanitarios.id', '=', 'eventos_sanitarios.tipo_evento_id'),
                    'tipos_eventos_sanitarios.nombre',
                    ['tipos_eventos_sanitarios.id', 'tipos_eventos_sanitarios.nombre'],
                    'Eventos por tipo',
                ),
            ],
            $this->paginar($detalle, $filtros, $totalAplicaciones, ['Fecha', 'Animal', 'Tipo', 'Medicamento', 'Diagnóstico'], function ($row) {
                return [
                    $this->fecha($row->fecha),
                    (string) $row->codigo,
                    (string) $row->tipo,
                    (string) $row->medicamento,
                    (string) ($row->diagnostico ?: '—'),
                ];
            }),
        );
    }

    /**
     * @param  array<string, mixed>  $filtros
     */
    private function eventosSanitariosQuery(array $filtros): Builder
    {
        $query = EventoSanitario::query()
            ->whereDate('eventos_sanitarios.fecha', '>=', $filtros['desde'])
            ->whereDate('eventos_sanitarios.fecha', '<=', $filtros['hasta']);

        if (! empty($filtros['tipo_evento_id'])) {
            $query->where('eventos_sanitarios.tipo_evento_id', $filtros['tipo_evento_id']);
        }
        if (! empty($filtros['animal_id'])) {
            $query->whereHas('detalles', fn ($q) => $q->where('animal_id', $filtros['animal_id']));
        }

        return $query;
    }

    /**
     * @param  array<string, mixed>  $filtros
     */
    private function detallesSanitariosQuery(array $filtros): Builder
    {
        $query = DetalleEventoSanitario::query()
            ->join('eventos_sanitarios', 'eventos_sanitarios.id', '=', 'detalle_eventos_sanitarios.evento_sanitario_id')
            ->whereDate('eventos_sanitarios.fecha', '>=', $filtros['desde'])
            ->whereDate('eventos_sanitarios.fecha', '<=', $filtros['hasta']);

        if (! empty($filtros['tipo_evento_id'])) {
            $query->where('eventos_sanitarios.tipo_evento_id', $filtros['tipo_evento_id']);
        }
        if (! empty($filtros['animal_id'])) {
            $query->where('detalle_eventos_sanitarios.animal_id', $filtros['animal_id']);
        }

        return $query;
    }

    /**
     * @param  array<string, mixed>  $filtros
     * @return array<string, mixed>
     */
    private function reproduccion(array $filtros): array
    {
        $servicios = $this->serviciosQuery($filtros);
        $partos = Parto::query()
            ->whereDate('fecha_parto', '>=', $filtros['desde'])
            ->whereDate('fecha_parto', '<=', $filtros['hasta']);

        $detalle = (clone $servicios)
            ->join('animales as hembras', 'hembras.id', '=', 'servicios_reproductivos.hembra_id')
            ->leftJoin('animales as machos', 'machos.id', '=', 'servicios_reproductivos.macho_id')
            ->select([
                'servicios_reproductivos.fecha_servicio',
                'servicios_reproductivos.tipo_servicio',
                'servicios_reproductivos.resultado',
                'hembras.codigo as hembra',
            ])
            ->selectRaw("COALESCE(machos.codigo, '—') as macho")
            ->orderByDesc('servicios_reproductivos.fecha_servicio');

        return $this->envoltorio(
            'reproduccion',
            'Reporte reproductivo',
            [$this->periodo($filtros)],
            [
                $this->total('Servicios', (clone $servicios)->count()),
                $this->total('Partos', (clone $partos)->count()),
                $this->total('Nacidos vivos', $this->contarNacimientos($filtros, Nacimiento::ESTADO_VIVO)),
                $this->total('Nacidos muertos', $this->contarNacimientos($filtros, Nacimiento::ESTADO_MUERTO)),
                $this->total('Gestaciones activas (situación actual)', Gestacion::query()->where('estado', Gestacion::ESTADO_ACTIVA)->count()),
            ],
            [
                $this->grupo((clone $servicios), 'tipo_servicio', 'Servicios por tipo'),
                $this->grupo((clone $servicios), 'resultado', 'Servicios por resultado'),
            ],
            $this->paginar($detalle, $filtros, (clone $servicios)->count(), ['Fecha', 'Hembra', 'Macho', 'Tipo', 'Resultado'], function ($row) {
                return [
                    $this->fecha($row->fecha_servicio),
                    (string) $row->hembra,
                    (string) $row->macho,
                    (string) $row->tipo_servicio,
                    (string) ($row->resultado ?: '—'),
                ];
            }),
        );
    }

    /**
     * @param  array<string, mixed>  $filtros
     */
    private function serviciosQuery(array $filtros): Builder
    {
        return ServicioReproductivo::query()
            ->whereDate('servicios_reproductivos.fecha_servicio', '>=', $filtros['desde'])
            ->whereDate('servicios_reproductivos.fecha_servicio', '<=', $filtros['hasta']);
    }

    /**
     * @param  array<string, mixed>  $filtros
     * @return array<string, mixed>
     */
    private function movimientos(array $filtros): array
    {
        $desde = (string) $filtros['desde'];
        $hasta = (string) $filtros['hasta'];

        $ingresos = $this->contarLineas('detalle_ingresos', 'ingresos', 'ingreso_id', 'fecha_ingreso', $desde, $hasta);
        $traspasos = $this->contarLineas('detalle_traspasos', 'traspasos', 'traspaso_id', 'fecha_traspaso', $desde, $hasta);
        $salidas = $this->contarLineas('detalle_salidas', 'salidas', 'salida_id', 'fecha_salida', $desde, $hasta);

        $porTipo = DB::table('detalle_salidas')
            ->join('salidas', 'salidas.id', '=', 'detalle_salidas.salida_id')
            ->join('tipos_salidas', 'tipos_salidas.id', '=', 'salidas.tipo_salida_id')
            ->whereDate('salidas.fecha_salida', '>=', $desde)
            ->whereDate('salidas.fecha_salida', '<=', $hasta)
            ->select('tipos_salidas.nombre as etiqueta', DB::raw('COUNT(*) as total'))
            ->groupBy('tipos_salidas.id', 'tipos_salidas.nombre')
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => ['etiqueta' => (string) $row->etiqueta, 'total' => (string) $row->total])
            ->all();

        $union = $this->movimientosUnion($desde, $hasta);
        $totalLineas = (int) DB::query()->fromSub($union, 'movimientos')->count();
        $page = $this->pagina($filtros);
        $perPage = $this->porPagina($filtros);
        $filas = DB::query()
            ->fromSub($this->movimientosUnion($desde, $hasta), 'movimientos')
            ->orderByDesc('fecha')
            ->orderBy('animal')
            ->forPage($page['page'], $perPage)
            ->get()
            ->map(fn ($row) => [
                $this->fecha($row->fecha),
                (string) $row->tipo,
                (string) $row->documento,
                (string) $row->animal,
                (string) $row->detalle,
            ])
            ->all();

        return $this->envoltorio(
            'movimientos',
            'Movimientos, entradas y salidas',
            [$this->periodo($filtros)],
            [
                $this->total('Animales ingresados', $ingresos),
                $this->total('Animales traspasados', $traspasos),
                $this->total('Animales salidos', $salidas),
            ],
            [
                ['titulo' => 'Salidas por tipo', 'filas' => $porTipo],
            ],
            $this->detalleManual(
                ['Fecha', 'Tipo', 'Documento', 'Animal', 'Detalle'],
                $filas,
                $totalLineas,
                $page['page'],
                $perPage,
                (bool) ($filtros['para_pdf'] ?? false),
            ),
        );
    }

    private function movimientosUnion(string $desde, string $hasta): QueryBuilder
    {
        $ingresos = DB::table('detalle_ingresos')
            ->join('ingresos', 'ingresos.id', '=', 'detalle_ingresos.ingreso_id')
            ->join('animales', 'animales.id', '=', 'detalle_ingresos.animal_id')
            ->leftJoin('lotes', 'lotes.id', '=', 'ingresos.lote_id')
            ->whereDate('ingresos.fecha_ingreso', '>=', $desde)
            ->whereDate('ingresos.fecha_ingreso', '<=', $hasta)
            ->selectRaw('ingresos.fecha_ingreso as fecha')
            ->selectRaw('ingresos.codigo as documento')
            ->selectRaw("'Ingreso' as tipo")
            ->selectRaw('animales.codigo as animal')
            ->selectRaw("COALESCE(lotes.nombre, '—') as detalle");

        $traspasos = DB::table('detalle_traspasos')
            ->join('traspasos', 'traspasos.id', '=', 'detalle_traspasos.traspaso_id')
            ->join('animales', 'animales.id', '=', 'detalle_traspasos.animal_id')
            ->join('lotes as origen', 'origen.id', '=', 'traspasos.lote_salida_id')
            ->join('lotes as destino', 'destino.id', '=', 'traspasos.lote_ingreso_id')
            ->whereDate('traspasos.fecha_traspaso', '>=', $desde)
            ->whereDate('traspasos.fecha_traspaso', '<=', $hasta)
            ->selectRaw('traspasos.fecha_traspaso as fecha')
            ->selectRaw("('TR-' || traspasos.id) as documento")
            ->selectRaw("'Traspaso' as tipo")
            ->selectRaw('animales.codigo as animal')
            ->selectRaw("(origen.nombre || ' → ' || destino.nombre) as detalle");

        $salidas = DB::table('detalle_salidas')
            ->join('salidas', 'salidas.id', '=', 'detalle_salidas.salida_id')
            ->join('animales', 'animales.id', '=', 'detalle_salidas.animal_id')
            ->join('tipos_salidas', 'tipos_salidas.id', '=', 'salidas.tipo_salida_id')
            ->whereDate('salidas.fecha_salida', '>=', $desde)
            ->whereDate('salidas.fecha_salida', '<=', $hasta)
            ->selectRaw('salidas.fecha_salida as fecha')
            ->selectRaw('salidas.codigo as documento')
            ->selectRaw("'Salida' as tipo")
            ->selectRaw('animales.codigo as animal')
            ->selectRaw('tipos_salidas.nombre as detalle');

        return $ingresos->unionAll($traspasos)->unionAll($salidas);
    }

    /**
     * @param  array<string, mixed>  $filtros
     * @return array<string, mixed>
     */
    private function productividad(array $filtros): array
    {
        $vivos = $this->contarNacimientos($filtros, Nacimiento::ESTADO_VIVO);
        $muertosNacimiento = $this->contarNacimientos($filtros, Nacimiento::ESTADO_MUERTO);
        $bajas = $this->contarSalidasPorNombre($filtros, 'Muerte');
        $perdidas = $this->contarSalidasPorNombre($filtros, 'Perdido') + $this->contarSalidasPorNombre($filtros, 'Robo');
        $ventas = $this->contarSalidasPorNombre($filtros, 'Venta');
        $hato = Animal::query()->whereNotIn('estado', [Animal::ESTADO_MUERTO, Animal::ESTADO_VENDIDO])->count();

        $pesajes = Pesaje::query()
            ->join('detalle_pesajes', 'detalle_pesajes.pesaje_id', '=', 'pesajes.id')
            ->whereDate('pesajes.fecha_pesaje', '>=', $filtros['desde'])
            ->whereDate('pesajes.fecha_pesaje', '<=', $filtros['hasta']);

        $registrosPeso = (clone $pesajes)->count();
        $promedio = (clone $pesajes)->avg('detalle_pesajes.peso');

        $porMes = (clone $pesajes)
            ->selectRaw("to_char(date_trunc('month', pesajes.fecha_pesaje), 'YYYY-MM') as etiqueta")
            ->selectRaw('ROUND(AVG(detalle_pesajes.peso)::numeric, 2) as total')
            ->groupByRaw("date_trunc('month', pesajes.fecha_pesaje)")
            ->orderByRaw("date_trunc('month', pesajes.fecha_pesaje)")
            ->get()
            ->map(fn ($row) => ['etiqueta' => (string) $row->etiqueta, 'total' => number_format((float) $row->total, 2, '.', '').' kg'])
            ->all();

        $detalle = (clone $pesajes)
            ->join('animales', 'animales.id', '=', 'detalle_pesajes.animal_id')
            ->select([
                'pesajes.fecha_pesaje',
                'animales.codigo',
                'detalle_pesajes.peso',
            ])
            ->orderByDesc('pesajes.fecha_pesaje')
            ->orderBy('animales.codigo');

        $totales = [
            $this->total('Nacidos vivos', $vivos),
            $this->total('Crías muertas al nacer', $muertosNacimiento),
            $this->total('Bajas por muerte', $bajas),
            $this->total('Pérdidas (perdido o robo)', $perdidas),
            $this->total('Animales vendidos', $ventas),
            $this->total('Registros de pesaje', $registrosPeso),
            $this->total('Peso promedio (kg)', $promedio === null ? '—' : number_format((float) $promedio, 2, '.', '')),
            $this->total('Hato actual de referencia', $hato),
        ];

        if ($hato > 0) {
            $totales[] = $this->total(
                'Nacidos vivos por cada 100 del hato actual',
                number_format(($vivos / $hato) * 100, 1, '.', ''),
            );
        }

        return $this->envoltorio(
            'productividad',
            'Productividad del periodo',
            [
                $this->periodo($filtros),
                ['etiqueta' => 'Nota', 'valor' => 'La referencia al hato actual no es una tasa histórica de natalidad.'],
            ],
            $totales,
            [
                ['titulo' => 'Peso promedio mensual', 'filas' => $porMes],
            ],
            $this->paginar($detalle, $filtros, $registrosPeso, ['Fecha', 'Animal', 'Peso (kg)'], function ($row) {
                return [
                    $this->fecha($row->fecha_pesaje),
                    (string) $row->codigo,
                    number_format((float) $row->peso, 2, '.', ''),
                ];
            }),
        );
    }

    /**
     * @param  array<string, mixed>  $filtros
     */
    private function nacimientosQuery(array $filtros): Builder
    {
        return Nacimiento::query()
            ->join('partos', 'partos.id', '=', 'nacimientos.parto_id')
            ->whereDate('partos.fecha_parto', '>=', $filtros['desde'])
            ->whereDate('partos.fecha_parto', '<=', $filtros['hasta']);
    }

    /**
     * @param  array<string, mixed>  $filtros
     */
    private function contarNacimientos(array $filtros, string $estado): int
    {
        return (clone $this->nacimientosQuery($filtros))
            ->where('nacimientos.estado_nacimiento', $estado)
            ->count();
    }

    /**
     * @param  array<string, mixed>  $filtros
     */
    private function contarSalidasPorNombre(array $filtros, string $nombre): int
    {
        return (int) DB::table('detalle_salidas')
            ->join('salidas', 'salidas.id', '=', 'detalle_salidas.salida_id')
            ->join('tipos_salidas', 'tipos_salidas.id', '=', 'salidas.tipo_salida_id')
            ->where('tipos_salidas.nombre', $nombre)
            ->whereDate('salidas.fecha_salida', '>=', $filtros['desde'])
            ->whereDate('salidas.fecha_salida', '<=', $filtros['hasta'])
            ->count();
    }

    private function contarLineas(string $detalle, string $cabecera, string $fk, string $fecha, string $desde, string $hasta): int
    {
        return (int) DB::table($detalle)
            ->join($cabecera, $cabecera.'.id', '=', $detalle.'.'.$fk)
            ->whereDate($cabecera.'.'.$fecha, '>=', $desde)
            ->whereDate($cabecera.'.'.$fecha, '<=', $hasta)
            ->count();
    }

    /**
     * @param  array<string, mixed>  $filtros
     * @return list<array{etiqueta: string, valor: string}>
     */
    private function filtrosInventario(array $filtros): array
    {
        $filas = [[
            'etiqueta' => 'Composición',
            'valor' => empty($filtros['estado'])
                ? 'Hato actual (excluye MUERTO y VENDIDO)'
                : 'Estado '.$filtros['estado'],
        ]];

        if (! empty($filtros['sexo'])) {
            $filas[] = ['etiqueta' => 'Sexo', 'valor' => $filtros['sexo'] === 'M' ? 'Machos' : 'Hembras'];
        }
        foreach (['raza_id' => 'Raza', 'categoria_id' => 'Categoría', 'estado_productivo_id' => 'Estado productivo', 'lote_id' => 'Lote'] as $key => $etiqueta) {
            if (! empty($filtros[$key])) {
                $filas[] = ['etiqueta' => $etiqueta, 'valor' => '#'.$filtros[$key]];
            }
        }

        return $filas;
    }

    /**
     * @param  array<string, mixed>  $filtros
     * @return array{etiqueta: string, valor: string}
     */
    private function periodo(array $filtros): array
    {
        return [
            'etiqueta' => 'Periodo',
            'valor' => $this->fecha($filtros['desde']).' – '.$this->fecha($filtros['hasta']),
        ];
    }

    /**
     * @param  list<array{etiqueta: string, valor: string}>  $filtros
     * @param  list<array{etiqueta: string, valor: string}>  $totales
     * @param  list<array{titulo: string, filas: list<array{etiqueta: string, total: string}>}>  $grupos
     * @param  array<string, mixed>  $detalle
     * @return array<string, mixed>
     */
    private function envoltorio(string $tipo, string $titulo, array $filtros, array $totales, array $grupos, array $detalle): array
    {
        return [
            'tipo' => $tipo,
            'titulo' => $titulo,
            'generado_en' => now()->format('d/m/Y H:i'),
            'filtros' => $filtros,
            'totales' => $totales,
            'grupos' => $grupos,
            'detalle' => $detalle,
        ];
    }

    /**
     * @return array{etiqueta: string, valor: string}
     */
    private function total(string $etiqueta, int|string $valor): array
    {
        return ['etiqueta' => $etiqueta, 'valor' => (string) $valor];
    }

    /**
     * @return array{titulo: string, filas: list<array{etiqueta: string, total: string}>}
     */
    private function grupo(Builder $query, string $expresion, string $titulo): array
    {
        $filas = $query
            ->selectRaw($expresion.' as etiqueta')
            ->selectRaw('COUNT(*) as total')
            ->groupByRaw($expresion)
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'etiqueta' => (string) ($row->etiqueta ?: '—'),
                'total' => (string) $row->total,
            ])
            ->all();

        return ['titulo' => $titulo, 'filas' => $filas];
    }

    /**
     * @param  array<int, mixed>  $groupBy
     * @return array{titulo: string, filas: list<array{etiqueta: string, total: string}>}
     */
    private function grupoJoin(Builder $query, string $expresion, array $groupBy, string $titulo): array
    {
        $filas = $query
            ->selectRaw($expresion.' as etiqueta')
            ->selectRaw('COUNT(*) as total')
            ->groupBy($groupBy)
            ->orderByDesc('total')
            ->get()
            ->map(fn ($row) => [
                'etiqueta' => (string) ($row->etiqueta ?: '—'),
                'total' => (string) $row->total,
            ])
            ->all();

        return ['titulo' => $titulo, 'filas' => $filas];
    }

    /**
     * @param  list<string>  $columnas
     * @param  array<string, mixed>  $filtros
     * @return array<string, mixed>
     */
    private function paginar(Builder $query, array $filtros, int $total, array $columnas, callable $map): array
    {
        $page = $this->pagina($filtros);
        $perPage = $this->porPagina($filtros);
        $filas = (clone $query)->forPage($page['page'], $perPage)->get()->map($map)->values()->all();

        return $this->detalleManual($columnas, $filas, $total, $page['page'], $perPage, $page['pdf']);
    }

    /**
     * @param  list<string>  $columnas
     * @param  list<list<string>>  $filas
     * @return array<string, mixed>
     */
    private function detalleManual(array $columnas, array $filas, int $total, int $page, int $perPage, bool $pdf): array
    {
        $last = max(1, (int) ceil($total / max(1, $perPage)));

        return [
            'columnas' => $columnas,
            'filas' => $filas,
            'meta' => [
                'current_page' => $page,
                'last_page' => $last,
                'per_page' => $perPage,
                'total' => $total,
                'from' => $total === 0 ? null : (($page - 1) * $perPage) + 1,
                'to' => $total === 0 ? null : min($page * $perPage, $total),
                'truncado' => $pdf && $total > $perPage,
            ],
        ];
    }

    /**
     * @param  array<string, mixed>  $filtros
     * @return array{page: int, pdf: bool}
     */
    private function pagina(array $filtros): array
    {
        $pdf = (bool) ($filtros['para_pdf'] ?? false);

        return [
            'page' => $pdf ? 1 : max(1, (int) ($filtros['page'] ?? 1)),
            'pdf' => $pdf,
        ];
    }

    /**
     * @param  array<string, mixed>  $filtros
     */
    private function porPagina(array $filtros): int
    {
        if (! empty($filtros['para_pdf'])) {
            return 200;
        }

        return min(100, max(1, (int) ($filtros['per_page'] ?? 25)));
    }

    private function fecha(mixed $value): string
    {
        if ($value === null || $value === '') {
            return '—';
        }

        return Carbon::parse($value)->format('d/m/Y');
    }
}
