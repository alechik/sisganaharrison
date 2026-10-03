<?php

namespace App\Services;

use App\Models\Animal;
use App\Models\AnimalEvento;
use App\Models\DetalleEventoSanitario;
use App\Models\DetalleIngreso;
use App\Models\DetallePesaje;
use App\Models\DetalleSalida;
use App\Models\DetalleTraspaso;
use App\Models\Gestacion;
use App\Models\Nacimiento;
use App\Models\Parto;
use App\Models\ServicioReproductivo;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;

class AnimalHistorialService
{
    public const TIPOS = [
        'INGRESO',
        'NACIMIENTO',
        'PESAJE',
        'SANITARIO',
        'SERVICIO',
        'GESTACION',
        'PARTO',
        'TRASPASO',
        'VENTA_RESERVA',
        'LIBERACION_VENTA',
        'SALIDA',
        'OTRO',
    ];

    /**
     * @param  array<string, mixed>  $filtros
     * @return array{data: list<array<string, mixed>>, meta: array<string, mixed>}
     */
    public function historial(Animal $animal, array $filtros): array
    {
        $tipos = array_values(array_filter(
            array_map('strval', $filtros['tipo'] ?? []),
            fn (string $tipo) => $tipo !== ''
        ));
        $desde = isset($filtros['desde']) && $filtros['desde'] !== '' ? (string) $filtros['desde'] : null;
        $hasta = isset($filtros['hasta']) && $filtros['hasta'] !== '' ? (string) $filtros['hasta'] : null;
        $page = max(1, (int) ($filtros['page'] ?? 1));
        $perPage = max(1, (int) ($filtros['per_page'] ?? 50));

        /** @var Collection<int, array<string, mixed>> $items */
        $items = collect();

        if ($this->incluyeTipo($tipos, 'INGRESO')) {
            $items = $items->concat($this->fromIngresos($animal, $desde, $hasta));
        }
        if ($this->incluyeTipo($tipos, 'NACIMIENTO')) {
            $items = $items->concat($this->fromNacimientos($animal, $desde, $hasta));
        }
        if ($this->incluyeTipo($tipos, 'PESAJE')) {
            $items = $items->concat($this->fromPesajes($animal, $desde, $hasta));
        }
        if ($this->incluyeTipo($tipos, 'SANITARIO')) {
            $items = $items->concat($this->fromSanitarios($animal, $desde, $hasta));
        }
        if ($this->incluyeTipo($tipos, 'SERVICIO')) {
            $items = $items->concat($this->fromServicios($animal, $desde, $hasta));
        }
        if ($this->incluyeTipo($tipos, 'GESTACION')) {
            $items = $items->concat($this->fromGestaciones($animal, $desde, $hasta));
        }
        if ($this->incluyeTipo($tipos, 'PARTO')) {
            $items = $items->concat($this->fromPartos($animal, $desde, $hasta));
        }
        if ($this->incluyeTipo($tipos, 'TRASPASO')) {
            $items = $items->concat($this->fromTraspasos($animal, $desde, $hasta));
        }
        if ($this->incluyeTipo($tipos, 'SALIDA')) {
            $items = $items->concat($this->fromSalidas($animal, $desde, $hasta));
        }
        if ($this->incluyeAlgunTipo($tipos, ['VENTA_RESERVA', 'LIBERACION_VENTA', 'OTRO'])) {
            $items = $items->concat($this->fromAnimalEventos($animal, $tipos, $desde, $hasta));
        }

        $ordenados = $items
            ->sort(function (array $a, array $b): int {
                $fecha = strcmp((string) $b['fecha'], (string) $a['fecha']);
                if ($fecha !== 0) {
                    return $fecha;
                }

                return ((int) $b['sort_id']) <=> ((int) $a['sort_id']);
            })
            ->values();

        $total = $ordenados->count();
        $pageItems = $ordenados
            ->slice(($page - 1) * $perPage, $perPage)
            ->values()
            ->map(function (array $item): array {
                unset($item['sort_id']);

                return $item;
            })
            ->all();

        return [
            'data' => $pageItems,
            'meta' => [
                'total' => $total,
                'animal' => [
                    'id' => $animal->id,
                    'codigo' => $animal->codigo,
                    'arete' => $animal->arete,
                ],
            ],
        ];
    }

    /**
     * @param  list<string>  $tipos
     */
    private function incluyeTipo(array $tipos, string $tipo): bool
    {
        return $tipos === [] || in_array($tipo, $tipos, true);
    }

    /**
     * @param  list<string>  $tipos
     * @param  list<string>  $candidatos
     */
    private function incluyeAlgunTipo(array $tipos, array $candidatos): bool
    {
        if ($tipos === []) {
            return true;
        }

        return array_intersect($tipos, $candidatos) !== [];
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fromIngresos(Animal $animal, ?string $desde, ?string $hasta): array
    {
        $query = DetalleIngreso::query()
            ->select(['id', 'ingreso_id', 'animal_id', 'peso_ingreso', 'precio_compra'])
            ->where('animal_id', $animal->id)
            ->with([
                'ingreso:id,fecha_ingreso,proveedor_id,lote_id,codigo',
                'ingreso.proveedor:id,razon_social',
                'ingreso.lote:id,nombre',
            ]);

        $this->filtrarFechaRelacion($query, 'ingreso', 'fecha_ingreso', $desde, $hasta);

        return $query->get()->map(function (DetalleIngreso $detalle): array {
            $ingreso = $detalle->ingreso;
            $fecha = $this->formatDate($ingreso?->fecha_ingreso);
            $proveedor = $ingreso?->proveedor?->razon_social;
            $lote = $ingreso?->lote?->nombre;

            return $this->item(
                'ingreso-'.$detalle->id,
                'INGRESO',
                $fecha,
                'Ingreso al inventario',
                $proveedor ? 'Proveedor: '.$proveedor : ($ingreso?->codigo ? 'Ingreso '.$ingreso->codigo : null),
                [
                    'fecha_ingreso' => $fecha,
                    'proveedor' => $proveedor,
                    'peso_ingreso' => $detalle->peso_ingreso !== null ? (float) $detalle->peso_ingreso : null,
                    'precio_compra' => $detalle->precio_compra !== null ? (float) $detalle->precio_compra : null,
                    'lote' => $lote,
                    'ingreso_codigo' => $ingreso?->codigo,
                ],
                'ingresos',
                (int) ($ingreso?->id ?? $detalle->ingreso_id),
                $detalle->id
            );
        })->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fromNacimientos(Animal $animal, ?string $desde, ?string $hasta): array
    {
        $query = Nacimiento::query()
            ->select(['id', 'parto_id', 'animal_id', 'peso_nacimiento', 'sexo', 'estado_nacimiento'])
            ->where('animal_id', $animal->id)
            ->with([
                'parto:id,gestacion_id,fecha_parto',
                'parto.gestacion:id,servicio_id',
                'parto.gestacion.servicio:id,hembra_id',
                'parto.gestacion.servicio.hembra:id,codigo,nombre',
            ]);

        $this->filtrarFechaRelacion($query, 'parto', 'fecha_parto', $desde, $hasta);

        return $query->get()->map(function (Nacimiento $nacimiento): array {
            $parto = $nacimiento->parto;
            $hembra = $parto?->gestacion?->servicio?->hembra;
            $madre = $hembra?->nombre ?: $hembra?->codigo;
            $fecha = $this->formatDate($parto?->fecha_parto);

            return $this->item(
                'nacimiento-'.$nacimiento->id,
                'NACIMIENTO',
                $fecha,
                'Nacimiento',
                $madre ? 'Madre: '.$madre : null,
                [
                    'fecha_parto' => $fecha,
                    'peso_nacimiento' => $nacimiento->peso_nacimiento !== null ? (float) $nacimiento->peso_nacimiento : null,
                    'madre' => $madre,
                    'sexo' => $nacimiento->sexo,
                    'estado_nacimiento' => $nacimiento->estado_nacimiento,
                ],
                'nacimientos',
                $nacimiento->id,
                $nacimiento->id
            );
        })->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fromPesajes(Animal $animal, ?string $desde, ?string $hasta): array
    {
        $query = DetallePesaje::query()
            ->select(['id', 'pesaje_id', 'animal_id', 'lote_id', 'peso'])
            ->where('animal_id', $animal->id)
            ->with([
                'pesaje:id,fecha_pesaje',
                'lote:id,nombre',
            ]);

        $this->filtrarFechaRelacion($query, 'pesaje', 'fecha_pesaje', $desde, $hasta);

        return $query->get()->map(function (DetallePesaje $detalle): array {
            $fecha = $this->formatDate($detalle->pesaje?->fecha_pesaje);
            $lote = $detalle->lote?->nombre;
            $peso = $detalle->peso !== null ? (float) $detalle->peso : null;

            return $this->item(
                'pesaje-'.$detalle->id,
                'PESAJE',
                $fecha,
                'Pesaje'.($peso !== null ? ' · '.$peso.' kg' : ''),
                $lote ? 'Lote: '.$lote : null,
                [
                    'fecha_pesaje' => $fecha,
                    'peso' => $peso,
                    'lote' => $lote,
                ],
                'pesajes',
                (int) ($detalle->pesaje?->id ?? $detalle->pesaje_id),
                $detalle->id
            );
        })->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fromSanitarios(Animal $animal, ?string $desde, ?string $hasta): array
    {
        $query = DetalleEventoSanitario::query()
            ->select(['id', 'evento_sanitario_id', 'animal_id', 'medicamento_id', 'peso_animal'])
            ->where('animal_id', $animal->id)
            ->with([
                'eventoSanitario:id,tipo_evento_id,fecha,diagnostico,tratamiento',
                'eventoSanitario.tipoEvento:id,nombre',
                'medicamento:id,nombre',
            ]);

        $this->filtrarFechaRelacion($query, 'eventoSanitario', 'fecha', $desde, $hasta);

        return $query->get()->map(function (DetalleEventoSanitario $detalle): array {
            $evento = $detalle->eventoSanitario;
            $tipo = $evento?->tipoEvento?->nombre;
            $fecha = $this->formatDate($evento?->fecha);

            return $this->item(
                'sanitario-'.$detalle->id,
                'SANITARIO',
                $fecha,
                $tipo ? 'Evento sanitario · '.$tipo : 'Evento sanitario',
                $detalle->medicamento?->nombre ? 'Medicamento: '.$detalle->medicamento->nombre : $evento?->diagnostico,
                [
                    'fecha' => $fecha,
                    'tipo_evento' => $tipo,
                    'medicamento' => $detalle->medicamento?->nombre,
                    'diagnostico' => $evento?->diagnostico,
                    'tratamiento' => $evento?->tratamiento,
                    'peso_animal' => $detalle->peso_animal !== null ? (float) $detalle->peso_animal : null,
                ],
                'eventos-sanitarios',
                (int) ($evento?->id ?? $detalle->evento_sanitario_id),
                $detalle->id
            );
        })->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fromServicios(Animal $animal, ?string $desde, ?string $hasta): array
    {
        $query = ServicioReproductivo::query()
            ->select(['id', 'hembra_id', 'macho_id', 'fecha_servicio', 'tipo_servicio', 'resultado'])
            ->where(function (Builder $builder) use ($animal): void {
                $builder->where('hembra_id', $animal->id)
                    ->orWhere('macho_id', $animal->id);
            })
            ->with([
                'hembra:id,codigo,nombre',
                'macho:id,codigo,nombre',
            ]);

        $this->filtrarFecha($query, 'fecha_servicio', $desde, $hasta);

        return $query->get()->map(function (ServicioReproductivo $servicio) use ($animal): array {
            $rol = (int) $servicio->hembra_id === (int) $animal->id ? 'HEMBRA' : 'MACHO';
            $fecha = $this->formatDate($servicio->fecha_servicio);
            $contraparte = $rol === 'HEMBRA'
                ? ($servicio->macho?->nombre ?: $servicio->macho?->codigo)
                : ($servicio->hembra?->nombre ?: $servicio->hembra?->codigo);

            return $this->item(
                'servicio-'.$servicio->id,
                'SERVICIO',
                $fecha,
                'Servicio reproductivo · '.$servicio->tipo_servicio,
                $contraparte ? 'Contraparte: '.$contraparte : null,
                [
                    'fecha_servicio' => $fecha,
                    'tipo' => $servicio->tipo_servicio,
                    'resultado' => $servicio->resultado,
                    'rol' => $rol,
                ],
                'servicios-reproductivos',
                $servicio->id,
                $servicio->id
            );
        })->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fromGestaciones(Animal $animal, ?string $desde, ?string $hasta): array
    {
        $query = Gestacion::query()
            ->select(['id', 'servicio_id', 'fecha_confirmacion', 'fecha_probable_parto', 'estado'])
            ->whereHas('servicio', fn (Builder $builder) => $builder->where('hembra_id', $animal->id))
            ->with(['servicio:id,hembra_id,fecha_servicio']);

        if ($desde !== null) {
            $query->where(function (Builder $builder) use ($desde): void {
                $builder->whereDate('fecha_confirmacion', '>=', $desde)
                    ->orWhere(function (Builder $inner) use ($desde): void {
                        $inner->whereNull('fecha_confirmacion')
                            ->whereDate('fecha_probable_parto', '>=', $desde);
                    });
            });
        }
        if ($hasta !== null) {
            $query->where(function (Builder $builder) use ($hasta): void {
                $builder->whereDate('fecha_confirmacion', '<=', $hasta)
                    ->orWhere(function (Builder $inner) use ($hasta): void {
                        $inner->whereNull('fecha_confirmacion')
                            ->whereDate('fecha_probable_parto', '<=', $hasta);
                    });
            });
        }

        return $query->get()->map(function (Gestacion $gestacion): ?array {
            $fecha = $this->formatDate($gestacion->fecha_confirmacion)
                ?? $this->formatDate($gestacion->fecha_probable_parto);
            if ($fecha === null) {
                return null;
            }

            return $this->item(
                'gestacion-'.$gestacion->id,
                'GESTACION',
                $fecha,
                'Gestación · '.$gestacion->estado,
                $gestacion->fecha_probable_parto
                    ? 'Fecha probable de parto: '.$this->formatDate($gestacion->fecha_probable_parto)
                    : null,
                [
                    'fecha_confirmacion' => $this->formatDate($gestacion->fecha_confirmacion),
                    'fecha_probable_parto' => $this->formatDate($gestacion->fecha_probable_parto),
                    'estado' => $gestacion->estado,
                ],
                'gestaciones',
                $gestacion->id,
                $gestacion->id
            );
        })->filter()->values()->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fromPartos(Animal $animal, ?string $desde, ?string $hasta): array
    {
        $query = Parto::query()
            ->select(['id', 'gestacion_id', 'fecha_parto', 'estado'])
            ->whereHas(
                'gestacion.servicio',
                fn (Builder $builder) => $builder->where('hembra_id', $animal->id)
            )
            ->with(['gestacion:id,servicio_id']);

        $this->filtrarFecha($query, 'fecha_parto', $desde, $hasta);

        return $query->get()->map(function (Parto $parto): array {
            $fecha = $this->formatDate($parto->fecha_parto);

            return $this->item(
                'parto-'.$parto->id,
                'PARTO',
                $fecha,
                'Parto',
                $parto->estado ? 'Estado: '.$parto->estado : null,
                [
                    'fecha_parto' => $fecha,
                    'estado' => $parto->estado,
                ],
                'partos',
                $parto->id,
                $parto->id
            );
        })->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fromTraspasos(Animal $animal, ?string $desde, ?string $hasta): array
    {
        $query = DetalleTraspaso::query()
            ->select(['id', 'traspaso_id', 'animal_id'])
            ->where('animal_id', $animal->id)
            ->with([
                'traspaso:id,fecha_traspaso,lote_salida_id,lote_ingreso_id',
                'traspaso.loteSalida:id,nombre',
                'traspaso.loteIngreso:id,nombre',
            ]);

        $this->filtrarFechaRelacion($query, 'traspaso', 'fecha_traspaso', $desde, $hasta);

        return $query->get()->map(function (DetalleTraspaso $detalle): array {
            $traspaso = $detalle->traspaso;
            $origen = $traspaso?->loteSalida?->nombre;
            $destino = $traspaso?->loteIngreso?->nombre;
            $fecha = $this->formatDate($traspaso?->fecha_traspaso);

            return $this->item(
                'traspaso-'.$detalle->id,
                'TRASPASO',
                $fecha,
                'Traspaso de lote',
                ($origen || $destino) ? trim(($origen ?? '—').' → '.($destino ?? '—')) : null,
                [
                    'fecha_traspaso' => $fecha,
                    'lote_origen' => $origen,
                    'lote_destino' => $destino,
                ],
                'traspasos',
                (int) ($traspaso?->id ?? $detalle->traspaso_id),
                $detalle->id
            );
        })->all();
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fromSalidas(Animal $animal, ?string $desde, ?string $hasta): array
    {
        $query = DetalleSalida::query()
            ->select(['id', 'salida_id', 'animal_id'])
            ->where('animal_id', $animal->id)
            ->with([
                'salida:id,fecha_salida,tipo_salida_id,codigo',
                'salida.tipoSalida:id,nombre',
            ]);

        $this->filtrarFechaRelacion($query, 'salida', 'fecha_salida', $desde, $hasta);

        return $query->get()->map(function (DetalleSalida $detalle): array {
            $salida = $detalle->salida;
            $tipo = $salida?->tipoSalida?->nombre;
            $fecha = $this->formatDate($salida?->fecha_salida);

            return $this->item(
                'salida-'.$detalle->id,
                'SALIDA',
                $fecha,
                $tipo ? 'Salida · '.$tipo : 'Salida',
                $salida?->codigo ? 'Código: '.$salida->codigo : null,
                [
                    'fecha_salida' => $fecha,
                    'tipo_salida' => $tipo,
                    'codigo' => $salida?->codigo,
                ],
                'salidas',
                (int) ($salida?->id ?? $detalle->salida_id),
                $detalle->id
            );
        })->all();
    }

    /**
     * @param  list<string>  $tipos
     * @return list<array<string, mixed>>
     */
    private function fromAnimalEventos(Animal $animal, array $tipos, ?string $desde, ?string $hasta): array
    {
        $query = AnimalEvento::query()
            ->select(['id', 'animal_id', 'tipo', 'fecha', 'descripcion', 'metadata'])
            ->where('animal_id', $animal->id)
            ->whereNotIn('tipo', [AnimalEvento::TIPO_INGRESO, AnimalEvento::TIPO_SALIDA]);

        $this->filtrarFecha($query, 'fecha', $desde, $hasta);

        return $query->get()
            ->map(function (AnimalEvento $evento) use ($tipos): ?array {
                $tipoApi = match ($evento->tipo) {
                    AnimalEvento::TIPO_RESERVA_VENTA => 'VENTA_RESERVA',
                    AnimalEvento::TIPO_LIBERACION_VENTA => 'LIBERACION_VENTA',
                    default => 'OTRO',
                };

                if (! $this->incluyeTipo($tipos, $tipoApi)) {
                    return null;
                }

                $metadata = is_array($evento->metadata) ? $evento->metadata : [];
                $ventaId = isset($metadata['venta_id']) ? (int) $metadata['venta_id'] : null;
                $fecha = $this->formatDate($evento->fecha);
                $titulo = match ($tipoApi) {
                    'VENTA_RESERVA' => 'Reserva de venta',
                    'LIBERACION_VENTA' => 'Liberación de venta',
                    default => 'Evento · '.$evento->tipo,
                };

                return $this->item(
                    'evento-'.$evento->id,
                    $tipoApi,
                    $fecha,
                    $titulo,
                    $evento->descripcion,
                    [
                        'tipo_origen' => $evento->tipo,
                        'metadata' => $metadata,
                    ],
                    $ventaId ? 'ventas' : 'animal-eventos',
                    $ventaId ?: $evento->id,
                    $evento->id
                );
            })
            ->filter()
            ->values()
            ->all();
    }

    /**
     * @param  Builder<\Illuminate\Database\Eloquent\Model>  $query
     */
    private function filtrarFecha(Builder $query, string $columna, ?string $desde, ?string $hasta): void
    {
        if ($desde !== null) {
            $query->whereDate($columna, '>=', $desde);
        }
        if ($hasta !== null) {
            $query->whereDate($columna, '<=', $hasta);
        }
    }

    /**
     * @param  Builder<\Illuminate\Database\Eloquent\Model>  $query
     */
    private function filtrarFechaRelacion(
        Builder $query,
        string $relacion,
        string $columna,
        ?string $desde,
        ?string $hasta
    ): void {
        if ($desde === null && $hasta === null) {
            return;
        }

        $query->whereHas($relacion, function (Builder $builder) use ($columna, $desde, $hasta): void {
            $this->filtrarFecha($builder, $columna, $desde, $hasta);
        });
    }

    private function formatDate(mixed $fecha): ?string
    {
        if ($fecha instanceof CarbonInterface) {
            return $fecha->format('Y-m-d');
        }

        if (is_string($fecha) && $fecha !== '') {
            return substr($fecha, 0, 10);
        }

        return null;
    }

    /**
     * @param  array<string, mixed>  $detalle
     * @return array<string, mixed>
     */
    private function item(
        string $id,
        string $tipo,
        ?string $fecha,
        string $titulo,
        ?string $descripcion,
        array $detalle,
        string $modulo,
        int $referenciaId,
        int $sortId
    ): array {
        return [
            'id' => $id,
            'tipo' => $tipo,
            'fecha' => $fecha ?? '',
            'titulo' => $titulo,
            'descripcion' => $descripcion,
            'detalle' => $detalle,
            'referencia' => [
                'modulo' => $modulo,
                'id' => $referenciaId,
            ],
            'sort_id' => $sortId,
        ];
    }
}
